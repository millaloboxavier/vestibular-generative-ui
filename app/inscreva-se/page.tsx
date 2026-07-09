import Link from "next/link";
import data from "@/data/graduacao-content.json";
import { InscrevaSeForm } from "@/components/inscreva-se-form";

function admissionIdForLabel(name: string): string | null {
  const n = String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (n.includes("demanda")) return "demanda-social-diversidade";
  if (n.includes("internacion")) return "exames-internacionais";
  if (n.includes("enem")) return "enem";
  if (n.includes("olimpiada")) return "olimpiadas";
  if (n.includes("transfer") || n.includes("diploma")) return "transferencia-externa";
  if (n.includes("vestibular")) return "vestibular-fgv";
  return null;
}

export default async function InscrevaSePage({ searchParams }: { searchParams: Promise<{ curso?: string; forma?: string }> }) {
  const params = await searchParams;

  const admissionTypes = ((data as any).admissionTypes || []).map((item: any) => ({
    id: item.id,
    label: item.label || item.name || "Forma de ingresso",
    open: String(item.status || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .includes("abert")
  }));

  const courses = ((data as any).courses || []).map((course: any, index: number) => ({
    id: course.id || `course-${index}`,
    name: course.displayName || course.name || "Curso",
    city: course.city || "",
    school: course.school || "",
    admissionIds: Array.from(
      new Set((course.admissions || []).map((label: string) => admissionIdForLabel(label)).filter(Boolean))
    ) as string[]
  }));

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3 font-semibold transition-opacity hover:opacity-75" aria-label="Ir para a página inicial do Vestibular FGV">
            <span className="h-8 w-8 rounded-full bg-foreground md:h-9 md:w-9" />
            <span className="text-lg md:text-xl">Vestibular FGV</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Voltar
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <div className="mb-8 rounded-[2rem] border bg-muted/40 p-6 md:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Inscrição</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Finalize sua inscrição</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Confirme cidade, curso e forma de ingresso. No final, você é levado ao formulário de inscrição.
          </p>
        </div>

        <InscrevaSeForm courses={courses} admissionTypes={admissionTypes} initialCourseId={params.curso} initialAdmissionId={params.forma} />
      </section>
    </main>
  );
}
