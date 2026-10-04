import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowUpRight,
  LoaderCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { Button } from "@/components/ui/button";
import { brandAssets } from "@/config/brand";
import { askLucyOwner, askLucyPublic } from "@/lib/lucy.functions";
import { lucyPromptSet, lucyRouteContext } from "@/lib/lucy.knowledge";
import type {
  LucyChatMessage,
  LucyReply,
} from "@/lib/lucy.types";
import { cn } from "@/lib/utils";

type LocalMessage = LucyChatMessage & {
  id: string;
  reply?: LucyReply;
};

const MAX_INPUT = 700;

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function storageKeys(ownerMode: boolean) {
  const scope = ownerMode ? "owner" : "public";
  return {
    messages: "tlc-lucy-" + scope + "-messages-v1",
    session: "tlc-lucy-" + scope + "-session-v1",
  };
}

function loadMessages(key: string): LocalMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(key) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string",
      )
      .slice(-20);
  } catch {
    return [];
  }
}

function getSessionId(key: string) {
  const stored = window.sessionStorage.getItem(key);
  if (stored) return stored;
  const next = makeId();
  window.sessionStorage.setItem(key, next);
  return next;
}

function EstimateCard({ reply }: { reply: LucyReply }) {
  if (!reply.estimate) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-gold/25 bg-background/85">
      <div className="flex items-end justify-between gap-4 border-b border-border/70 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {reply.estimate.service}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{reply.estimate.frequency}</p>
        </div>
        <p className="font-display text-2xl font-semibold text-foreground">
          {reply.estimate.totalLabel}
        </p>
      </div>
      <div className="space-y-2 px-4 py-3">
        {reply.estimate.lines.map((line, index) => (
          <div
            key={line.label + index}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="text-muted-foreground">
              {line.label}
              {line.quantity > 1 ? " × " + line.quantity : ""}
            </span>
            <span className="font-semibold text-foreground">{line.amountLabel}</span>
          </div>
        ))}
        {reply.estimate.reviewFlags.length > 0 && (
          <div className="mt-3 rounded-xl bg-accent/55 px-3 py-2">
            {reply.estimate.reviewFlags.map((flag) => (
              <p key={flag} className="text-xs leading-relaxed text-muted-foreground">
                {flag}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function LucyIntelligenceWidget() {
  const { language, text } = useLanguage();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const ownerMode = pathname.startsWith("/admin");
  const hidden = pathname.startsWith("/auth");
  const keys = useMemo(() => storageKeys(ownerMode), [ownerMode]);
  const publicAsk = useServerFn(askLucyPublic);
  const ownerAsk = useServerFn(askLucyOwner);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const prompts = lucyPromptSet(pathname, language, ownerMode);
  const routeContext = lucyRouteContext(pathname, language);

  useEffect(() => {
    setMessages(loadMessages(keys.messages));
    setHydrated(true);
  }, [keys.messages]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.sessionStorage.setItem(keys.messages, JSON.stringify(messages.slice(-20)));
  }, [hydrated, keys.messages, messages]);

  useEffect(() => {
    if (!open) return;
    const node = viewportRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function sendQuestion(question: string) {
    const clean = question.trim().slice(0, MAX_INPUT);
    if (!clean || sending) return;

    const history = messages.slice(-10).map(({ role, content }) => ({ role, content }));
    const userMessage: LocalMessage = {
      id: makeId(),
      role: "user",
      content: clean,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setSending(true);

    try {
      const reply = ownerMode
        ? await ownerAsk({
            data: {
              language,
              pathname,
              question: clean,
              history,
            },
          })
        : await publicAsk({
            data: {
              sessionId: getSessionId(keys.session),
              language,
              pathname,
              question: clean,
              history,
            },
          });

      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: reply.answer,
          reply,
        },
      ]);
    } catch {
      setError(
        text({
          en: "Lucy could not complete that request. You can try again or use the direct booking, quote, and contact options.",
          es: "Lucy no pudo completar esa solicitud. Puedes intentarlo de nuevo o usar las opciones directas de reserva, cotización y contacto.",
        }),
      );
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void sendQuestion(input);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendQuestion(input);
    }
  }

  function resetConversation() {
    setMessages([]);
    setInput("");
    setError("");
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(keys.messages);
      window.sessionStorage.removeItem(keys.session);
    }
  }

  if (hidden) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "group fixed bottom-5 right-4 z-[80] flex min-h-14 items-center gap-3 rounded-full border border-gold/35 bg-card/95 px-3 py-2 shadow-[0_20px_60px_-20px_hsl(var(--foreground)/0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:right-5",
            open && "pointer-events-none opacity-0",
          )}
          aria-label={text({
            en: "Open Lucy Intelligence",
            es: "Abrir Lucy Intelligence",
          })}
          aria-haspopup="dialog"
        >
          <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-gold/30 bg-primary">
            <img
              src={brandAssets.logo256}
              alt=""
              aria-hidden="true"
              className="size-9 object-contain"
            />
            <span className="absolute right-0.5 top-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
          </span>
          <span className="hidden pr-2 text-left sm:block">
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {ownerMode
                ? text({ en: "Owner Operations", es: "Operaciones" })
                : text({ en: "Tranquility Concierge", es: "Conserje Tranquility" })}
            </span>
            <span className="mt-0.5 block text-sm font-semibold text-foreground">
              Lucy Intelligence
            </span>
          </span>
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-foreground/20 backdrop-blur-[1px] data-[state=closed]:animate-out data-[state=open]:animate-in sm:bg-transparent sm:backdrop-blur-none" />

        <DialogPrimitive.Content
          className="fixed inset-x-0 bottom-0 z-[100] flex h-[min(84dvh,48rem)] flex-col overflow-hidden rounded-t-[2rem] border border-border bg-card shadow-2xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in sm:bottom-5 sm:left-auto sm:right-5 sm:h-[min(78vh,46rem)] sm:w-[27rem] sm:rounded-[1.75rem]"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <header className="relative overflow-hidden border-b border-border/70 bg-gradient-to-br from-primary via-primary to-primary/92 px-5 pb-4 pt-5 text-primary-foreground">
            <div className="pointer-events-none absolute -right-16 -top-24 size-48 rounded-full border border-gold/20 bg-gold/10 blur-2xl" />
            <div className="relative flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-gold/35 bg-background/10 shadow-gold">
                <img
                  src={brandAssets.logo256}
                  alt=""
                  aria-hidden="true"
                  className="size-10 object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                <DialogPrimitive.Title className="font-display text-2xl font-semibold leading-none">
                  Lucy Intelligence
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1.5 flex items-center gap-2 text-xs text-primary-foreground/75">
                  <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
                  <span>
                    {ownerMode
                      ? text({ en: "Owner Operations", es: "Operaciones de propietaria" })
                      : text({ en: "Tranquility Concierge", es: "Conserje Tranquility" })}
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>{routeContext}</span>
                </DialogPrimitive.Description>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={resetConversation}
                  className="grid size-10 place-items-center rounded-full text-primary-foreground/75 transition hover:bg-background/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  aria-label={text({
                    en: "Start a new Lucy conversation",
                    es: "Iniciar una nueva conversación con Lucy",
                  })}
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                </button>
                <DialogPrimitive.Close asChild>
                  <button
                    type="button"
                    className="grid size-10 place-items-center rounded-full text-primary-foreground/75 transition hover:bg-background/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    aria-label={text({ en: "Close Lucy", es: "Cerrar Lucy" })}
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </DialogPrimitive.Close>
              </div>
            </div>

            <div className="relative mt-4 flex items-center gap-2 rounded-xl border border-primary-foreground/10 bg-background/5 px-3 py-2 text-[0.7rem] leading-relaxed text-primary-foreground/70">
              <ShieldCheck className="size-4 shrink-0 text-gold" aria-hidden="true" />
              <span>
                {ownerMode
                  ? text({
                      en: "Private owner mode uses authenticated aggregate operations data.",
                      es: "El modo privado usa datos operativos agregados y autenticados.",
                    })
                  : text({
                      en: "Public Lucy cannot access private customer records or owner notes.",
                      es: "Lucy pública no puede acceder a registros privados de clientes ni notas de la propietaria.",
                    })}
              </span>
            </div>
          </header>

          <div
            ref={viewportRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-background/30 to-background px-4 py-5"
          >
            {messages.length === 0 && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-gold/20 bg-card px-4 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-foreground">
                    {ownerMode
                      ? text({
                          en: "Your operating intelligence is ready.",
                          es: "Tu inteligencia operativa está lista.",
                        })
                      : text({
                          en: "Ask Lucy anything about your cleaning.",
                          es: "Pregúntale a Lucy sobre tu limpieza.",
                        })}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {ownerMode
                      ? text({
                          en: "Ask about the next 7 days, booking demand, quote volume, service-area activity, and operational priorities.",
                          es: "Pregunta por los próximos 7 días, demanda de reservas, volumen de cotizaciones, áreas de servicio y prioridades operativas.",
                        })
                      : text({
                          en: "Lucy can compare services, calculate verified estimates, check live service areas, explain this page, and move you into the right booking or quote flow.",
                          es: "Lucy puede comparar servicios, calcular estimados verificados, revisar áreas de servicio, explicar esta página y llevarte al flujo correcto de reserva o cotización.",
                        })}
                  </p>
                </div>

                <div className="grid gap-2">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendQuestion(prompt)}
                      className="min-h-11 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-xs font-medium leading-relaxed text-foreground transition hover:border-gold/45 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>{prompt}</span>
                        <ArrowUpRight
                          className="size-3.5 shrink-0 text-gold"
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4" aria-live="polite" aria-relevant="additions">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      message.role === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border border-border bg-card text-foreground shadow-sm",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {message.reply && (
                      <>
                        <EstimateCard reply={message.reply} />

                        {message.reply.actions.length > 0 && (
                          <div className="mt-3 grid gap-2">
                            {message.reply.actions.map((action, index) =>
                              action.href ? (
                                <a
                                  key={action.type + index}
                                  href={action.href}
                                  className="inline-flex min-h-10 items-center justify-between gap-3 rounded-xl border border-gold/30 bg-accent/35 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-gold/55 hover:bg-accent/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                  <span>{action.label}</span>
                                  <ArrowUpRight
                                    className="size-3.5 shrink-0"
                                    aria-hidden="true"
                                  />
                                </a>
                              ) : null,
                            )}
                          </div>
                        )}

                        {message.reply.followUps.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {message.reply.followUps.map((followUp) => (
                              <button
                                key={followUp}
                                type="button"
                                onClick={() => void sendQuestion(followUp)}
                                className="min-h-9 rounded-full border border-border bg-background px-3 py-1.5 text-[0.7rem] font-medium text-muted-foreground transition hover:border-gold/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                {followUp}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 text-xs text-muted-foreground shadow-sm">
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    <span>
                      {text({
                        en: "Lucy is checking Tranquility intelligence...",
                        es: "Lucy está consultando la inteligencia de Tranquility...",
                      })}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs leading-relaxed text-destructive"
                >
                  {error}
                </div>
              )}
            </div>
          </div>

          <footer className="border-t border-border bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <form onSubmit={handleSubmit} className="relative">
              <label htmlFor="lucy-composer" className="sr-only">
                {text({
                  en: "Message Lucy Intelligence",
                  es: "Mensaje para Lucy Intelligence",
                })}
              </label>
              <textarea
                ref={inputRef}
                id="lucy-composer"
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, MAX_INPUT))}
                onKeyDown={handleComposerKeyDown}
                rows={1}
                maxLength={MAX_INPUT}
                placeholder={
                  ownerMode
                    ? text({
                        en: "Ask Lucy about operations...",
                        es: "Pregunta a Lucy sobre operaciones...",
                      })
                    : text({
                        en: "Ask about services, pricing, coverage...",
                        es: "Pregunta sobre servicios, precios, cobertura...",
                      })
                }
                className="max-h-32 min-h-12 w-full resize-none rounded-2xl border border-input bg-background py-3 pl-4 pr-14 text-sm text-foreground shadow-inner outline-none transition placeholder:text-muted-foreground focus:border-gold/50 focus:ring-2 focus:ring-ring/35"
              />
              <Button
                type="submit"
                size="icon"
                disabled={sending || !input.trim()}
                className="absolute bottom-1.5 right-1.5 size-9 rounded-xl border border-gold/25"
                aria-label={text({ en: "Send to Lucy", es: "Enviar a Lucy" })}
              >
                {sending ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="size-4" aria-hidden="true" />
                )}
              </Button>
            </form>

            <p className="mt-2 px-1 text-[0.64rem] leading-relaxed text-muted-foreground">
              {text({
                en: "Lucy uses Tranquility's current service information. Final service details are confirmed before cleaning.",
                es: "Lucy usa la información actual de servicios de Tranquility. Los detalles finales se confirman antes de la limpieza.",
              })}
            </p>
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
