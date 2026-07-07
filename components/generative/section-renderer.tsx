"use client";

import { ArrowRight, Bell, CalendarDays, GraduationCap, MapPin, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type Section = {
  type: string;
  title: string;
  intro?: string;
  layout?: string;
  items?: any[];
  actions?: { label: string; prompt: string; tone?: string }[];
  course?: any;
};

export type SkeletonVariant = "courses" | "timeline" | "admission" | "scholarships" | "events" | "detail" | "default";

function safeItems(section: Section) {
  return Array.isArray(section.items) ? section.items : [];
}

function groupedByCity(items: any[]) {
  return items.reduce<Record<string, any[]>>((acc, item) => {
    const city = item.city || "Outros";
    acc[city] ||= [];
    acc[city].push(item);
    return acc;
  }, {});
}

function normalizeCityForValue(city: string) {
  return city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
}

function SectionShell({ section, children, className }: { section: Section; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("animate-fade-up rounded-[1.35rem] border bg-background p-5 shadow-sm md:p-6", className)}>
      <div className="mb-5 max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{section.title}</h2>
        {section.intro ? <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">{section.intro}</p> : null}
      </div>
      {children}
    </section>
  );
}

function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("h-3 rounded-full bg-muted-foreground/15", className)} />;
}

function SkeletonCard({ variant = "card" }: { variant?: "card" | "compact" }) {
  return (
    <div className="rounded-2xl border bg-background p-5">
      <div className="flex gap-2">
        <div className="h-6 w-20 rounded-full bg-muted-foreground/15" />
        <div className="h-6 w-24 rounded-full bg-muted-foreground/15" />
      </div>
      <SkeletonLine className="mt-5 h-5 w-2/3" />
      <SkeletonLine className="mt-3 w-full" />
      <SkeletonLine className="mt-2 w-4/5" />
      {variant === "card" ? (
        <>
          <SkeletonLine className="mt-6 w-1/2" />
          <div className="mt-5 h-9 w-28 rounded-full bg-muted-foreground/15" />
        </>
      ) : null}
    </div>
  );
}

function CoursesSkeleton() {
  return (
    <div className="rounded-[1.35rem] border bg-background p-5 md:p-6">
      <SkeletonLine className="h-6 w-72 max-w-full" />
      <SkeletonLine className="mt-3 w-96 max-w-full" />
      <div className="mt-6 flex gap-2">
        <div className="h-9 w-28 rounded-full bg-foreground/15" />
        <div className="h-9 w-24 rounded-full bg-muted-foreground/15" />
        <div className="h-9 w-24 rounded-full bg-muted-foreground/15" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="rounded-[1.35rem] border border-foreground/20 bg-background p-5 md:p-6">
      <SkeletonLine className="h-6 w-72 max-w-full" />
      <SkeletonLine className="mt-3 w-80 max-w-full" />
      <div className="mt-6 grid gap-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex gap-4 rounded-2xl border bg-muted/30 p-4">
            <div className="h-10 w-10 rounded-full bg-muted-foreground/15" />
            <div className="flex-1">
              <SkeletonLine className="h-4 w-48" />
              <SkeletonLine className="mt-3 h-5 w-64 max-w-full" />
              <SkeletonLine className="mt-2 w-80 max-w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdmissionSkeleton() {
  return (
    <div className="rounded-[1.35rem] border bg-background p-5 md:p-6">
      <SkeletonLine className="h-6 w-64" />
      <SkeletonLine className="mt-3 w-96 max-w-full" />
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => <SkeletonCard key={item} variant="compact" />)}
      </div>
    </div>
  );
}

function EventsSkeleton() {
  return (
    <div className="rounded-[1.35rem] border bg-background p-5 md:p-6">
      <SkeletonLine className="h-6 w-64" />
      <SkeletonLine className="mt-3 w-80 max-w-full" />
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => <SkeletonCard key={item} variant="compact" />)}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="rounded-[1.35rem] border bg-background p-5 md:p-6">
      <SkeletonLine className="h-6 w-72 max-w-full" />
      <SkeletonLine className="mt-3 w-96 max-w-full" />
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="rounded-2xl border bg-muted/30 p-4">
            <SkeletonLine className="h-3 w-20" />
            <SkeletonLine className="mt-4 h-5 w-40 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <div className="rounded-[1.35rem] border bg-background p-5 md:p-6">
      <SkeletonLine className="h-6 w-64" />
      <SkeletonLine className="mt-3 w-96 max-w-full" />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function GenerativeSkeleton({ variant }: { variant: SkeletonVariant }) {
  const content = (() => {
    if (variant === "courses") return <CoursesSkeleton />;
    if (variant === "timeline") return <TimelineSkeleton />;
    if (variant === "admission") return <AdmissionSkeleton />;
    if (variant === "scholarships") return <AdmissionSkeleton />;
    if (variant === "events") return <EventsSkeleton />;
    if (variant === "detail") return <DetailSkeleton />;
    return <DefaultSkeleton />;
  })();

  return <div className="mt-6 animate-pulse">{content}</div>;
}

function CourseCard({ course, onPrompt }: { course: any; onPrompt: (prompt: string) => void }) {
  const title = course.name || course.displayName || "Curso";
  return (
    <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <div className="mb-2 flex flex-wrap gap-2">
          {course.city ? <Badge>{course.city}</Badge> : null}
          {course.school ? <Badge>{course.school}</Badge> : null}
        </div>
        <CardTitle className="leading-tight">{title}</CardTitle>
        {course.summary ? <CardDescription>{course.summary}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm text-muted-foreground">
          {course.duration ? <span><strong className="text-foreground">Duração:</strong> {course.duration}</span> : null}
          {course.period ? <span><strong className="text-foreground">Período:</strong> {course.period}</span> : null}
        </div>
        <Button variant="outline" size="sm" onClick={() => onPrompt(`detalhes do curso ${title} em ${course.city || ""}`)}>
          Ver detalhes
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function CoursesSection({ section, onPrompt }: { section: Section; onPrompt: (prompt: string) => void }) {
  const items = safeItems(section);
  const groups = groupedByCity(items);
  const cityOrder = ["Rio de Janeiro", "São Paulo", "Brasília", ...Object.keys(groups).filter((city) => !["Rio de Janeiro", "São Paulo", "Brasília"].includes(city))].filter((city) => groups[city]?.length);

  if (section.layout === "tabs_by_city" && cityOrder.length > 1) {
    const first = normalizeCityForValue(cityOrder[0]);
    return (
      <SectionShell section={section}>
        <Tabs defaultValue={first}>
          <TabsList>
            {cityOrder.map((city) => (
              <TabsTrigger key={city} value={normalizeCityForValue(city)}>{city}</TabsTrigger>
            ))}
          </TabsList>
          {cityOrder.map((city) => (
            <TabsContent key={city} value={normalizeCityForValue(city)}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {groups[city].map((course) => <CourseCard key={course.id || `${course.name}-${course.city}`} course={course} onPrompt={onPrompt} />)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </SectionShell>
    );
  }

  return (
    <SectionShell section={section}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((course) => <CourseCard key={course.id || `${course.name}-${course.city}`} course={course} onPrompt={onPrompt} />)}
      </div>
    </SectionShell>
  );
}

function DetailSection({ section }: { section: Section }) {
  const items = safeItems(section);
  return (
    <SectionShell section={section}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <Card key={item.id || index} className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-medium leading-6">{item.value || item.shortDescription}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

function ListCards({ section, icon, onPrompt }: { section: Section; icon?: React.ReactNode; onPrompt?: (prompt: string) => void }) {
  const items = safeItems(section);
  const showLearnMore = section.type === "admission_options" && Boolean(onPrompt);
  return (
    <SectionShell section={section}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <Card key={item.id || index}>
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                {icon}
                {item.type ? <Badge>{item.type}</Badge> : item.status ? <Badge>{item.status}</Badge> : null}
              </div>
              <CardTitle>{item.label || item.name || item.title}</CardTitle>
              <CardDescription>{item.description || item.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {item.period ? <p><strong className="text-foreground">Período:</strong> {item.period}</p> : null}
              {item.cycle ? <p><strong className="text-foreground">Ciclo:</strong> {item.cycle}</p> : null}
              {item.displayDate || item.displayTime ? <p><strong className="text-foreground">Quando:</strong> {[item.displayDate, item.displayTime].filter(Boolean).join(" · ")}</p> : null}
              {item.city ? <p className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {item.city}</p> : null}
              {showLearnMore && item.label ? (
                <Button variant="outline" size="sm" onClick={() => onPrompt!(`saiba mais sobre ${item.label} como forma de ingresso`)}>
                  Saiba mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

function TimelineSection({ section }: { section: Section }) {
  const items = safeItems(section);
  return (
    <SectionShell section={section} className="border-foreground/20">
      <div className="grid gap-3">
        {items.map((item, index) => (
          <div key={item.id || index} className="flex gap-4 rounded-2xl border bg-muted/30 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background"><CalendarDays className="h-4 w-4" /></div>
            <div>
              <h3 className="font-semibold">{item.label || item.title}</h3>
              <p className="mt-1 text-lg font-medium">{item.value}</p>
              {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function CompareSection({ section }: { section: Section }) {
  const items = safeItems(section);
  return (
    <SectionShell section={section}>
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 font-medium">Curso</th>
              <th className="p-4 font-medium">Cidade</th>
              <th className="p-4 font-medium">Escola</th>
              <th className="p-4 font-medium">Duração</th>
              <th className="p-4 font-medium">Formas de ingresso</th>
            </tr>
          </thead>
          <tbody>
            {items.map((course, index) => (
              <tr key={course.id || index} className="border-t align-top">
                <td className="p-4 font-semibold">{course.name || course.displayName}</td>
                <td className="p-4">{course.city}</td>
                <td className="p-4">{course.school}</td>
                <td className="p-4">{course.duration || "—"}</td>
                <td className="p-4">{Array.isArray(course.admissions) ? course.admissions.join(", ") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}

function FaqSection({ section }: { section: Section }) {
  const items = safeItems(section);
  return (
    <SectionShell section={section}>
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem key={item.id || index} value={item.id || `faq-${index}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  );
}

function LeadForm({ section }: { section: Section }) {
  return (
    <SectionShell section={section} className="bg-muted/40">
      <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={(e) => e.preventDefault()}>
        <Input placeholder="Nome" aria-label="Nome" />
        <Input placeholder="E-mail" type="email" aria-label="E-mail" />
        <Button type="submit"><Bell className="mr-2 h-4 w-4" /> Receber aviso</Button>
      </form>
      <p className="mt-3 text-xs text-muted-foreground">Protótipo: o envio ainda não está conectado a uma base de leads.</p>
    </SectionShell>
  );
}

function NextStep({ section, onPrompt, onCompareRequest }: { section: Section; onPrompt: (prompt: string) => void; onCompareRequest?: () => void }) {
  const actions = Array.isArray(section.actions) && section.actions.length ? section.actions : safeItems(section);
  return (
    <section className="animate-fade-up rounded-[1.35rem] border bg-foreground p-5 text-background shadow-sm md:p-6">
      <h2 className="text-xl font-semibold">{section.title}</h2>
      {section.intro ? <p className="mt-2 text-sm leading-6 text-background/70 md:text-base">{section.intro}</p> : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {actions.map((action, index) => {
          const label = action.label || action.title || "Continuar";
          const isCompareAction = /comparar/i.test(label) || /comparar/i.test(action.prompt || "");
          return (
            <Button
              key={label || index}
              variant="secondary"
              onClick={() => {
                if (isCompareAction && onCompareRequest) onCompareRequest();
                else if (action.prompt) onPrompt(action.prompt);
              }}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </section>
  );
}

export function SectionRenderer({ section, onPrompt, onCompareRequest }: { section: Section; onPrompt: (prompt: string) => void; onCompareRequest?: () => void }) {
  if (section.type === "course_cards") return <CoursesSection section={section} onPrompt={onPrompt} />;
  if (section.type === "course_detail") return <DetailSection section={section} />;
  if (section.type === "course_compare") return <CompareSection section={section} />;
  if (section.type === "timeline") return <TimelineSection section={section} />;
  if (["admission_options", "admission_details"].includes(section.type)) return <ListCards section={section} icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />} onPrompt={onPrompt} />;
  if (["events"].includes(section.type)) return <ListCards section={section} icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />} />;
  if (["scholarships", "course_differentials", "school_recognitions", "prep_materials", "warning"].includes(section.type)) return <ListCards section={section} icon={<Sparkles className="h-4 w-4 text-muted-foreground" />} />;
  if (section.type === "faq") return <FaqSection section={section} />;
  if (section.type === "lead_form") return <LeadForm section={section} />;
  if (section.type === "next_step") return <NextStep section={section} onPrompt={onPrompt} onCompareRequest={onCompareRequest} />;
  return null;
}
