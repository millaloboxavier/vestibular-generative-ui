"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, History, Loader2, Menu, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GenerativeSkeleton, Section, SectionRenderer, SkeletonVariant } from "@/components/generative/section-renderer";

const suggestions = [
  "quais cursos de graduação a FGV oferece?",
  "quando abre a inscrição do Vestibular FGV?",
  "posso usar minha nota do Enem?",
  "quero estudar para o Vestibular FGV",
  "tem bolsa de estudo?",
  "quais eventos tem em São Paulo?",
];

const loadingSteps = [
  "Entendendo o que você procura",
  "Identificando curso, cidade e forma de ingresso",
  "Organizando os blocos mais úteis para este momento",
];

type Plan = {
  pageTitle?: string;
  answer?: string;
  intent?: string;
  entities?: any;
  sections?: Section[];
  debug?: any;
};

type JourneyItem = {
  id: string;
  question: string;
  title: string;
  intent?: string;
  createdAt: string;
  plan: Plan;
};

function TypingDots() {
  return (
    <span className="dot-typing inline-flex items-center gap-1 pl-1">
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
    </span>
  );
}

function Header({ hasResult, onOpenJourney, journeyCount }: { hasResult: boolean; onOpenJourney: () => void; journeyCount: number }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3 font-semibold">
          <span className="h-6 w-6 rounded-full bg-foreground" />
          Vestibular FGV
        </div>
        <nav className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
          <span>Cursos</span>
          <span>Processo seletivo</span>
          <span>Bolsas</span>
          <span>Eventos</span>
        </nav>
        <div className="flex items-center gap-2">
          {journeyCount ? (
            <Button variant="outline" size="sm" onClick={onOpenJourney} className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Sua jornada</span>
              <Badge className="ml-1">{journeyCount}</Badge>
            </Button>
          ) : null}
          <Badge className={hasResult ? "opacity-100" : "opacity-0"}>Graduação</Badge>
        </div>
      </div>
    </header>
  );
}

function normalize(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function inferSkeletonVariant(message: string): SkeletonVariant {
  const q = normalize(message);
  if (/(data|inscri|prazo|calendario|cronograma|quando|vestibular)/.test(q)) return "timeline";
  if (/(curso|graduacao|administracao|direito|economia|dados|comunicacao|matematica|relacoes)/.test(q)) return "courses";
  if (/(enem|forma de ingresso|formas de ingresso|transferencia|olimpiada|internacional)/.test(q)) return "admission";
  if (/(bolsa|bolsas|merito|demanda social|financiamento)/.test(q)) return "scholarships";
  if (/(evento|visita|experiencia|imersiva|conhecer de perto)/.test(q)) return "events";
  if (/(detalhe|detalhes|mensalidade|duracao|campus|periodo)/.test(q)) return "detail";
  return "default";
}

function compactDateLabel() {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function JourneyDrawer({
  open,
  journeys,
  activeId,
  onClose,
  onSelect,
  onClear,
}: {
  open: boolean;
  journeys: JourneyItem[];
  activeId?: string;
  onClose: () => void;
  onSelect: (item: JourneyItem) => void;
  onClear: () => void;
}) {
  return (
    <div className={open ? "fixed inset-0 z-50" : "pointer-events-none fixed inset-0 z-50"} aria-hidden={!open}>
      <div className={open ? "absolute inset-0 bg-foreground/25 backdrop-blur-[2px]" : "absolute inset-0 bg-transparent"} onClick={onClose} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l bg-background shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Sua jornada</p>
            <h2 className="mt-1 text-xl font-semibold">Caminhos explorados</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Volte para uma resposta anterior sem precisar perguntar de novo.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar jornada">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {journeys.length ? (
            <div className="space-y-3">
              {journeys.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={`w-full rounded-2xl border p-4 text-left transition hover:bg-muted/70 ${item.id === activeId ? "border-foreground bg-muted" : "bg-background"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{item.intent || "jornada"}</span>
                    <span className="text-xs text-muted-foreground">{item.createdAt}</span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 font-semibold">{item.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{item.question}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-muted/40 p-5 text-sm text-muted-foreground">As experiências que você gerar aparecerão aqui.</div>
          )}
        </div>
        {journeys.length ? (
          <div className="border-t p-4">
            <Button variant="outline" className="w-full" onClick={onClear}>Limpar jornada</Button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

export default function Page() {
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skeletonVariant, setSkeletonVariant] = useState<SkeletonVariant>("default");
  const [journeys, setJourneys] = useState<JourneyItem[]>([]);
  const [activeJourneyId, setActiveJourneyId] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => plan?.sections || [], [plan]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("vestibular-ia-journey");
      if (stored) setJourneys(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("vestibular-ia-journey", JSON.stringify(journeys.slice(0, 12)));
    } catch {}
  }, [journeys]);

  useEffect(() => {
    if (!sections.length) {
      setVisibleCount(0);
      return;
    }
    setVisibleCount(0);
    const timers = sections.map((_, index) => window.setTimeout(() => setVisibleCount(index + 1), 240 + index * 260));
    return () => timers.forEach(window.clearTimeout);
  }, [sections]);

  async function submitQuestion(question: string) {
    const message = question.trim();
    if (!message || loading) return;
    setError("");
    setLoading(true);
    setPlan(null);
    setVisibleCount(0);
    setCurrentQuestion(message);
    setInput("");
    setActiveJourneyId(undefined);
    setSkeletonVariant(inferSkeletonVariant(message));
    window.setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

    try {
      const response = await fetch("/api/generate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Não foi possível montar a resposta agora.");
      setPlan(data);

      const item: JourneyItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        question: message,
        title: data.pageTitle || message,
        intent: data.intent,
        createdAt: compactDateLabel(),
        plan: data,
      };
      setActiveJourneyId(item.id);
      setJourneys((previous) => [item, ...previous.filter((entry) => entry.question !== message)].slice(0, 12));
    } catch (err: any) {
      setError(err?.message || "Não foi possível montar a resposta agora.");
    } finally {
      setLoading(false);
    }
  }

  function restoreJourney(item: JourneyItem) {
    setError("");
    setLoading(false);
    setCurrentQuestion(item.question);
    setPlan(item.plan);
    setActiveJourneyId(item.id);
    setVisibleCount(item.plan.sections?.length || 0);
    setDrawerOpen(false);
    window.setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function clearJourney() {
    setJourneys([]);
    setActiveJourneyId(undefined);
    try {
      window.localStorage.removeItem("vestibular-ia-journey");
    } catch {}
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    submitQuestion(input);
  }

  const hasResult = Boolean(plan || loading || error || currentQuestion);

  return (
    <main ref={topRef} className="min-h-screen bg-background">
      <Header hasResult={hasResult} onOpenJourney={() => setDrawerOpen(true)} journeyCount={journeys.length} />
      <JourneyDrawer open={drawerOpen} journeys={journeys} activeId={activeJourneyId} onClose={() => setDrawerOpen(false)} onSelect={restoreJourney} onClear={clearJourney} />

      {!hasResult ? (
        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center md:px-6">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">Encontre o melhor caminho para sua graduação na FGV</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">Pergunte sobre cursos, inscrições, formas de ingresso, bolsas, provas ou eventos da graduação.</p>
          <form onSubmit={onSubmit} className="mt-10 flex w-full max-w-2xl gap-2 rounded-full border bg-muted p-2">
            <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="ex: quando abre a inscrição do Vestibular FGV?" className="border-0 bg-transparent focus:bg-transparent focus:ring-0" />
            <Button type="submit" size="icon" disabled={!input.trim() || loading} aria-label="Buscar"><ArrowUp className="h-5 w-5" /></Button>
          </form>
          <div className="mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => <Button key={suggestion} variant="outline" size="sm" onClick={() => submitQuestion(suggestion)}>{suggestion}</Button>)}
          </div>
          {journeys.length ? (
            <Button variant="ghost" className="mt-8 gap-2" onClick={() => setDrawerOpen(true)}>
              <Menu className="h-4 w-4" /> Ver caminhos explorados
            </Button>
          ) : null}
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <div className="sticky top-[73px] z-30 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
            <form onSubmit={onSubmit} className="mx-auto flex max-w-3xl gap-2 rounded-full border bg-muted p-2">
              <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Pergunte outra coisa sobre a graduação FGV..." className="border-0 bg-transparent focus:bg-transparent focus:ring-0" />
              <Button type="submit" size="icon" disabled={!input.trim() || loading} aria-label="Buscar"><ArrowUp className="h-5 w-5" /></Button>
            </form>
          </div>

          <div className="mx-auto mt-8 max-w-4xl">
            <div className="rounded-[1.5rem] border bg-muted/30 p-5 md:p-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Você perguntou</p>
              <p className="mt-2 text-xl font-medium leading-8">{currentQuestion}</p>
            </div>

            {loading ? (
              <>
                <div className="mt-6 rounded-[1.5rem] border p-5 md:p-6">
                  <div className="flex items-center gap-3 font-medium">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Montando sua experiência<TypingDots />
                  </div>
                  <div className="mt-5 grid gap-3">
                    {loadingSteps.map((step, index) => (
                      <div key={step} className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3 text-sm text-muted-foreground">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">{index + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
                <GenerativeSkeleton variant={skeletonVariant} />
              </>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-900">{error}</div>
            ) : null}

            {plan ? (
              <div className="mt-6 space-y-6">
                <div className="rounded-[1.5rem] border p-5 md:p-6">
                  <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{plan.pageTitle}</h1>
                  {plan.answer ? <p className="mt-3 text-base leading-7 text-muted-foreground md:text-lg">{plan.answer}</p> : null}
                </div>
                {sections.slice(0, visibleCount).map((section, index) => (
                  <SectionRenderer key={`${section.type}-${index}-${section.title}`} section={section} onPrompt={submitQuestion} />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      )}
    </main>
  );
}
