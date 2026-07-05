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
        <div className="flex items-center gap-2">
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

function formatDateForDisplay(date: string): string {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return date || "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function extractTextValue(value: any): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(extractTextValue).filter(Boolean).join(", ");
  if (typeof value === "object") {
    if (value.label || value.title || value.name || value.value || value.description || value.shortDescription) {
      return [value.label || value.title || value.name, value.value || value.description || value.shortDescription]
        .filter(Boolean)
        .join(" — ");
    }
    return "";
  }
  return String(value);
}

function summarizeItem(item: any): string {
  if (!item || typeof item !== "object") return extractTextValue(item);
  const title = item.name || item.displayName || item.label || item.title || "Item";
  const parts = [
    item.city && item.state ? `${item.city}/${item.state}` : item.city,
    item.school,
    item.summary || item.description || item.shortDescription,
    item.duration ? `Duração: ${item.duration}` : "",
    item.period ? `Período: ${item.period}` : "",
    item.tuition ? `Mensalidade: ${item.tuition}` : "",
    item.campus ? `Campus: ${item.campus}` : "",
    item.candidatePerSeat ? `Relação candidato/vaga: ${item.candidatePerSeat}` : "",
    Array.isArray(item.admissions) && item.admissions.length ? `Formas de ingresso: ${item.admissions.join(", ")}` : "",
    item.cycle ? `Ciclo: ${item.cycle}` : "",
    item.status ? `Status: ${String(item.status).replaceAll("_", " ")}` : "",
    item.startDate && item.endDate ? `Período: ${formatDateForDisplay(item.startDate)} a ${formatDateForDisplay(item.endDate)}` : "",
    item.displayDate || item.displayTime ? `Quando: ${[item.displayDate, item.displayTime].filter(Boolean).join(" · ")}` : "",
  ].filter(Boolean);
  return parts.length ? `${title}: ${parts.join(". ")}` : String(title);
}

function buildResultSummary(journeys: JourneyItem[], leadName?: string) {
  const lines: string[] = [];
  lines.push("Resumo da sua navegação no Vestibular FGV");
  if (leadName?.trim()) lines.push(`Nome: ${leadName.trim()}`);
  lines.push(`Gerado em: ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date())}`);
  lines.push("");
  lines.push("Este resumo reúne as informações exibidas nas respostas geradas durante sua navegação, como cursos, datas, formas de ingresso, eventos, bolsas e próximos passos.");

  journeys
    .slice()
    .reverse()
    .forEach((journey, journeyIndex) => {
      lines.push("");
      lines.push(`${journeyIndex + 1}. ${journey.title || journey.question}`);
      lines.push(`Pergunta feita: ${journey.question}`);
      if (journey.plan?.answer) lines.push(`Resumo: ${journey.plan.answer}`);

      const sections = Array.isArray(journey.plan?.sections) ? journey.plan.sections : [];
      sections.forEach((section: Section) => {
        if (!section || section.type === "lead_form") return;
        lines.push("");
        lines.push(section.title || "Seção");
        if (section.intro) lines.push(section.intro);
        if (section.course) lines.push(`- ${summarizeItem(section.course)}`);
        if (Array.isArray(section.items) && section.items.length) {
          section.items.slice(0, 12).forEach((item: any) => lines.push(`- ${summarizeItem(item)}`));
          if (section.items.length > 12) lines.push(`- E mais ${section.items.length - 12} item(ns) exibidos na interface.`);
        }
        if (Array.isArray(section.actions) && section.actions.length) {
          const actions = section.actions.map((action: any) => action.label || action.title).filter(Boolean);
          if (actions.length) lines.push(`Próximos caminhos: ${actions.join(", ")}`);
        }
      });
    });

  return lines.join("\n");
}

function splitTextToLines(text: string, maxChars = 88) {
  const output: string[] = [];
  text.split("\n").forEach((paragraph) => {
    if (!paragraph.trim()) {
      output.push("");
      return;
    }
    let line = "";
    paragraph.split(/\s+/).forEach((word) => {
      if ((line + " " + word).trim().length > maxChars) {
        output.push(line.trim());
        line = word;
      } else {
        line = `${line} ${word}`.trim();
      }
    });
    if (line.trim()) output.push(line.trim());
  });
  return output;
}

function latin1Sanitize(text: string) {
  return text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/•/g, "-")
    .replace(/[^\t\n\r\x20-\x7E\xA0-\xFF]/g, "");
}

function pdfEscape(text: string) {
  return latin1Sanitize(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createSimplePdfBlob(text: string) {
  const lines = splitTextToLines(text, 92);
  const pages: string[][] = [];
  const maxLinesPerPage = 45;
  for (let i = 0; i < lines.length; i += maxLinesPerPage) pages.push(lines.slice(i, i + maxLinesPerPage));

  const objects: string[] = [];
  const addObject = (content: string) => {
    objects.push(content);
    return objects.length;
  };

  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const pageIds: number[] = [];

  pages.forEach((pageLines) => {
    const streamLines = ["BT", "/F1 11 Tf", "50 790 Td", "14 TL"];
    pageLines.forEach((line, index) => {
      const escaped = pdfEscape(line);
      if (index === 0) streamLines.push(`(${escaped}) Tj`);
      else streamLines.push(`T* (${escaped}) Tj`);
    });
    streamLines.push("ET");
    const stream = streamLines.join("\n");
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  const pagesId = addObject(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  pageIds.forEach((pageId) => {
    objects[pageId - 1] = objects[pageId - 1].replace("/Parent 0 0 R", `/Parent ${pagesId} 0 R`);
  });
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: "application/pdf" });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 300);
}

function JourneyDrawer({
  open,
  journeys,
  activeId,
  onClose,
  onSelect,
  onClear,
  leadName,
  leadEmail,
  summaryUnlocked,
  onLeadNameChange,
  onLeadEmailChange,
  onUnlockSummary,
  onDownloadSummary,
  onShareWhatsApp,
}: {
  open: boolean;
  journeys: JourneyItem[];
  activeId?: string;
  onClose: () => void;
  onSelect: (item: JourneyItem) => void;
  onClear: () => void;
  leadName: string;
  leadEmail: string;
  summaryUnlocked: boolean;
  onLeadNameChange: (value: string) => void;
  onLeadEmailChange: (value: string) => void;
  onUnlockSummary: () => void;
  onDownloadSummary: () => void;
  onShareWhatsApp: () => void;
}) {
  const canUnlock = leadName.trim().length > 1 && /\S+@\S+\.\S+/.test(leadEmail.trim());

  return (
    <div className={open ? "fixed inset-0 z-50" : "pointer-events-none fixed inset-0 z-50"} aria-hidden={!open}>
      <div className={open ? "absolute inset-0 bg-foreground/25 backdrop-blur-[2px]" : "absolute inset-0 bg-transparent"} onClick={onClose} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l bg-background shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Histórico</p>
            <h2 className="mt-1 text-xl font-semibold">Suas perguntas</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Volte para qualquer resposta anterior sem perguntar de novo.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar histórico">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {journeys.length ? (
            <div className="space-y-3">
              {journeys.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={`w-full rounded-2xl border p-4 text-left transition hover:bg-muted/70 ${item.id === activeId ? "border-foreground bg-muted" : "bg-background"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">#{journeys.length - index}</span>
                    <span className="text-xs text-muted-foreground">{item.createdAt}</span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 font-semibold">{item.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{item.question}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-muted/40 p-5 text-sm text-muted-foreground">As consultas feitas aparecerão aqui.</div>
          )}

          {journeys.length ? (
            <div className="mt-6 rounded-2xl border border-dashed p-5">
              {!summaryUnlocked ? (
                <form
                  className="space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    onUnlockSummary();
                  }}
                >
                  <div>
                    <h3 className="text-lg font-semibold">Quer levar isso com você?</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Preencha seus dados para baixar um PDF com as informações que apareceram nas respostas geradas.</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input value={leadName} onChange={(event) => onLeadNameChange(event.target.value)} placeholder="Nome" aria-label="Nome" />
                    <Input value={leadEmail} onChange={(event) => onLeadEmailChange(event.target.value)} placeholder="E-mail" type="email" aria-label="E-mail" />
                  </div>
                  <Button type="submit" className="w-full" disabled={!canUnlock}>Liberar resumo</Button>
                  <p className="text-xs leading-5 text-muted-foreground">Protótipo: os dados ficam salvos apenas neste navegador. Em produção, este formulário pode ser integrado ao CRM.</p>
                </form>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold">Seu resumo está pronto</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Baixe o PDF com o conteúdo das respostas ou compartilhe uma versão curta pelo WhatsApp.</p>
                  <div className="mt-4 grid gap-2">
                    <Button onClick={onDownloadSummary}>Baixar PDF</Button>
                    <Button variant="outline" onClick={onShareWhatsApp}>Enviar por WhatsApp</Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
        {journeys.length ? (
          <div className="border-t p-4">
            <Button variant="outline" className="w-full" onClick={onClear}>Limpar histórico</Button>
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
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [summaryUnlocked, setSummaryUnlocked] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => plan?.sections || [], [plan]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("vestibular-ia-journey");
      if (stored) setJourneys(JSON.parse(stored));
      const storedLead = window.localStorage.getItem("vestibular-ia-summary-lead");
      if (storedLead) {
        const parsed = JSON.parse(storedLead);
        setLeadName(parsed.name || "");
        setLeadEmail(parsed.email || "");
        setSummaryUnlocked(Boolean(parsed.name && parsed.email));
      }
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
    setSummaryUnlocked(false);
    try {
      window.localStorage.removeItem("vestibular-ia-journey");
    } catch {}
  }

  function unlockSummary() {
    if (leadName.trim().length < 2 || !/\S+@\S+\.\S+/.test(leadEmail.trim())) return;
    setSummaryUnlocked(true);
    try {
      window.localStorage.setItem("vestibular-ia-summary-lead", JSON.stringify({ name: leadName.trim(), email: leadEmail.trim(), createdAt: new Date().toISOString() }));
    } catch {}
  }

  function downloadSummary() {
    const summary = buildResultSummary(journeys, leadName);
    const blob = createSimplePdfBlob(summary);
    downloadBlob(blob, "resumo-vestibular-fgv.pdf");
  }

  function shareWhatsAppSummary() {
    const latest = journeys[0];
    const summary = buildResultSummary(journeys.slice(0, 3), leadName);
    const shortText = [
      "Resumo da minha navegação no Vestibular FGV",
      latest ? `Última resposta: ${latest.title}` : "",
      "",
      summary.split("\n").slice(0, 14).join("\n"),
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(shortText)}`, "_blank", "noopener,noreferrer");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    submitQuestion(input);
  }

  const hasResult = Boolean(plan || loading || error || currentQuestion);

  return (
    <main ref={topRef} className="min-h-screen bg-background">
      <Header hasResult={hasResult} />
      <JourneyDrawer
        open={drawerOpen}
        journeys={journeys}
        activeId={activeJourneyId}
        onClose={() => setDrawerOpen(false)}
        onSelect={restoreJourney}
        onClear={clearJourney}
        leadName={leadName}
        leadEmail={leadEmail}
        summaryUnlocked={summaryUnlocked}
        onLeadNameChange={setLeadName}
        onLeadEmailChange={setLeadEmail}
        onUnlockSummary={unlockSummary}
        onDownloadSummary={downloadSummary}
        onShareWhatsApp={shareWhatsAppSummary}
      />

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
              <Menu className="h-4 w-4" /> Ver histórico
            </Button>
          ) : null}
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <div className="sticky top-[73px] z-30 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
            <div className="mx-auto flex max-w-4xl items-center gap-3">
              <form onSubmit={onSubmit} className="flex min-w-0 flex-1 gap-2 rounded-full border bg-muted p-2">
                <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Pergunte outra coisa sobre a graduação FGV..." className="border-0 bg-transparent focus:bg-transparent focus:ring-0" />
                <Button type="submit" size="icon" disabled={!input.trim() || loading} aria-label="Buscar"><ArrowUp className="h-5 w-5" /></Button>
              </form>
              {journeys.length ? (
                <Button variant="outline" onClick={() => setDrawerOpen(true)} className="shrink-0 gap-2 rounded-full px-4">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">Histórico</span>
                  <Badge className="ml-1">{journeys.length}</Badge>
                </Button>
              ) : null}
            </div>
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
