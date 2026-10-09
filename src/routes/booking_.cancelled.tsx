import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language/LanguageProvider";

export const Route = createFileRoute("/booking/cancelled")({
  head: () => ({ meta: [{ title: "Checkout Cancelled | Tranquility Level Cleaning" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: CancelledPage,
});
function CancelledPage() {
  const { text } = useLanguage();
  return (
    <section className="section">
      <div className="container-page mx-auto max-w-2xl py-14 text-center">
        <h1 className="text-3xl font-semibold">{text({en:"Checkout cancelled",es:"Pago cancelado"})}</h1>
        <p className="mt-5">{text({
          en:"We have not confirmed a payment. Any temporary reservation will be released after its checkout expires. You may return to booking or contact Tranquility.",
          es:"No hemos confirmado ningún pago. La reserva temporal se liberará cuando expire el pago. Puedes volver a reservar o contactar a Tranquility.",
        })}</p>
        <Button asChild className="mt-8"><Link to="/booking">{text({en:"Back to booking",es:"Volver a reservar"})}</Link></Button>
      </div>
    </section>
  );
}
