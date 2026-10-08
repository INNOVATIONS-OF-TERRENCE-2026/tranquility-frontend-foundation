import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "charge.refunded",
  "charge.dispute.created",
]);
function client() {
  const raw=Deno.env.get("SUPABASE_SECRET_KEYS");
  const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || (raw?JSON.parse(raw).default:null);
  const url=Deno.env.get("SUPABASE_URL");
  if(!key || !url) throw new Error("SUPABASE_NOT_CONFIGURED");
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
function hex(bytes:Uint8Array) {
  return Array.from(bytes).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function same(a:string,b:string) {
  if(a.length!==b.length) return false;
  let difference=0;
  for(let i=0;i<a.length;i++) difference|=a.charCodeAt(i)^b.charCodeAt(i);
  return difference===0;
}
async function verify(payload:string,header:string,secret:string) {
  const parts=header.split(",").map(p=>p.trim().split("="));
  const timestamp=parts.find(([name])=>name==="t")?.[1]??"";
  const signatures=parts.filter(([name])=>name==="v1").map(([,v])=>v);
  const t=Number(timestamp);
  if(!Number.isSafeInteger(t) || Math.abs(Date.now()/1000-t)>300 || signatures.length===0) return false;
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),
    {name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const mac=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(timestamp+"."+payload));
  const expected=hex(new Uint8Array(mac));
  return signatures.some(s=>same(s,expected));
}
function json(body:unknown,status=200) {
  return new Response(JSON.stringify(body),{
    status,headers:{"content-type":"application/json","cache-control":"no-store"},
  });
}
Deno.serve(async(req:Request)=>{
  if(req.method!=="POST") return json({error:"method_not_allowed"},405);
  const secret=Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if(!secret) return json({error:"not_configured"},503);
  const raw=await req.text();
  if(raw.length>500000) return json({error:"payload_too_large"},413);
  if(!(await verify(raw,req.headers.get("stripe-signature")??"",secret)))
    return json({error:"invalid_signature"},400);
  let event:any;
  try{event=JSON.parse(raw);}catch{return json({error:"invalid_json"},400);}
  if(!event?.id || !event?.type || !ALLOWED.has(event.type)) return json({received:true});
  const object=event.data?.object;
  if(!object?.id) return json({error:"invalid_event"},400);
  const admin=client();
  try{
    if(event.type.startsWith("checkout.session.")) {
      const reservationId=object.metadata?.reservation_id??object.client_reference_id;
      if(!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(reservationId??""))
        throw new Error("missing reservation id");
      if(!String(object.id).startsWith("cs_")) throw new Error("wrong Stripe resource");
      const success=event.type==="checkout.session.async_payment_succeeded" ||
        (event.type==="checkout.session.completed" && object.payment_status==="paid");
      const paymentIntent=success && typeof object.payment_intent==="string"
        ?object.payment_intent:null;
      if(success && !paymentIntent) throw new Error("paid session missing payment intent");
      const subtotal=Number(object.amount_subtotal??0);
      const total=Number(object.amount_total??0);
      const tax=Number(object.total_details?.amount_tax??0);
      const {data,error}=await admin.rpc("apply_stripe_checkout_event",{
        p_event_id:event.id,p_type:event.type,p_reservation_id:reservationId,
        p_session_id:object.id,p_payment_intent:paymentIntent,
        p_subtotal_cents:subtotal,p_total_cents:total,p_tax_cents:tax,
        p_currency:object.currency??"",p_livemode:Boolean(event.livemode),
      });
      if(error) throw error;
      return json({received:true,result:data});
    }
    // Refund/dispute updates remain separate from the scheduled service allocation.
    // A payment refund must not silently reopen an appointment slot.
    const intent=String(object.payment_intent??"");
    if(!intent.startsWith("pi_")) return json({received:true,ignored:"no_payment_intent"});
    const {data:reservation,error:lookupError}=await admin.from("checkout_reservations")
      .select("id,status,paid_cents,refunded_cents")
      .eq("stripe_payment_intent_id",intent).single();
    if(lookupError || !reservation) throw new Error("payment not yet reconciled");
    const {data:existing}=await admin.from("stripe_webhook_events")
      .select("stripe_event_id").eq("stripe_event_id",event.id).maybeSingle();
    if(existing) return json({received:true,result:"already_processed"});
    const refund=event.type==="charge.refunded";
    const newRefund=refund?Math.max(Number(object.amount_refunded??0),reservation.refunded_cents):reservation.refunded_cents;
    const newStatus=refund
      ?(newRefund>=Number(reservation.paid_cents??Infinity)?"refunded":reservation.status)
      :"disputed";
    const {error:updateError}=await admin.from("checkout_reservations")
      .update({status:newStatus,refunded_cents:newRefund,updated_at:new Date().toISOString()})
      .eq("id",reservation.id);
    if(updateError) throw updateError;
    const {error:logError}=await admin.from("stripe_webhook_events").insert({
      stripe_event_id:event.id,event_type:event.type,reservation_id:reservation.id,
    });
    if(logError?.code!=="23505" && logError) throw logError;
    return json({received:true});
  }catch(error){
    console.error("Stripe webhook fulfillment failure",event.id,event.type,
      error instanceof Error?error.message:"unknown");
    return json({error:"fulfillment_failed"},500);
  }
});
