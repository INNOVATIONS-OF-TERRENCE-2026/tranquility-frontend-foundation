import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type Service = "standard" | "deep" | "move";
type Frequency = "onetime" | "weekly" | "biweekly" | "monthly";
const ORIGINS = new Set(["https://heytlcleaning.com", "https://www.heytlcleaning.com"]);
const BASE: Record<Service, number> = { standard: 14500, deep: 21500, move: 23500 };
const FREQUENCY: Record<Frequency, number> = { onetime: 0, weekly: 20, biweekly: 15, monthly: 10 };
const VARIABLE: Record<string, Record<Service, number>> = {
  "extra-bedroom": { standard: 1500, deep: 2700, move: 3700 },
  "extra-full-bath": { standard: 1700, deep: 2900, move: 3900 },
  "half-bath": { standard: 1300, deep: 2500, move: 3700 },
  "laundry-room": { standard: 1000, deep: 1700, move: 2200 },
};
const FIXED: Record<string, number> = {
  "living-room": 1500, "dining-room": 1500, office: 1200,
  "laundry-wdf": 2000, "laundry-fold": 1300, dishes: 2500,
  oven: 4000, fridge: 2500, hood: 4500, cabinets: 3500,
  "pet-hair": 1500, baseboards: 2500, "garage-patio": 3500, "carpet-spot": 3500,
};
const SELECTABLE = new Set(["laundry-wdf","laundry-fold","dishes","oven","fridge","hood","cabinets","pet-hair","baseboards","garage-patio","carpet-spot"]);
const STARTING_AT = new Set(["hood","baseboards","carpet-spot"]);
const WINDOWS = new Set(["morning","midday","afternoon"]);
const SERVICES = new Set(["standard","deep","move"]);
const FREQUENCIES = new Set(["onetime","weekly","biweekly","monthly"]);
const now = () => Math.floor(Date.now() / 1000);
function response(body: unknown, status=200, origin="") {
  return new Response(JSON.stringify(body), {
    status, headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(ORIGINS.has(origin) ? { "access-control-allow-origin": origin, vary: "Origin" } : {}),
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
    },
  });
}
function fail(code: string, status=400): never {
  const error = new Error(code);
  Object.assign(error, { status });
  throw error;
}
function value(raw: unknown, max=255) {
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}
function int(raw: unknown, min: number, max: number) {
  if (!Number.isInteger(raw) || Number(raw) < min || Number(raw) > max) fail("INVALID_QUANTITY");
  return Number(raw);
}
function calculate(input: any) {
  const service = input.service as Service;
  const frequency = input.frequency as Frequency;
  if (!SERVICES.has(service) || !FREQUENCIES.has(frequency)) fail("INVALID_SERVICE");
  if (service !== "standard" && frequency !== "onetime") fail("INVALID_FREQUENCY");
  const scope = input.scope ?? {};
  const fields: [string,string,number][] = [
    ["bedrooms","extra-bedroom",1],
    ["fullBaths","extra-full-bath",1],
    ["halfBaths","half-bath",0],
    ["livingRooms","living-room",0],
    ["diningRooms","dining-room",0],
    ["offices","office",0],
    ["laundryRooms","laundry-room",0],
  ];
  let addOnCents=0;
  for (const [field,id,minimum] of fields) {
    const qty=int(scope[field],minimum,20)-minimum;
    if (id==="extra-full-bath" && qty>0) fail("CUSTOM_QUOTE_REQUIRED",422);
    addOnCents+=qty*(VARIABLE[id]?.[service] ?? FIXED[id]);
  }
  const extras = input.extras ?? {};
  if (!extras || typeof extras !== "object" || Array.isArray(extras)) fail("INVALID_EXTRAS");
  for(const [id,raw] of Object.entries(extras)) {
    if (!SELECTABLE.has(id)) fail("INVALID_ADDON");
    const qty=int(raw,0,10);
    if (qty>0 && STARTING_AT.has(id)) fail("CUSTOM_QUOTE_REQUIRED",422);
    addOnCents+=qty*FIXED[id];
  }
  if (input.partialHome === true || (input.sqft != null && Number(input.sqft)>=3000)) {
    fail("CUSTOM_QUOTE_REQUIRED",422);
  }
  if (input.sqft != null && (!Number.isFinite(Number(input.sqft)) || Number(input.sqft)<0 || Number(input.sqft)>100000)) fail("INVALID_SCOPE");
  // Match the website's approved whole-dollar discounted service price.
  const baseCents=Math.round((BASE[service]/100)*(100-FREQUENCY[frequency])/100)*100;
  const totalCents=baseCents+addOnCents;
  if (!Number.isSafeInteger(totalCents) || totalCents<=0) fail("INVALID_PRICE");
  return { service,frequency,totalCents,baseCents,addOnCents };
}
function validate(input: any) {
  const price=calculate(input);
  const d=value(input.serviceDate,10), window=value(input.arrivalWindow,20);
  if (!/^\d{4}-\d\d-\d\d$/.test(d) || !WINDOWS.has(window)) fail("INVALID_DATE");
  const dt=new Date(d+"T12:00:00Z");
  if (Number.isNaN(dt.valueOf()) || dt.toISOString().slice(0,10)!==d || [0,6].includes(dt.getUTCDay())) fail("INVALID_DATE");
  const customer=input.customer??{};
  const name=value(customer.name,100), email=value(customer.email,255).toLowerCase();
  const phone=value(customer.phone,30), address=value(customer.address,240);
  const city=value(customer.city,100), zip=value(customer.zip,5);
  if (name.length<2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phone.replace(/\D/g,"").length<10 || address.length<4 ||
      city.length<2 || !/^\d{5}$/.test(zip)) fail("INVALID_CUSTOMER");
  if (input.website) fail("REQUEST_REJECTED");
  return { ...price, date:d,window,customer:{name,email,phone,address,city,zip} };
}
function supabaseAdmin() {
  const url=Deno.env.get("SUPABASE_URL");
  const legacy=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const modern=Deno.env.get("SUPABASE_SECRET_KEYS");
  const key=legacy || (modern ? JSON.parse(modern).default : null);
  if (!url || !key) fail("BACKEND_NOT_CONFIGURED",503);
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
function stripeConfig() {
  const key=Deno.env.get("STRIPE_SECRET_KEY")??"";
  if (!Deno.env.get("STRIPE_CHECKOUT_ENABLED") || Deno.env.get("STRIPE_CHECKOUT_ENABLED")!=="true") fail("CHECKOUT_NOT_ENABLED",503);
  if (!/^sk_(test|live)_/.test(key)) fail("STRIPE_SECRET_MISSING",503);
  if (key.startsWith("sk_live_") && Deno.env.get("STRIPE_LIVE_APPROVED")!=="true") fail("LIVE_NOT_APPROVED",503);
  if (Deno.env.get("STRIPE_TAX_CONFIRMED")!=="true") fail("TAX_CONFIGURATION_REQUIRED",503);
  const ids={
    standard: Deno.env.get("STRIPE_PRODUCT_STANDARD")??"",
    deep: Deno.env.get("STRIPE_PRODUCT_DEEP")??"",
    move: Deno.env.get("STRIPE_PRODUCT_MOVE")??"",
  };
  return {key,ids};
}
async function stripeRequest(key: string, path: string, body?: URLSearchParams, idempotency?: string) {
  const r=await fetch("https://api.stripe.com/v1/"+path,{
    method:body?"POST":"GET",
    headers:{
      Authorization:"Bearer "+key,
      ...(body?{"Content-Type":"application/x-www-form-urlencoded"}:{}),
      ...(idempotency?{"Idempotency-Key":idempotency}:{}),
    },
    ...(body?{body:body.toString()}:{}),
  });
  const data=await r.json();
  if(!r.ok) {
    console.error("Stripe rejected request",r.status,data?.error?.type);
    fail("STRIPE_REQUEST_FAILED",502);
  }
  return data;
}
async function hash(input:string) {
  const bytes=new TextEncoder().encode(input);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function createCheckout(req:Request, input:any) {
  const {key,ids}=stripeConfig();
  const data=validate(input.data??{});
  const attempt=value(input.idempotencyKey,64);
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(attempt)) fail("INVALID_IDEMPOTENCY_KEY");
  const admin=supabaseAdmin();
  const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"unknown";
  const {data:rate,error:rateError}=await admin.rpc("consume_submission_attempt",{
    p_kind:"booking",p_fingerprint_hash:await hash("stripe-checkout:"+ip),p_limit:10,p_window:"00:15:00",
  });
  if(rateError || !rate) fail("RATE_LIMITED",429);
  const payload={
    service:data.service,frequency:data.frequency,scope:input.data.scope,
    extras:input.data.extras,sqft:input.data.sqft??null,
    partialHome:Boolean(input.data.partialHome),pets:input.data.pets??"no",
    petDetails:value(input.data.petDetails,500),otherSpaces:value(input.data.otherSpaces,500),
    notes:value(input.data.notes,1200),language:input.data.language==="es"?"es":"en",
    estimate:{totalCents:data.totalCents,baseCents:data.baseCents,addOnCents:data.addOnCents},
  };
  const reference="TLC-"+crypto.randomUUID().slice(0,8).toUpperCase();
  const {data:reservationId,error}=await admin.rpc("reserve_stripe_checkout",{
    p_idempotency_key:attempt,p_reference:reference,p_service_type:data.service,
    p_frequency:data.frequency,p_date:data.date,p_window:data.window,
    p_name:data.customer.name,p_email:data.customer.email,p_phone:data.customer.phone,
    p_address:data.customer.address,p_city:data.customer.city,p_zip:data.customer.zip,
    p_estimate_cents:data.totalCents,p_payload:payload,
  });
  if(error) {
    if(/SLOT_UNAVAILABLE|UNSUPPORTED_SERVICE_CITY/i.test(error.message)) fail(error.message,409);
    if(/CHECKOUT_KEY_CONFLICT/i.test(error.message)) fail("CHECKOUT_KEY_CONFLICT",409);
    fail("BOOKING_RESERVATION_FAILED",503);
  }
  const {data:reservation,error:lookupError}=await admin.from("checkout_reservations")
    .select("id,booking_reference,status,stripe_session_id,checkout_url")
    .eq("id",reservationId).single();
  if(lookupError || !reservation) fail("RESERVATION_LOOKUP_FAILED",503);
  if(reservation.status==="awaiting_payment" && reservation.checkout_url)
    return {checkoutUrl:reservation.checkout_url,bookingReference:reservation.booking_reference};
  const productId=ids[data.service];
  if(!/^prod_[A-Za-z0-9]+$/.test(productId)) fail("STRIPE_PRODUCT_NOT_CONFIGURED",503);
  const product=await stripeRequest(key,"products/"+productId);
  if(product.active!==true || product.livemode!==(key.startsWith("sk_live_"))) fail("PRODUCT_ENVIRONMENT_MISMATCH",503);
  const account=await stripeRequest(key,"account");
  if(account.id!=="acct_1UO83aK5fdqZqrwT") fail("MERCHANT_ACCOUNT_MISMATCH",503);
  const params=new URLSearchParams();
  params.set("mode","payment");
  params.set("success_url","https://heytlcleaning.com/booking/success?session_id={CHECKOUT_SESSION_ID}");
  params.set("cancel_url","https://heytlcleaning.com/booking/cancelled");
  params.set("client_reference_id",reservationId);
  params.set("metadata[reservation_id]",reservationId);
  params.set("customer_email",data.customer.email);
  params.set("billing_address_collection","required");
  params.set("automatic_tax[enabled]","true");
  params.set("line_items[0][price_data][currency]","usd");
  params.set("line_items[0][price_data][product]",productId);
  params.set("line_items[0][price_data][unit_amount]",String(data.totalCents));
  params.set("line_items[0][price_data][tax_behavior]","exclusive");
  params.set("line_items[0][quantity]","1");
  params.set("expires_at",String(now()+1800));
  const session=await stripeRequest(key,"checkout/sessions",params,"tlc-"+reservationId);
  if(!session?.id || !session?.url) fail("CHECKOUT_CREATE_FAILED",502);
  const {error:updateError}=await admin.from("checkout_reservations").update({
    stripe_session_id:session.id,checkout_url:session.url,
    expires_at:new Date(session.expires_at*1000).toISOString(),
    status:"awaiting_payment",
  }).eq("id",reservationId).in("status",["creating","awaiting_payment"]);
  if(updateError) fail("CHECKOUT_SAVE_FAILED",503);
  return {checkoutUrl:session.url,bookingReference:reservation.booking_reference};
}
async function status(input:any) {
  const sessionId=value(input.sessionId,200);
  if(!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) fail("INVALID_SESSION");
  const admin=supabaseAdmin();
  const {data,error}=await admin.from("checkout_reservations")
    .select("status,booking_reference").eq("stripe_session_id",sessionId).single();
  if(error || !data) fail("NOT_FOUND",404);
  return {status:data.status,bookingReference:data.booking_reference};
}
Deno.serve(async(req:Request)=>{
  const origin=req.headers.get("origin")??"";
  if(req.method==="OPTIONS") return response({ok:true},200,origin);
  if(req.method!=="POST") return response({error:"METHOD_NOT_ALLOWED"},405,origin);
  if(origin && !ORIGINS.has(origin)) return response({error:"ORIGIN_NOT_ALLOWED"},403,origin);
  try{
    const body=await req.json();
    const result=body.action==="status"?await status(body):body.action==="create"?await createCheckout(req,body):fail("INVALID_ACTION");
    return response({ok:true,...result},200,origin);
  }catch(e){
    const error=e as Error&{status?:number};
    const code=error.message??"CHECKOUT_ERROR";
    const safe=/^[A-Z_]+$/.test(code)?code:"CHECKOUT_ERROR";
    if((error.status??500)>=500) console.error("Checkout error",safe);
    return response({ok:false,error:safe},error.status??500,origin);
  }
});
