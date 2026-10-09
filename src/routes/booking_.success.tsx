import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language/LanguageProvider";

export const Route = createFileRoute("/booking_/success")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id.slice(0, 200) : "",
  }),
  head: () => ({ meta: [{ title: "Payment Status | Tranquility Level Cleaning" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: PaymentStatusPage,
});
type Status = { status: string; bookingReference: string };
function PaymentStatusPage() {
  const { text } = useLanguage();
  const search = Route.useSearch();
  const [result, setResult] = useState<Status | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    if (!search.session_id) { setError("Missing checkout session"); return; }
    async function poll() {
      for (let attempt=0; attempt<6 && alive; attempt++) {
        const { data, error: requestError } = await supabase.functions.invoke("stripe-checkout", {
          body: { action: "status", sessionId: search.session_id },
        });
        if (!alive) return;
        if (!requestError && data?.ok) {
          setResult({status:data.status,bookingReference:data.bookingReference});
          if (["paid","refunded","disputed","failed","expired","cancelled","payment_exception"].includes(data.status)) return;
        } else if (attempt===5) setError("Unable to verify payment status. Please contact Tranquility with your Stripe receipt.");
        await new Promise(resolve=>setTimeout(resolve,1500));
      }
    }
    void poll();
    return ()=>{ alive=false; };
  },[search.session_id]);
  const paid=result?.status==="paid";
  return (
    <section className="section">
      <div className="container-page mx-auto max-w-2xl py-14 text-center">
        <h1 className="text-3xl font-semibold">{text({en:"Your payment and booking",es:"Tu pago y reserva"})}</h1>
        {paid ? (
          <p className="mt-6 text-lg">{text({
            en:"Payment verified. Tranquility will confirm your final appointment details.",
            es:"Pago verificado. Tranquility confirmará los detalles finales de tu cita.",
          })}</p>
        ): result?.status==="processing" || result?.status==="awaiting_payment" || result?.status==="creating" ? (
          <p className="mt-6">{text({en:"We're verifying the payment. Do not submit another charge. Check your receipt or contact us if this continues.",es:"Estamos verificando el pago. No realices otro cargo. Revisa tu recibo o contáctanos si esto continúa."})}</p>
        ):result ? (
          <p className="mt-6">{text({en:"Payment is not confirmed. Please contact Tranquility for assistance.",es:"El pago no está confirmado. Comunícate con Tranquility para recibir ayuda."})}</p>
        ):(
          <p className="mt-6">{error || text({en:"Checking verified payment status…",es:"Verificando el estado del pago…"})}</p>
        )}
        {result?.bookingReference && <p className="mt-4 font-semibold">{text({en:"Reference",es:"Referencia"})}: {result.bookingReference}</p>}
        <Button asChild className="mt-8"><Link to="/">{text({en:"Return home",es:"Volver al inicio"})}</Link></Button>
      </div>
    </section>
  );
}
