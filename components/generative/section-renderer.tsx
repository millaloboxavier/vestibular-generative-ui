"use client";

import { ArrowRight, Bell, CalendarDays, GraduationCap, MapPin, Sparkles } from "lucide-react";
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

function ListCards({ section, icon }: { section: Section; icon?: React.ReactNode }) {
  const items = safeItems(section);
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

function NextStep({ section, onPrompt }: { section: Section; onPrompt: (prompt: string) => void }) {
  const actions = Array.isArray(section.actions) && section.actions.length ? section.actions : safeItems(section);
  return (
    <section className="animate-fade-up rounded-[1.35rem] border bg-foreground p-5 text-background shadow-sm md:p-6">
      <h2 className="text-xl font-semibold">{section.title}</h2>
      {section.intro ? <p className="mt-2 text-sm leading-6 text-background/70 md:text-base">{section.intro}</p> : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button key={action.label || index} variant="secondary" onClick={() => action.prompt && onPrompt(action.prompt)}>
            {action.label || action.title}
          </Button>
        ))}
      </div>
    </section>
  );
}

export function SectionRenderer({ section, onPrompt }: { section: Section; onPrompt: (prompt: string) => void }) {
  if (section.type === "course_cards") return <CoursesSection section={section} onPrompt={onPrompt} />;
  if (section.type === "course_detail") return <DetailSection section={section} />;
  if (section.type === "course_compare") return <CompareSection section={section} />;
  if (section.type === "timeline") return <TimelineSection section={section} />;
  if (["admission_options", "admission_details"].includes(section.type)) return <ListCards section={section} icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />} />;
  if (["events"].includes(section.type)) return <ListCards section={section} icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />} />;
  if (["scholarships", "course_differentials", "school_recognitions", "prep_materials", "warning"].includes(section.type)) return <ListCards section={section} icon={<Sparkles className="h-4 w-4 text-muted-foreground" />} />;
  if (section.type === "lead_form") return <LeadForm section={section} />;
  if (section.type === "next_step") return <NextStep section={section} onPrompt={onPrompt} />;
  return null;
}
