"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Course = { id: string; name: string; city: string; school: string; admissionIds: string[] };
type AdmissionType = { id: string; label: string; open: boolean };

const EXTERNAL_FORM_URL = "https://portal.fgv.br";
const CITY_ORDER = ["Rio de Janeiro", "São Paulo", "Brasília"];

const selectClassName =
  "h-12 w-full rounded-full border border-border bg-muted px-5 text-sm outline-none transition-all focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/5 disabled:cursor-not-allowed disabled:opacity-50";

export function InscrevaSeForm({
  courses,
  admissionTypes,
  initialCourseId,
  initialAdmissionId
}: {
  courses: Course[];
  admissionTypes: AdmissionType[];
  initialCourseId?: string;
  initialAdmissionId?: string;
}) {
  const initialCourse = courses.find((course) => course.id === initialCourseId) || null;

  const cities = useMemo(() => {
    const set = new Set(courses.map((course) => course.city).filter(Boolean));
    const ordered = CITY_ORDER.filter((city) => set.has(city));
    const rest = [...set].filter((city) => !CITY_ORDER.includes(city)).sort();
    return [...ordered, ...rest];
  }, [courses]);

  const [city, setCity] = useState(initialCourse?.city || "");
  const [courseId, setCourseId] = useState(initialCourse?.id || "");
  const [admissionId, setAdmissionId] = useState(
    initialCourse ? (initialCourse.admissionIds.includes(initialAdmissionId || "") ? initialAdmissionId || "" : "") : initialAdmissionId || ""
  );

  const coursesInCity = useMemo(() => courses.filter((course) => !city || course.city === city), [courses, city]);
  const selectedCourse = courses.find((course) => course.id === courseId) || null;

  const admissionOptions = useMemo(() => {
    if (selectedCourse) {
      return selectedCourse.admissionIds
        .map((id) => admissionTypes.find((item) => item.id === id))
        .filter((item): item is AdmissionType => Boolean(item));
    }
    return admissionTypes;
  }, [selectedCourse, admissionTypes]);

  const selectedAdmission = admissionOptions.find((item) => item.id === admissionId) || null;

  function handleCityChange(nextCity: string) {
    setCity(nextCity);
    setCourseId("");
    setAdmissionId("");
  }

  function handleCourseChange(nextCourseId: string) {
    setCourseId(nextCourseId);
    setAdmissionId("");
  }

  return (
    <Card>
      <CardContent className="grid gap-4 pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="inscreva-cidade">Cidade</label>
            <select id="inscreva-cidade" className={selectClassName} value={city} onChange={(event) => handleCityChange(event.target.value)}>
              <option value="">Selecione</option>
              {cities.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="inscreva-curso">Curso</label>
            <select id="inscreva-curso" className={selectClassName} value={courseId} onChange={(event) => handleCourseChange(event.target.value)} disabled={!city}>
              <option value="">Selecione</option>
              {coursesInCity.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="inscreva-forma">Forma de ingresso</label>
            <select id="inscreva-forma" className={selectClassName} value={admissionId} onChange={(event) => setAdmissionId(event.target.value)} disabled={!admissionOptions.length}>
              <option value="">Selecione</option>
              {admissionOptions.map((admission) => <option key={admission.id} value={admission.id}>{admission.label}</option>)}
            </select>
          </div>
        </div>

        {selectedAdmission ? (
          selectedAdmission.open ? (
            <div className="mt-2 flex flex-col gap-3 rounded-2xl border bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{selectedCourse ? `${selectedCourse.name} · ` : ""}{selectedAdmission.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">Inscrições abertas. Você será levado ao formulário de inscrição.</p>
              </div>
              <Button asChild size="lg" className="shrink-0">
                <a href={EXTERNAL_FORM_URL} target="_blank" rel="noopener noreferrer">
                  Inscreva-se
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-3 rounded-2xl border bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{selectedCourse ? `${selectedCourse.name} · ` : ""}{selectedAdmission.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">Essa modalidade não está com inscrições abertas no momento.</p>
              </div>
              <Button asChild variant="outline" size="lg" className="shrink-0">
                <Link href="/">
                  <Bell className="mr-2 h-4 w-4" />
                  Pedir aviso
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}
