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


type PdfBlock = {
  type: "title" | "meta" | "h2" | "h3" | "p" | "bullet" | "small" | "divider";
  text?: string;
};

function cleanPdfText(value: any): string {
  if (value === null || value === undefined) return "";
  let text = Array.isArray(value) ? value.map(cleanPdfText).filter(Boolean).join(", ") : String(value);
  text = text
    .replace(/Consultar página do curso/gi, "")
    .replace(/consultar página do curso/gi, "")
    .replace(/consultar página/gi, "")
    .replace(/página oficial/gi, "")
    .replace(/site oficial/gi, "")
    .replace(/Status:\s*active\.?/gi, "")
    .replace(/Status:\s*inscricoes_em_breve\.?/gi, "Inscrições em breve")
    .replace(/\s+\./g, ".")
    .replace(/\.\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
  return text;
}

function hasUsefulValue(value: any): boolean {
  const text = cleanPdfText(value);
  if (!text) return false;
  return !/^[-–—]+$/.test(text);
}

function readableStatus(status?: string) {
  if (!status) return "";
  const cleaned = String(status).replaceAll("_", " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function formatDateForDisplay(date: string): string {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return cleanPdfText(date || "");
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function joinClean(parts: any[], separator = " · ") {
  return parts.map(cleanPdfText).filter(Boolean).join(separator);
}

function itemTitle(item: any): string {
  return cleanPdfText(item?.name || item?.displayName || item?.label || item?.title || "Item");
}

function admissionPeriod(item: any): string {
  if (item?.startDate && item?.endDate) return `${formatDateForDisplay(item.startDate)} a ${formatDateForDisplay(item.endDate)}`;
  if (item?.period) return cleanPdfText(item.period);
  return "";
}

function courseBullet(course: any, compact = false): string {
  const title = itemTitle(course);
  const head = joinClean([title, course?.city && course?.state ? `${course.city}/${course.state}` : course?.city, course?.school]);
  const parts = [head];
  if (hasUsefulValue(course?.summary)) parts.push(cleanPdfText(course.summary));
  const facts = [
    hasUsefulValue(course?.duration) ? `Duração: ${cleanPdfText(course.duration)}` : "",
    !compact && hasUsefulValue(course?.period) ? `Período: ${cleanPdfText(course.period)}` : "",
    !compact && hasUsefulValue(course?.tuition) ? `Mensalidade: ${cleanPdfText(course.tuition)}` : "",
    !compact && hasUsefulValue(course?.campus) ? `Campus: ${cleanPdfText(course.campus)}` : "",
    hasUsefulValue(course?.candidatePerSeat) ? `Candidato/vaga: ${cleanPdfText(course.candidatePerSeat).replace(/\.$/, "")}` : "",
    Array.isArray(course?.admissions) && course.admissions.length ? `Formas de ingresso: ${course.admissions.map(cleanPdfText).filter(Boolean).join(", ")}` : "",
  ].filter(Boolean);
  if (facts.length) parts.push(facts.join(". "));
  return parts.join(". ");
}

function simpleItemBullet(item: any): string {
  const title = itemTitle(item);
  const desc = cleanPdfText(item?.shortDescription || item?.description || item?.summary || item?.value || "");
  const extras = [
    item?.city && item?.state ? `${item.city}/${item.state}` : item?.city,
    item?.displayDate || item?.displayTime ? `Quando: ${joinClean([item.displayDate, item.displayTime])}` : "",
    admissionPeriod(item) ? `Período: ${admissionPeriod(item)}` : "",
    item?.cycle ? `Ciclo: ${cleanPdfText(item.cycle)}` : "",
    item?.status && item.status !== "active" ? readableStatus(item.status) : "",
  ].map(cleanPdfText).filter(Boolean);
  return [title, desc, extras.join(". ")].filter(Boolean).join(". ");
}

function pushParagraph(blocks: PdfBlock[], text?: string) {
  const cleaned = cleanPdfText(text);
  if (cleaned) blocks.push({ type: "p", text: cleaned });
}

function pushSection(blocks: PdfBlock[], section: Section) {
  if (!section || section.type === "lead_form" || section.type === "warning") return;
  if (section.type === "course_cards") {
    blocks.push({ type: "h2", text: cleanPdfText(section.title || "Cursos") });
    pushParagraph(blocks, section.intro);
    const items = Array.isArray(section.items) ? section.items : [];
    const grouped = items.reduce<Record<string, any[]>>((acc, item) => {
      const city = cleanPdfText(item?.city || "Outros");
      acc[city] ||= [];
      acc[city].push(item);
      return acc;
    }, {});
    const cityOrder = ["Rio de Janeiro", "São Paulo", "Brasília", ...Object.keys(grouped).filter((city) => !["Rio de Janeiro", "São Paulo", "Brasília"].includes(city))].filter((city) => grouped[city]?.length);
    cityOrder.forEach((city) => {
      blocks.push({ type: "h3", text: city });
      grouped[city].forEach((course) => blocks.push({ type: "bullet", text: courseBullet(course, true) }));
    });
    return;
  }

  if (section.type === "course_detail") {
    blocks.push({ type: "h2", text: cleanPdfText(section.title || "Detalhes do curso") });
    pushParagraph(blocks, section.intro);
    const items = Array.isArray(section.items) ? section.items : [];
    items.forEach((item: any) => {
      const title = itemTitle(item);
      const value = cleanPdfText(item?.value || item?.shortDescription || item?.description || "");
      if (title && value) blocks.push({ type: "bullet", text: `${title}: ${value}` });
    });
    return;
  }

  if (section.type === "next_step") {
    const actions = Array.isArray(section.actions) && section.actions.length ? section.actions : Array.isArray(section.items) ? section.items : [];
    if (!actions.length) return;
    blocks.push({ type: "h2", text: cleanPdfText(section.title || "Para continuar") });
    pushParagraph(blocks, section.intro);
    actions.forEach((action: any) => {
      const label = cleanPdfText(action?.label || action?.title);
      if (label) blocks.push({ type: "bullet", text: label });
    });
    return;
  }

  blocks.push({ type: "h2", text: cleanPdfText(section.title || "Informações") });
  pushParagraph(blocks, section.intro);
  if (section.course) blocks.push({ type: "bullet", text: courseBullet(section.course, false) });
  const items = Array.isArray(section.items) ? section.items : [];
  items.forEach((item: any) => {
    const text = section.type === "timeline" ? joinClean([item?.label || item?.title, item?.value, item?.description], " - ") : simpleItemBullet(item);
    if (text) blocks.push({ type: "bullet", text });
  });
}

function buildPdfBlocks(journeys: JourneyItem[], leadName?: string): PdfBlock[] {
  const blocks: PdfBlock[] = [];
  blocks.push({ type: "title", text: "Resumo do seu resultado" });
  blocks.push({ type: "meta", text: "Vestibular FGV - Graduação" });
  if (leadName?.trim()) blocks.push({ type: "meta", text: `Preparado para: ${leadName.trim()}` });
  blocks.push({ type: "meta", text: `Gerado em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date())}` });
  blocks.push({ type: "divider" });
  blocks.push({ type: "p", text: "Este material reúne as principais informações que apareceram nas respostas da sua navegação: cursos, datas, formas de ingresso, eventos, bolsas, diferenciais e próximos caminhos." });

  journeys.slice().reverse().forEach((journey, index) => {
    blocks.push({ type: "divider" });
    blocks.push({ type: "h2", text: `${index + 1}. ${cleanPdfText(journey.title || journey.question)}` });
    blocks.push({ type: "small", text: `Pergunta: ${cleanPdfText(journey.question)}` });
    if (journey.plan?.answer) pushParagraph(blocks, journey.plan.answer);
    const sections = Array.isArray(journey.plan?.sections) ? journey.plan.sections : [];
    sections.forEach((section) => pushSection(blocks, section));
  });

  return blocks;
}

function splitTextToLines(text: string, maxChars = 88) {
  const output: string[] = [];
  cleanPdfText(text).split("\n").forEach((paragraph) => {
    if (!paragraph.trim()) {
      output.push("");
      return;
    }
    let line = "";
    paragraph.split(/\s+/).forEach((word) => {
      if ((line + " " + word).trim().length > maxChars) {
        if (line.trim()) output.push(line.trim());
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

function createSimplePdfBlob(blocks: PdfBlock[]) {
  const pageWidth = 595;
  const pageHeight = 842;
  const marginX = 48;
  const topMargin = 58;
  const bottomMargin = 52;
  let y = topMargin;
  const pages: string[][] = [[]];
  let current = pages[0];

  const newPage = () => {
    current = [];
    pages.push(current);
    y = topMargin;
  };

  const write = (command: string) => current.push(command);
  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - bottomMargin) newPage();
  };
  const textCommand = (font: "F1" | "F2", size: number, x: number, yy: number, text: string) => `BT /${font} ${size} Tf ${x} ${pageHeight - yy} Td (${pdfEscape(text)}) Tj ET`;
  const drawText = (text: string, font: "F1" | "F2", size: number, x: number, lineHeight: number, maxChars: number) => {
    const lines = splitTextToLines(text, maxChars);
    ensureSpace(lines.length * lineHeight + 2);
    lines.forEach((line) => {
      write(textCommand(font, size, x, y, line));
      y += lineHeight;
    });
  };

  blocks.forEach((block) => {
    const text = cleanPdfText(block.text || "");
    if (block.type !== "divider" && !text) return;
    if (block.type === "divider") {
      ensureSpace(24);
      y += 10;
      write(`0.85 0.85 0.82 RG ${marginX} ${pageHeight - y} m ${pageWidth - marginX} ${pageHeight - y} l S`);
      y += 18;
      return;
    }
    if (block.type === "title") {
      ensureSpace(54);
      drawText(text, "F2", 24, marginX, 30, 36);
      y += 4;
      return;
    }
    if (block.type === "meta") {
      drawText(text, "F1", 10, marginX, 15, 90);
      return;
    }
    if (block.type === "h2") {
      ensureSpace(34);
      y += 4;
      drawText(text, "F2", 16, marginX, 22, 58);
      return;
    }
    if (block.type === "h3") {
      ensureSpace(26);
      y += 2;
      drawText(text, "F2", 12, marginX, 17, 74);
      return;
    }
    if (block.type === "small") {
      drawText(text, "F1", 9, marginX, 13, 96);
      y += 2;
      return;
    }
    if (block.type === "bullet") {
      const lines = splitTextToLines(text, 86);
      ensureSpace(lines.length * 13 + 8);
      write(textCommand("F1", 10, marginX + 6, y, `- ${lines[0] || ""}`));
      y += 13;
      lines.slice(1).forEach((line) => {
        write(textCommand("F1", 10, marginX + 18, y, line));
        y += 13;
      });
      y += 2;
      return;
    }
    drawText(text, "F1", 10.5, marginX, 15, 88);
    y += 3;
  });

  const objects: string[] = [];
  const addObject = (content: string) => {
    objects.push(content);
    return objects.length;
  };
  const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const pageIds: number[] = [];

  pages.forEach((commands, pageIndex) => {
    const footer = textCommand("F1", 8, pageWidth - 92, pageHeight - 26, `${pageIndex + 1}/${pages.length}`);
    const stream = [...commands, footer].join("\n");
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`);
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
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Preencha seus dados para baixar um PDF com o resumo dos resultados que apareceram na página.</p>
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
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Baixe o PDF com o conteúdo organizado dos seus resultados ou compartilhe uma versão curta pelo WhatsApp.</p>
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
    const blocks = buildPdfBlocks(journeys, leadName);
    const blob = createSimplePdfBlob(blocks);
    downloadBlob(blob, "resumo-vestibular-fgv.pdf");
  }

  function shareWhatsAppSummary() {
    const latest = journeys[0];
    const shortText = [
      "Resumo do meu resultado no Vestibular FGV",
      latest ? `Última resposta: ${latest.title}` : "",
      latest?.plan?.answer ? cleanPdfText(latest.plan.answer) : "",
      "",
      "Baixei um resumo com cursos, datas, formas de ingresso e próximos caminhos para a graduação FGV."
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
