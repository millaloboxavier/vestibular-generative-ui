"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Section, SectionRenderer } from "@/components/generative/section-renderer";

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

function TypingDots() {
  return (
    <span className="dot-typing inline-flex items-center gap-1 pl-1">
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
    </span>
  );
}

function Header({ hasResult }: { hasResult: boolean }) {
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
        <Badge className={hasResult ? "opacity-100" : "opacity-0"}>Graduação</Badge>
      </div>
    </header>
  );
}

export default function Page() {
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => plan?.sections || [], [plan]);

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
    } catch (err: any) {
      setError(err?.message || "Não foi possível montar a resposta agora.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    submitQuestion(input);
  }

  const hasResult = Boolean(plan || loading || error || currentQuestion);

  return (
    <main ref={topRef} className="min-h-screen bg-background">
      <Header hasResult={hasResult} />

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
