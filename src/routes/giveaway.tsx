import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Gift, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getGiveawayStatus,
  submitGiveawayEntry,
  type GiveawayStatus,
} from "@/lib/giveaway.functions";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/giveaway")({
  head: () =>
    seo({
      title: "Monthly Cleaning Giveaway | Tranquility Level Cleaning",
      description:
        "Enter Tranquility Level Cleaning's monthly complimentary cleaning giveaway for households in the Dallas-Fort Worth service area.",
      path: "/giveaway",
    }),
  component: GiveawayPage,
});

type EntryFor = "self" | "someone_else";
type NeedCategory =
  | "postpartum"
  | "mental_health_clutter"
  | "recovery"
  | "disability_support"
  | "veteran_support"
  | "other";

const initialForm = {
  entrantName: "",
  entrantEmail: "",
  entrantPhone: "",
  entryFor: "self" as EntryFor,
  nomineeName: "",
  nomineeRelationship: "",
  city: "",
  zip: "",
  needCategory: "postpartum" as NeedCategory,
  story: "",
  age18: false,
  marketingEmailOptIn: false,
  marketingSmsOptIn: false,
  website: "",
};

function monthLabel(month: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}T12:00:00Z`));
}

function GiveawayPage() {
  const { language, locale, text } = useLanguage();
  const statusFn = useServerFn(getGiveawayStatus);
  const submitFn = useServerFn(submitGiveawayEntry);
  const [cycle, setCycle] = useState<GiveawayStatus | null>(null);
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void statusFn()
      .then(setCycle)
      .catch(() => setCycle(null));
  }, [statusFn]);

  const drawingLabel = useMemo(
    () => (cycle ? monthLabel(cycle.month, locale) : ""),
    [cycle, locale],
  );

  const needOptions = [
    {
      value: "postpartum" as const,
      label: text({ en: "Postpartum support", es: "Apoyo posparto" }),
    },
    {
      value: "mental_health_clutter" as const,
      label: text({
        en: "Mental health or overwhelming clutter",
        es: "Salud mental o desorden abrumador",
      }),
    },
    {
      value: "recovery" as const,
      label: text({ en: "Recovery or healing period", es: "Período de recuperación" }),
    },
    {
      value: "disability_support" as const,
      label: text({ en: "Disability or mobility support", es: "Apoyo por discapacidad o movilidad" }),
    },
    {
      value: "veteran_support" as const,
      label: text({ en: "Veteran support", es: "Apoyo para veteranos" }),
    },
    {
      value: "other" as const,
      label: text({ en: "Another circumstance", es: "Otra circunstancia" }),
    },
  ];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!form.age18) {
      setError(
        text({
          en: "Please confirm that you are at least 18 years old.",
          es: "Confirma que tienes al menos 18 años.",
        }),
      );
      return;
    }

    if (form.entryFor === "someone_else" && !form.nomineeName.trim()) {
      setError(
        text({
          en: "Please enter the name of the person you are nominating.",
          es: "Ingresa el nombre de la persona que estás nominando.",
        }),
      );
      return;
    }

    setState("sending");
    try {
      const result = await submitFn({
        data: {
          ...form,
          nomineeName: form.nomineeName || undefined,
          nomineeRelationship: form.nomineeRelationship || undefined,
          age18: true,
          language,
        },
      });
      setReference(result.reference);
      setCycle({
        ok: true,
        month: result.giveawayMonth,
        deadline: result.deadline,
        rollover: result.rollover,
      });
      setState("sent");
    } catch (submissionError) {
      setState("idle");
      setError(
        submissionError instanceof Error && submissionError.message
          ? submissionError.message
          : text({
              en: "We could not submit your entry. Please try again.",
              es: "No pudimos enviar tu participación. Inténtalo de nuevo.",
            }),
      );
    }
  }

  return (
    <>
      <PageHero
        eyebrow={text({ en: "Monthly community giveaway", es: "Sorteo comunitario mensual" })}
        title={text({
          en: "A complimentary clean for someone who could use a little support.",
          es: "Una limpieza de cortesía para alguien que podría beneficiarse de un poco de apoyo.",
        })}
        intro={text({
          en: "Each month, Tranquility Level Cleaning randomly selects one eligible entry for a complimentary home cleaning. You may enter for yourself or nominate someone you care about.",
          es: "Cada mes, Tranquility Level Cleaning selecciona al azar una participación elegible para recibir una limpieza de hogar de cortesía. Puedes participar por ti o nominar a alguien que te importe.",
        })}
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <aside className="space-y-6">
            <div className="rounded-[1.5rem] border border-border bg-sand p-6 shadow-soft">
              <div className="flex size-11 items-center justify-center rounded-full bg-card text-moss">
                <Gift className="size-5" aria-hidden="true" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-moss">
                {text({ en: "Current drawing", es: "Sorteo actual" })}
              </p>
              <h2 className="mt-2 text-3xl text-ink">
                {drawingLabel ||
                  text({ en: "Monthly cleaning giveaway", es: "Sorteo mensual de limpieza" })}
              </h2>
              {cycle && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {cycle.rollover
                    ? text({
                        en: `The current month's deadline has passed. Entries submitted now are entered into the ${drawingLabel} drawing.`,
                        es: `La fecha límite del mes actual ya pasó. Las participaciones enviadas ahora entran en el sorteo de ${drawingLabel}.`,
                      })
                    : text({
                        en: `Entries for ${drawingLabel} are due by the 3rd.`,
                        es: `Las participaciones para ${drawingLabel} deben enviarse a más tardar el día 3.`,
                      })}
                </p>
              )}
            </div>

            <div className="space-y-4 rounded-[1.5rem] border border-border bg-card p-6">
              {[
                {
                  icon: Heart,
                  title: text({ en: "Who it can support", es: "A quién puede apoyar" }),
                  body: text({
                    en: "Examples include postpartum households, recovery periods, mental health related clutter, disability or mobility needs, veterans, and other circumstances where a clean space could make the month easier.",
                    es: "Algunos ejemplos incluyen hogares en etapa posparto, períodos de recuperación, desorden relacionado con salud mental, necesidades de discapacidad o movilidad, veteranos y otras circunstancias en las que un espacio limpio pueda hacer el mes más llevadero.",
                  }),
                },
                {
                  icon: Sparkles,
                  title: text({ en: "Cluttered spaces", es: "Espacios con mucho desorden" }),
                  body: text({
                    en: "For heavily cluttered spaces, the complimentary service may be limited to one room or one defined area rather than the entire home.",
                    es: "En espacios con mucho desorden, el servicio de cortesía puede limitarse a una habitación o área definida en lugar de toda la vivienda.",
                  }),
                },
                {
                  icon: ShieldCheck,
                  title: text({ en: "Random selection", es: "Selección al azar" }),
                  body: text({
                    en: "The written story helps us understand the circumstance, but eligible entries are selected at random. Marketing consent does not affect the chance of selection.",
                    es: "La historia escrita nos ayuda a comprender la situación, pero las participaciones elegibles se seleccionan al azar. El consentimiento de marketing no afecta las probabilidades de selección.",
                  }),
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <Icon className="mt-1 size-5 shrink-0 text-moss" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg text-ink">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-gold/30 bg-gold/5 p-6 text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold text-ink">
                {text({ en: "No purchase necessary.", es: "No es necesario realizar una compra." })}
              </p>
              <p className="mt-2">
                {text({
                  en: "One entry per email address or phone number per monthly drawing. Eligibility, service area, safety, property condition, access, scope, and scheduling restrictions apply. If selected, the complimentary cleaning will be arranged by the end of the drawing month. Void where prohibited.",
                  es: "Se permite una participación por correo electrónico o número de teléfono en cada sorteo mensual. Se aplican restricciones de elegibilidad, área de servicio, seguridad, condición de la propiedad, acceso, alcance y programación. Si eres seleccionado, la limpieza de cortesía se coordinará antes de finalizar el mes del sorteo. Nulo donde esté prohibido.",
                })}
              </p>
            </div>
          </aside>

          <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft md:p-8">
            {state === "sent" ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent text-moss">
                  <Gift className="size-6" aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-3xl">
                  {text({ en: "Your entry is in.", es: "Tu participación está registrada." })}
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {text({
                    en: `Reference ${reference}. If selected, Tranquility Level Cleaning will contact you directly to confirm eligibility, scope, and scheduling.`,
                    es: `Referencia ${reference}. Si eres seleccionado, Tranquility Level Cleaning se comunicará contigo directamente para confirmar elegibilidad, alcance y programación.`,
                  })}
                </p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={submit}>
                <div>
                  <p className="eyebrow">
                    {text({ en: "Enter the drawing", es: "Participa en el sorteo" })}
                  </p>
                  <h2 className="mt-2 text-3xl">
                    {text({ en: "Tell us who you are entering for.", es: "Cuéntanos para quién estás participando." })}
                  </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="giveaway-name">{text({ en: "Your full name", es: "Tu nombre completo" })}</Label>
                    <Input
                      id="giveaway-name"
                      className="mt-2"
                      required
                      autoComplete="name"
                      value={form.entrantName}
                      onChange={(event) => setForm({ ...form, entrantName: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="giveaway-email">{text({ en: "Email", es: "Correo electrónico" })}</Label>
                    <Input
                      id="giveaway-email"
                      className="mt-2"
                      required
                      type="email"
                      autoComplete="email"
                      value={form.entrantEmail}
                      onChange={(event) => setForm({ ...form, entrantEmail: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="giveaway-phone">{text({ en: "Phone", es: "Teléfono" })}</Label>
                    <Input
                      id="giveaway-phone"
                      className="mt-2"
                      required
                      type="tel"
                      autoComplete="tel"
                      value={form.entrantPhone}
                      onChange={(event) => setForm({ ...form, entrantPhone: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="giveaway-entry-for">{text({ en: "Who are you entering for?", es: "¿Para quién estás participando?" })}</Label>
                    <Select
                      value={form.entryFor}
                      onValueChange={(value: EntryFor) => setForm({ ...form, entryFor: value })}
                    >
                      <SelectTrigger id="giveaway-entry-for" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">{text({ en: "Myself", es: "Para mí" })}</SelectItem>
                        <SelectItem value="someone_else">{text({ en: "Someone else", es: "Otra persona" })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {form.entryFor === "someone_else" && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="giveaway-nominee">{text({ en: "Nominee name", es: "Nombre de la persona nominada" })}</Label>
                      <Input
                        id="giveaway-nominee"
                        className="mt-2"
                        required
                        value={form.nomineeName}
                        onChange={(event) => setForm({ ...form, nomineeName: event.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="giveaway-relationship">{text({ en: "Your relationship", es: "Tu relación con esa persona" })}</Label>
                      <Input
                        id="giveaway-relationship"
                        className="mt-2"
                        value={form.nomineeRelationship}
                        onChange={(event) => setForm({ ...form, nomineeRelationship: event.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="giveaway-city">{text({ en: "City", es: "Ciudad" })}</Label>
                    <Input
                      id="giveaway-city"
                      className="mt-2"
                      required
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(event) => setForm({ ...form, city: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="giveaway-zip">{text({ en: "ZIP code", es: "Código postal" })}</Label>
                    <Input
                      id="giveaway-zip"
                      className="mt-2"
                      required
                      inputMode="numeric"
                      maxLength={5}
                      autoComplete="postal-code"
                      value={form.zip}
                      onChange={(event) => setForm({ ...form, zip: event.target.value.replace(/\D/g, "").slice(0, 5) })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="giveaway-category">{text({ en: "What best describes the situation?", es: "¿Qué describe mejor la situación?" })}</Label>
                  <Select
                    value={form.needCategory}
                    onValueChange={(value: NeedCategory) => setForm({ ...form, needCategory: value })}
                  >
                    <SelectTrigger id="giveaway-category" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {needOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="giveaway-story">
                    {text({
                      en: "Why are you entering this person?",
                      es: "¿Por qué estás inscribiendo a esta persona?",
                    })}
                  </Label>
                  <Textarea
                    id="giveaway-story"
                    className="mt-2 min-h-36"
                    required
                    maxLength={2500}
                    value={form.story}
                    onChange={(event) => setForm({ ...form, story: event.target.value })}
                    placeholder={text({
                      en: "Share enough for us to understand the circumstance. Please do not include medical records, diagnoses, account information, or other highly sensitive details.",
                      es: "Comparte lo suficiente para que podamos comprender la situación. No incluyas expedientes médicos, diagnósticos, información de cuentas ni otros datos altamente sensibles.",
                    })}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">{form.story.length}/2500</p>
                </div>

                <div className="space-y-4 rounded-xl border border-border bg-sand/60 p-5">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="giveaway-age"
                      checked={form.age18}
                      onCheckedChange={(checked) => setForm({ ...form, age18: checked === true })}
                    />
                    <Label htmlFor="giveaway-age" className="text-sm font-normal leading-relaxed">
                      {text({
                        en: "I am at least 18 years old and I understand that submitting an entry does not guarantee selection or service.",
                        es: "Tengo al menos 18 años y entiendo que enviar una participación no garantiza selección ni servicio.",
                      })}
                    </Label>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-semibold text-ink">
                      {text({ en: "Optional marketing preferences", es: "Preferencias opcionales de marketing" })}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {text({
                        en: "These choices are optional and do not affect giveaway eligibility or the chance of selection.",
                        es: "Estas opciones son voluntarias y no afectan la elegibilidad ni las probabilidades de selección.",
                      })}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="giveaway-email-optin"
                      checked={form.marketingEmailOptIn}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, marketingEmailOptIn: checked === true })
                      }
                    />
                    <Label htmlFor="giveaway-email-optin" className="text-xs font-normal leading-relaxed text-muted-foreground">
                      {text({
                        en: "I agree to receive occasional promotional emails from Tranquility Level Cleaning. Consent is optional and is not required to enter or purchase services. I can unsubscribe at any time.",
                        es: "Acepto recibir correos promocionales ocasionales de Tranquility Level Cleaning. El consentimiento es opcional y no es necesario para participar ni comprar servicios. Puedo cancelar la suscripción en cualquier momento.",
                      })}
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="giveaway-sms-optin"
                      checked={form.marketingSmsOptIn}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, marketingSmsOptIn: checked === true })
                      }
                    />
                    <Label htmlFor="giveaway-sms-optin" className="text-xs font-normal leading-relaxed text-muted-foreground">
                      {text({
                        en: "I agree to receive recurring promotional text messages from Tranquility Level Cleaning at the number provided. Consent is optional and is not required to enter or purchase services. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.",
                        es: "Acepto recibir mensajes de texto promocionales recurrentes de Tranquility Level Cleaning en el número proporcionado. El consentimiento es opcional y no es necesario para participar ni comprar servicios. La frecuencia de mensajes varía. Pueden aplicarse tarifas de mensajes y datos. Responde STOP para cancelar o HELP para obtener ayuda.",
                      })}
                    </Label>
                  </div>
                </div>

                <div className="sr-only" aria-hidden="true">
                  <Label htmlFor="giveaway-website">Website</Label>
                  <Input
                    id="giveaway-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(event) => setForm({ ...form, website: event.target.value })}
                  />
                </div>

                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}

                <Button className="w-full sm:w-auto" type="submit" disabled={state === "sending"}>
                  {state === "sending"
                    ? text({ en: "Submitting...", es: "Enviando..." })
                    : text({ en: "Enter monthly giveaway", es: "Participar en el sorteo mensual" })}
                </Button>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  {text({
                    en: "By submitting, you confirm the information is accurate to the best of your knowledge. If you nominate someone else, Tranquility may need their permission before scheduling service at their home.",
                    es: "Al enviar, confirmas que la información es correcta según tu conocimiento. Si nominas a otra persona, Tranquility puede necesitar su permiso antes de programar el servicio en su hogar.",
                  })}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
