"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Bell, CalendarDays, Check, Download, FileText, GraduationCap, MapPin, Play, Sparkles } from "lucide-react";
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
  const curriculumUrl = section.course?.curriculumUrl;
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
      {curriculumUrl ? (
        <Button asChild variant="outline" className="mt-4 gap-2">
          <a href={curriculumUrl} target="_blank" rel="noopener noreferrer">
            <FileText className="h-4 w-4" />
            Ver grade curricular
          </a>
        </Button>
      ) : null}
    </SectionShell>
  );
}

function ItemTable({ table }: { table: { columns: string[]; rows: string[][] } }) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-muted">
          <tr>
            {table.columns.map((column) => <th key={column} className="p-3 font-medium">{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t align-top">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="p-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListCards({ section, icon, onPrompt }: { section: Section; icon?: React.ReactNode; onPrompt?: (prompt: string) => void }) {
  const items = safeItems(section);
  const showLearnMore = section.type === "admission_options" && Boolean(onPrompt);
  const showAdmissionCta = section.type === "admission_options";
  return (
    <SectionShell section={section}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => {
          const hasTable = item.table && Array.isArray(item.table.rows) && item.table.rows.length;
          const ctaAdmission = item.ctaAdmission;
          const hasCtaAdmission = Boolean(ctaAdmission);
          const wide = hasTable || hasCtaAdmission;
          return (
            <Card key={item.id || index} className={wide ? "min-w-0 md:col-span-2 xl:col-span-3" : undefined}>
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
                {hasTable ? <ItemTable table={item.table} /> : null}
                {hasCtaAdmission ? (
                  ctaAdmission.open ? (
                    <Button asChild size="sm">
                      <Link href={ctaAdmission.href}>
                        Inscreva-se
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => onPrompt?.(ctaAdmission.prompt)}>
                      <Bell className="mr-2 h-3.5 w-3.5" />
                      Avise-me
                    </Button>
                  )
                ) : null}
                {item.url ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-3.5 w-3.5" />
                      Baixar
                    </a>
                  </Button>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {showAdmissionCta && item.open !== undefined ? (
                    item.open ? (
                      <Button asChild size="sm">
                        <Link href={item.href}>
                          Inscreva-se
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => onPrompt?.(item.prompt)}>
                        <Bell className="mr-2 h-3.5 w-3.5" />
                        Avise-me
                      </Button>
                    )
                  ) : null}
                  {showLearnMore && item.label ? (
                    <Button variant="outline" size="sm" onClick={() => onPrompt!(`saiba mais sobre ${item.label} como forma de ingresso`)}>
                      Saiba mais
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
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
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 font-medium">Curso</th>
              <th className="p-4 font-medium">Cidade</th>
              <th className="p-4 font-medium">Escola</th>
              <th className="p-4 font-medium">Duração</th>
              <th className="p-4 font-medium">Formas de ingresso</th>
              <th className="p-4 font-medium">Áreas de atuação</th>
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
                <td className="p-4">{Array.isArray(course.careerPaths) && course.careerPaths.length ? course.careerPaths.join(", ") : "—"}</td>
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

function NumbersSection({ section }: { section: Section }) {
  const items = safeItems(section);
  return (
    <SectionShell section={section}>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item, index) => (
          <div key={item.id || index} className="rounded-2xl border bg-muted/30 p-5 text-center">
            <p className="text-2xl font-semibold tracking-tight md:text-3xl">{item.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function NumbersBanner({ section }: { section: Section }) {
  const items = safeItems(section);
  return (
    <section className="animate-fade-up rounded-[1.35rem] bg-foreground p-6 text-background shadow-sm md:p-10">
      <div className="mb-6 max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{section.title}</h2>
        {section.intro ? <p className="mt-2 text-sm leading-6 text-background/70 md:text-base">{section.intro}</p> : null}
      </div>
      <div className="flex flex-wrap gap-x-10 gap-y-6">
        {items.map((item, index) => (
          <div key={item.id || index} className="min-w-[7rem]">
            <p className="text-3xl font-semibold tracking-tight md:text-5xl">{item.value}</p>
            <p className="mt-1 text-sm text-background/70 md:text-base">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CareerPathsSection({ section }: { section: Section }) {
  const items = safeItems(section);
  return (
    <SectionShell section={section}>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span key={item.id || index} className="rounded-full border bg-muted/40 px-4 py-2 text-sm">
            {item.label}
          </span>
        ))}
      </div>
    </SectionShell>
  );
}

function ExperienceSection({ section }: { section: Section }) {
  const items = safeItems(section);
  return (
    <SectionShell section={section}>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={item.id || index} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
              <Check className="h-3 w-3" />
            </span>
            <span className="text-sm leading-6 text-foreground">{item.label}</span>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function TestimonialsSection({ section }: { section: Section }) {
  const items = safeItems(section);
  return (
    <SectionShell section={section}>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <Card key={item.id || index} className="bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-base leading-7 text-foreground">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold">{item.name}</p>
              {item.role ? <p className="text-xs text-muted-foreground">{item.role}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

function TestimonialSpotlight({ section }: { section: Section }) {
  const items = safeItems(section);
  const item = items[0];
  if (!item) return null;
  return (
    <SectionShell section={section}>
      <div className="mx-auto max-w-2xl text-center">
        <span className="font-serif text-6xl leading-none text-muted-foreground/30">&ldquo;</span>
        <p className="-mt-3 text-xl font-medium leading-8 text-foreground md:text-2xl">{item.quote}</p>
        <p className="mt-6 text-sm font-semibold">{item.name}</p>
        {item.role ? <p className="text-xs text-muted-foreground">{item.role}</p> : null}
      </div>
    </SectionShell>
  );
}

function RecognitionsWithPhoto({ section }: { section: Section }) {
  const items = safeItems(section);
  return (
    <SectionShell section={section}>
      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted-foreground/20">
          <GraduationCap className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id || index} className="flex gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-semibold">{item.title}</p>
                {item.description ? <p className="text-sm text-muted-foreground">{item.description}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function VideoCard({ video }: { video: any }) {
  const [playing, setPlaying] = useState(false);
  const thumbnail = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;

  return (
    <div className="overflow-hidden rounded-2xl border bg-background">
      <div className="relative aspect-video w-full bg-muted">
        {playing ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative block h-full w-full"
            aria-label={`Assistir: ${video.title}`}
          >
            <img src={thumbnail} alt={video.title} className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/20 transition group-hover:bg-foreground/30">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background/90 shadow-lg transition group-hover:scale-105">
                <Play className="ml-1 h-6 w-6 fill-foreground text-foreground" />
              </span>
            </span>
          </button>
        )}
      </div>
      <p className="p-4 text-sm font-medium leading-5">{video.title}</p>
    </div>
  );
}

function VideosSection({ section }: { section: Section }) {
  const items = safeItems(section);
  return (
    <SectionShell section={section}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => <VideoCard key={item.id || index} video={item} />)}
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
              key={`${label}-${index}`}
              variant="secondary"
              className="h-auto whitespace-normal text-left"
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
  if (["scholarships", "course_differentials", "prep_materials", "warning"].includes(section.type)) return <ListCards section={section} icon={<Sparkles className="h-4 w-4 text-muted-foreground" />} />;
  if (section.type === "school_recognitions") return section.layout === "foto" ? <RecognitionsWithPhoto section={section} /> : <ListCards section={section} icon={<Sparkles className="h-4 w-4 text-muted-foreground" />} />;
  if (section.type === "faq") return <FaqSection section={section} />;
  if (section.type === "course_numbers") return section.layout === "destaque" ? <NumbersBanner section={section} /> : <NumbersSection section={section} />;
  if (section.type === "course_careers") return <CareerPathsSection section={section} />;
  if (section.type === "course_testimonials") return section.layout === "spotlight" ? <TestimonialSpotlight section={section} /> : <TestimonialsSection section={section} />;
  if (section.type === "course_videos") return <VideosSection section={section} />;
  if (section.type === "course_experience") return <ExperienceSection section={section} />;
  if (section.type === "lead_form") return <LeadForm section={section} />;
  if (section.type === "next_step") return <NextStep section={section} onPrompt={onPrompt} onCompareRequest={onCompareRequest} />;
  return null;
}
