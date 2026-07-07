import Link from "next/link";
import { notFound } from "next/navigation";
import data from "@/data/vestibular-content.json";

const primaryNavItems = [
  { label: "Cursos", href: "/cursos" },
  { label: "Formas de Ingresso", href: "/formas-de-ingresso" },
  { label: "Eventos", href: "/eventos" },
  { label: "BLOG", href: "/blog" },
];

const completeMenuItems = [
  { label: "Cursos", href: "/cursos" },
  { label: "Formas de Ingresso", href: "/formas-de-ingresso" },
  { label: "Editais", href: "/editais" },
  { label: "Provas e Gabaritos", href: "/provas-gabaritos" },
  { label: "Resultados", href: "/resultados" },
  { label: "Locais de Prova", href: "/locais-de-prova" },
  { label: "Acompanhe sua Inscrição", href: "/acompanhe-sua-inscricao" },
  { label: "Bolsas de Estudo", href: "/bolsas-de-estudo" },
  { label: "Eventos", href: "/eventos" },
  { label: "Contato", href: "/contato" },
];

const pages: Record<string, { title: string; intro: string }> = {
  "cursos": { title: "Cursos de graduação", intro: "Conheça os cursos de graduação da FGV por cidade." },
  "formas-de-ingresso": { title: "Formas de ingresso", intro: "Veja as modalidades disponíveis para entrar na graduação FGV." },
  "editais": { title: "Editais", intro: "Acompanhe editais, manuais e documentos do processo seletivo." },
  "provas-gabaritos": { title: "Provas e Gabaritos", intro: "Consulte materiais para estudar e se preparar para o Vestibular FGV." },
  "resultados": { title: "Resultados", intro: "Acompanhe resultados e chamadas do processo seletivo." },
  "locais-de-prova": { title: "Locais de prova", intro: "Veja orientações sobre cidades e locais de realização das provas." },
  "acompanhe-sua-inscricao": { title: "Acompanhe sua inscrição", intro: "Acesse orientações para acompanhar sua inscrição no processo seletivo." },
  "bolsas-de-estudo": { title: "Bolsas de estudo", intro: "Conheça as modalidades de bolsas oferecidas pela FGV para graduação." },
  "eventos": { title: "Eventos da graduação", intro: "Participe de experiências para conhecer a FGV de perto." },
  "contato": { title: "Contato", intro: "Encontre canais para tirar dúvidas sobre o Vestibular FGV." },
  "blog": { title: "Blog", intro: "Conteúdos para ajudar na escolha do curso, preparação e decisão pela graduação." },
};

function StaticHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold transition-opacity hover:opacity-75" aria-label="Ir para a página inicial do Vestibular FGV">
          <span className="h-8 w-8 rounded-full bg-foreground md:h-9 md:w-9" />
          <span className="text-lg md:text-xl">Vestibular FGV</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
          {primaryNavItems.map((item) => <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">{item.label}</Link>)}
        </nav>
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-full border px-4 py-2 text-sm font-medium">Menu completo</summary>
          <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 grid w-72 gap-1 rounded-3xl border bg-background p-2 shadow-2xl">
            {completeMenuItems.map((item) => <Link key={item.href} href={item.href} className="rounded-2xl px-4 py-3 text-sm font-medium hover:bg-muted">{item.label}</Link>)}
          </div>
        </details>
      </div>
    </header>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      {children ? <div className="mt-4 text-sm leading-6 text-muted-foreground">{children}</div> : null}
    </article>
  );
}

function CoursesContent() {
  const groups = (data as any).courses.reduce((acc: Record<string, any[]>, course: any) => {
    acc[course.city] ||= [];
    acc[course.city].push(course);
    return acc;
  }, {});
  const order = ["Rio de Janeiro", "São Paulo", "Brasília"].filter((city) => groups[city]);
  return (
    <div className="space-y-8">
      {order.map((city) => (
        <section key={city}>
          <h2 className="mb-4 text-2xl font-semibold">{city}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups[city].map((course: any) => <Card key={course.id} title={course.displayName || course.name} subtitle={`${course.school} · ${course.state}`}>{course.summary}</Card>)}
          </div>
        </section>
      ))}
    </div>
  );
}

function AdmissionsContent() {
  return <div className="grid gap-4 md:grid-cols-2">{(data as any).admissionTypes.map((item: any) => <Card key={item.id} title={item.label} subtitle={`${item.cycle || ""} · ${item.status === "inscricoes_em_breve" ? "Inscrições em breve" : item.status || ""}`}>{item.description}</Card>)}</div>;
}

function EventsContent() {
  const events = (data as any).graduationEvents?.events || [];
  return <div className="grid gap-4 md:grid-cols-2">{events.map((event: any) => <Card key={event.id} title={event.name} subtitle={`${event.city} · ${event.displayDate} · ${event.displayTime}`}>{event.description}</Card>)}</div>;
}

function ScholarshipsContent() {
  const programs = (data as any).scholarships?.programs || [];
  return <div className="grid gap-4 md:grid-cols-2">{programs.map((program: any) => <Card key={program.id} title={program.name} subtitle={program.type}>{program.shortDescription || program.description}</Card>)}</div>;
}

function MaterialsContent({ slug }: { slug: string }) {
  const materials = (data as any).materials || [];
  const selected = slug === "editais" ? materials.filter((m: any) => /edital|manual/i.test(m.label)) :
    slug === "provas-gabaritos" ? materials.filter((m: any) => /prova|gabarito/i.test(m.label)) :
    slug === "resultados" ? materials.filter((m: any) => /resultado/i.test(m.label)) : materials;
  return <div className="grid gap-4 md:grid-cols-2">{selected.map((item: any) => <Card key={item.id} title={item.label}>{item.description}</Card>)}</div>;
}

function GenericContent({ slug }: { slug: string }) {
  if (slug === "cursos") return <CoursesContent />;
  if (slug === "formas-de-ingresso") return <AdmissionsContent />;
  if (slug === "eventos") return <EventsContent />;
  if (slug === "bolsas-de-estudo") return <ScholarshipsContent />;
  if (["editais", "provas-gabaritos", "resultados"].includes(slug)) return <MaterialsContent slug={slug} />;

  const helper: Record<string, string[]> = {
    "locais-de-prova": ["A cidade de prova é escolhida no momento da inscrição, conforme as regras da forma de ingresso.", "Uma das opções deve ser a cidade onde o curso escolhido é oferecido: São Paulo, Rio de Janeiro ou Brasília."],
    "acompanhe-sua-inscricao": ["Acompanhe sua inscrição usando os dados cadastrados no processo seletivo.", "Guarde seus comprovantes e acompanhe prazos de resultado, chamadas e matrícula."],
    "contato": ["Use os canais de atendimento do Vestibular FGV para dúvidas sobre cursos, inscrições, documentos, bolsas e eventos."],
    "blog": ["Em breve, esta área poderá reunir conteúdos sobre escolha de curso, preparação para o vestibular, vida universitária e carreira."],
  };
  return <div className="grid gap-4 md:grid-cols-2">{(helper[slug] || []).map((text, index) => <Card key={index} title={index === 0 ? "Orientação" : "Importante"}>{text}</Card>)}</div>;
}

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();

  return (
    <main className="min-h-screen bg-background">
      <StaticHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="mb-8 rounded-[2rem] border bg-muted/40 p-6 md:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Conteúdo estático</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">{page.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">{page.intro}</p>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">Voltar para a busca generativa</Link>
        </div>
        <GenericContent slug={slug} />
      </section>
    </main>
  );
}
