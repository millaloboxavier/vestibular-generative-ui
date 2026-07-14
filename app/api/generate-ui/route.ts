// @ts-nocheck
import { NextResponse } from "next/server";
import data from "@/data/graduacao-content.json";

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function asId(item, prefix, index) {
  return item?.id || `${prefix}-${index + 1}`;
}

function formatDate(dateString = "") {
  const match = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateString;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function formatPeriod(startDate, endDate) {
  if (startDate && endDate) return `${formatDate(startDate)} a ${formatDate(endDate)}`;
  if (startDate) return `a partir de ${formatDate(startDate)}`;
  if (endDate) return `até ${formatDate(endDate)}`;
  return "";
}

function labelStatus(status = "") {
  const value = normalize(status).replace(/_/g, " ");
  if (!value) return "";
  if (value.includes("em breve")) return "Inscrições em breve";
  if (value.includes("abert")) return "Inscrições abertas";
  if (value.includes("encerr")) return "Inscrições encerradas";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function cleanDisplayValue(text = "") {
  return String(text || "")
    .replace(/\s*\/\s*processo\s*/gi, " / processo ")
    .replace(/\s*indicado\s+na\s+página(\s+de\s+processo\s+seletivo)?/gi, "")
    .replace(/Consultar\s+página\s+do\s+curso/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanCopy(text = "") {
  let value = String(text || "");
  const replacements = [
    [/para mais informações sobre as datas e modalidades de ingresso,?\s*(você pode )?(consultar|acessar|ver) (a )?(página|site) oficial( do Vestibular FGV)?\.?/gi, "Veja abaixo as datas e modalidades relacionadas à sua busca."],
    [/(você pode )?(consultar|acesse|acessar|ver|visite) (a )?(página|site) oficial( do Vestibular FGV)?\.?/gi, "Veja as informações nesta página."],
    [/consulte (o )?edital oficial\.?/gi, "Confira as orientações desta página."],
    [/na página oficial( do Vestibular FGV)?/gi, "nesta página"],
    [/página oficial( do Vestibular FGV)?/gi, "esta página"],
    [/site oficial( do Vestibular FGV)?/gi, "esta página"],
    [/site do Vestibular FGV/gi, "Vestibular FGV"],
    [/links oficiais/gi, "links úteis"],
    [/a partir desta busca/gi, "agora"],
    [/relacionadas? à sua busca/gi, "relacionadas ao que você procura"],
    [/para sua busca/gi, "para este momento"],
    [/sua busca/gi, "o que você procura"],
    [/esta busca/gi, "este momento"],
    [/resultado da busca/gi, "Caminho sugerido"],
    [/oficial/gi, ""],
    [/\s+\./g, "."],
    [/\s+,/g, ","],
    [/\s{2,}/g, " "]
  ];
  replacements.forEach(([pattern, replacement]) => { value = value.replace(pattern, replacement); });
  return value.trim();
}

function courseName(course) {
  return course?.displayName || course?.name || "Curso";
}

function allEvents() {
  return safeArray(data.graduationEvents?.events || data.events).map((event, index) => ({
    id: asId(event, "event", index),
    name: event.name || event.title || "Evento",
    type: event.type || "Evento",
    city: event.city || "",
    state: event.state || "",
    date: event.date || "",
    displayDate: event.displayDate || formatDate(event.date || ""),
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    displayTime: event.displayTime || [event.startTime, event.endTime].filter(Boolean).join(" às "),
    status: event.status || "active",
    description: event.description || "",
    tags: safeArray(event.tags)
  }));
}

function catalog() {
  const courses = safeArray(data.courses).map((course, index) => ({
    id: asId(course, "course", index),
    name: courseName(course),
    rawName: course.name || "",
    city: course.city || "",
    state: course.state || "",
    school: course.school || "",
    schoolId: course.schoolId || "",
    entry: cleanDisplayValue(course.entry || ""),
    duration: cleanDisplayValue(course.duration || ""),
    period: cleanDisplayValue(course.period || ""),
    tuition: cleanDisplayValue(course.tuition || ""),
    campus: course.campus || "",
    admissions: safeArray(course.admissions),
    candidatePerSeat: course.candidatePerSeat || "",
    admissionDates: course.admissionDates || {},
    examDates: course.examDates || "",
    resultDate: course.resultDate || "",
    summary: course.summary || "",
    tags: safeArray(course.tags),
    hasDifferentials: safeArray(course.courseDifferentials).length > 0,
    hasNumbers: safeArray(course.numbers).length > 0,
    careerPaths: safeArray(course.careerPaths),
    hasCareerPaths: safeArray(course.careerPaths).length > 0,
    hasTestimonials: safeArray(course.testimonials).length > 0,
    hasVideos: safeArray(course.videos).length > 0
  }));

  const admissionTypes = safeArray(data.admissionTypes).map((item, index) => ({
    id: asId(item, "admission", index),
    label: item.label || item.name || "Forma de ingresso",
    description: item.description || "",
    status: item.status || "",
    statusLabel: labelStatus(item.status || ""),
    cycle: item.cycle || "",
    startDate: item.startDate || "",
    endDate: item.endDate || "",
    period: formatPeriod(item.startDate, item.endDate),
    shortDescription: item.shortDescription || "",
    registrationFrequency: item.registrationFrequency || "",
    eligibility: safeArray(item.eligibility),
    examFormat: safeArray(item.examFormat),
    examPhases: item.examPhases || "",
    preparation: item.preparation || "",
    requiredDocuments: safeArray(item.requiredDocuments),
    locationRule: item.locationRule || "",
    faq: safeArray(item.faq)
  }));

  const materials = safeArray(data.materials).map((item, index) => ({
    id: asId(item, "material", index),
    label: item.label || item.name || item.title || "Material",
    description: item.description || ""
  }));

  const scholarships = safeArray(data.scholarships?.programs || data.financialAid?.programs).map((item, index) => ({
    id: asId(item, "scholarship", index),
    name: item.name || item.title || "Bolsa",
    shortDescription: item.shortDescription || item.description || "",
    type: item.type || "",
    cities: safeArray(item.cities),
    tags: safeArray(item.tags)
  }));

  const schools = safeArray(data.schools).map((school, index) => ({
    id: asId(school, "school", index),
    name: school.name || "Escola",
    fullName: school.fullName || "",
    city: school.city || "",
    summary: school.summary || "",
    recognitionsTitle: school.recognitionsTitle || "Reconhecimentos da escola",
    recognitionsIntro: school.recognitionsIntro || "",
    recognitions: safeArray(school.recognitions).map((rec, recIndex) => ({
      id: asId(rec, "recognition", recIndex),
      title: rec.title || "Reconhecimento",
      description: rec.description || "",
      type: rec.type || ""
    }))
  }));

  return {
    courses,
    admissionTypes,
    materials,
    events: allEvents(),
    scholarships,
    schools
  };
}

function findByIds(collection, ids) {
  const wanted = new Set(safeArray(ids).filter(Boolean).map(String));
  return safeArray(collection).filter((item) => wanted.has(String(item.id)));
}

function cityHits(message, selectedCities = []) {
  const q = normalize(message);
  const hints = new Set(safeArray(selectedCities).map(normalize));
  if (q.includes("sao paulo") || q.includes("sp")) hints.add("sao paulo");
  if (q.includes("rio de janeiro") || q.includes(" rj") || q === "rio" || q.includes(" no rio") || q.includes("do rio")) hints.add("rio de janeiro");
  if (q.includes("brasilia") || q.includes("df")) hints.add("brasilia");
  return [...hints];
}

const SPECIFIC_SUBJECT_TERMS = ["direito", "economia", "administracao", "administração", "dados", "inteligencia", "inteligência", "comunicacao", "comunicação", "matematica", "matemática", "sociais", "relacoes", "relações"];

function hasSpecificSubject(q) {
  return SPECIFIC_SUBJECT_TERMS.some((term) => q.includes(normalize(term)));
}

function querySignals(message) {
  const q = normalize(message);
  return {
    q,
    asksCourse: /(curso|cursos|graduacao|graduação|administracao|administração|direito|economia|dados|inteligencia|inteligência|comunicacao|comunicação|relacoes|relações|matematica|matemática|sociais)/.test(q),
    // "quais cursos" sozinho é uma pergunta genérica, mas "quais cursos de administração"
    // já tem assunto específico — não deve cair no balde de "mostrar tudo".
    asksAllCourses: /(todos os cursos|quais cursos|cursos de graduacao|cursos de graduação|cursos disponiveis|cursos disponíveis|opcoes de curso|opções de curso|graduacao fgv|graduação fgv)/.test(q) && !hasSpecificSubject(q),
    asksDate: /(data|prazo|quando|inscric|inscrição|inscrever|termina|abre|abertura|calendario|calendário)/.test(q),
    asksVestibularSpecific: /(vestibular fgv|data.*vestibular|vestibular.*data|prova.*vestibular|vestibular.*prova|inscri.*vestibular|vestibular.*inscri|fazer o vestibular|quero fazer vestibular|vestibular$)/.test(q) && !/(enem|internacional|transfer|demanda social|olimpiad|modalidades|formas de ingresso|todas as formas)/.test(q),
    asksAdmission: /(vestibular|enem|ingresso|modalidade|transferencia|transferência|internacional|demanda social|olimpiada|olimpíada)/.test(q),
    asksScholarship: /(bolsa|bolsas|financiamento|merito|mérito|demanda social|restituivel|restituível)/.test(q),
    asksEvent: /(evento|visita|experiencia|experiência|imersiva|conhecer de perto|aula tematica|aula temática)/.test(q),
    asksPrep: /(prova|gabarito|treinar|preparar|conteudo programatico|conteúdo programático|edital)/.test(q),
    asksCompare: /(comparar|diferenca|diferença|versus| vs |qual e melhor|qual é melhor)/.test(q),
    asksDifferentials: /(diferencial|diferenciais|reconhecimento|reconhecida|internacional|duplo diploma|dupla graduacao|dupla graduação|carreira|vale a pena|ingles|inglês)/.test(q),
    asksLead: /(avis|avise|receber|notifica|notificar|quando abrir|em breve)/.test(q),
    asksFaq: /(duvida|dúvida|duvidas|dúvidas|pergunta frequente|perguntas frequentes|\bfaq\b|posso levar|pode levar|e presencial|é presencial)/.test(q)
  };
}

function matchAdmissionTypes(message, ids = []) {
  const q = normalize(message);
  const sig = querySignals(message);
  const all = safeArray(data.admissionTypes);
  const direct = findByIds(all, ids);
  if (direct.length) return direct;

  if (sig.asksVestibularSpecific) {
    const item = all.find((admission) => admission.id === "vestibular-fgv");
    return item ? [item] : [];
  }

  if (q.includes("enem")) return all.filter((item) => normalize(item.label || item.name || "").includes("enem"));
  // "internacional" no singular não é substring de "internacionais" no plural — usa o radical.
  if (q.includes("internacion")) return all.filter((item) => normalize(item.label || item.name || "").includes("internacion"));
  if (q.includes("transfer")) return all.filter((item) => normalize(item.label || item.name || "").includes("transfer"));
  if (q.includes("demanda")) return all.filter((item) => normalize(item.label || item.name || "").includes("demanda"));
  if (q.includes("olimpiada") || q.includes("olimpíada")) return all.filter((item) => normalize(item.label || item.name || "").includes("olimpi"));

  if (sig.asksAdmission || /formas de ingresso|modalidades|opcoes de ingresso|opções de ingresso/.test(q)) return all.slice(0, 6);
  if (sig.asksDate) {
    const item = all.find((admission) => admission.id === "vestibular-fgv");
    return item ? [item] : all.slice(0, 1);
  }
  return [];
}

function matchCoursesFromText(message, selectedIds = [], selectedCities = []) {
  const q = normalize(message);
  const sig = querySignals(message);
  const cities = cityHits(message, selectedCities);
  const direct = findByIds(data.courses, selectedIds);
  if (direct.length) return direct;

  // Perguntas como "cursos de graduação" devem devolver o catálogo completo,
  // não uma amostra limitada. A organização por cidade fica para o front-end.
  if (sig.asksAllCourses && !cities.length && !sig.asksCompare) {
    return representativeCourses();
  }

  // Sem nenhum sinal de que a pergunta é sobre curso (nem cidade, nem palavra de
  // curso), não faz sentido tentar casar por tag/nome — um termo genérico da
  // pergunta (ex.: "internacional" de uma forma de ingresso) pode coincidir com a
  // tag de um curso (ex.: Relações Internacionais) sem ter nada a ver com ele.
  if (!sig.asksCourse && !cities.length) return [];

  let matches = safeArray(data.courses).filter((course) => {
    const name = normalize(`${course.displayName || course.name || ""} ${course.name || ""}`);
    const school = normalize(course.school || "");
    const city = normalize(course.city || "");
    const tags = safeArray(course.tags).map(normalize).join(" ");
    const haystack = `${name} ${school} ${city} ${tags}`;
    const cityHit = cities.length ? cities.includes(city) : false;
    if (cities.length && !cityHit) return false;

    const words = name.split(" ").filter((part) => part.length > 4);
    const nameHit = words.some((part) => q.includes(part));
    const tagHit = safeArray(course.tags).some((tag) => normalize(tag).length > 3 && q.includes(normalize(tag)));
    const specific = SPECIFIC_SUBJECT_TERMS.some((term) => normalize(term).length && q.includes(normalize(term)) && haystack.includes(normalize(term)));
    return cityHit || nameHit || tagHit || specific;
  });

  if (!matches.length && cities.length) {
    matches = safeArray(data.courses).filter((course) => cities.includes(normalize(course.city)));
  }
  if (!matches.length && sig.asksCourse) {
    matches = representativeCourses();
  }

  return sig.asksAllCourses ? matches : matches.slice(0, 12);
}

function activeEventsByCities(cities = []) {
  const wanted = new Set(safeArray(cities).map(normalize).filter(Boolean));
  return allEvents()
    .filter((event) => (event.status || "active") === "active" && wanted.has(normalize(event.city)))
    .slice(0, 4);
}

function activeEventsForCourses(courses = []) {
  const cities = [...new Set(safeArray(courses).map((course) => course.city).filter(Boolean))];
  return activeEventsByCities(cities);
}

function buildTimelineItems(message, courses = [], admissionIds = []) {
  const items = [];
  const selectedAdmissions = matchAdmissionTypes(message, admissionIds);

  safeArray(courses).slice(0, 4).forEach((course) => {
    const dates = course.admissionDates || {};
    Object.entries(dates).forEach(([label, value]) => {
      items.push({ label: `${label} · ${courseName(course)}`, value, description: `${course.city || ""}${course.state ? ` / ${course.state}` : ""}`.trim() });
    });
    if (!Object.keys(dates).length) {
      selectedAdmissions.forEach((admission) => {
        const label = admission.label || admission.name || "Forma de ingresso";
        if (safeArray(course.admissions).some((item) => normalize(item).includes(normalize(label).slice(0, 6)) || normalize(label).includes(normalize(item).slice(0, 6)))) {
          items.push({ label: `${label} · ${courseName(course)}`, value: formatPeriod(admission.startDate, admission.endDate) || labelStatus(admission.status), description: `${course.city || ""}${course.state ? ` / ${course.state}` : ""}`.trim() });
        }
      });
    }
    if (course.examDates) items.push({ label: `Provas · ${courseName(course)}`, value: course.examDates, description: `${course.city || ""}${course.state ? ` / ${course.state}` : ""}`.trim() });
    if (course.resultDate) items.push({ label: `Resultado · ${courseName(course)}`, value: course.resultDate, description: `${course.city || ""}${course.state ? ` / ${course.state}` : ""}`.trim() });
  });

  if (!items.length) {
    selectedAdmissions.forEach((admission) => {
      items.push({
        label: admission.label || admission.name || "Forma de ingresso",
        value: formatPeriod(admission.startDate, admission.endDate) || labelStatus(admission.status),
        description: [admission.cycle, labelStatus(admission.status)].filter(Boolean).join(" · ")
      });
    });
  }
  return items.slice(0, 8);
}

// CTA de inscrição pra uma modalidade sem curso definido — "Inscreva-se" leva pra
// /inscreva-se já com a modalidade selecionada; "Avise-me" dispara o mesmo fluxo de
// aviso de sempre.
function admissionTypeCta(item) {
  const open = normalize(item.status).includes("abert");
  if (open) return { open: true, href: `/inscreva-se?forma=${encodeURIComponent(item.id)}` };
  return { open: false, prompt: `quero receber aviso quando as inscrições de ${item.label || item.name} abrirem` };
}

function admissionItems(message, courses = [], admissionIds = []) {
  const selectedAdmissions = matchAdmissionTypes(message, admissionIds);
  if (!courses.length) {
    return selectedAdmissions.map((item) => ({
      id: item.id,
      label: item.label || item.name || "Forma de ingresso",
      description: item.description || "",
      status: labelStatus(item.status),
      cycle: item.cycle || "",
      period: formatPeriod(item.startDate, item.endDate),
      ...admissionTypeCta(item)
    }));
  }

  const names = new Set();
  courses.forEach((course) => safeArray(course.admissions).forEach((name) => names.add(name)));
  let items = safeArray(data.admissionTypes).filter((item) => {
    const label = normalize(item.label || item.name || "");
    return [...names].some((name) => {
      const n = normalize(name);
      return label.includes(n.slice(0, 8)) || n.includes(label.slice(0, 8));
    });
  });
  if (!items.length) items = selectedAdmissions;
  return items.slice(0, 6).map((item) => ({
    id: item.id,
    label: item.label || item.name || "Forma de ingresso",
    description: item.description || "",
    status: labelStatus(item.status),
    cycle: item.cycle || "",
    period: formatPeriod(item.startDate, item.endDate),
    ...admissionTypeCta(item)
  }));
}

function coursesAcceptingAdmission(admissionItem) {
  if (!admissionItem) return [];
  const label = normalize(admissionItem.label || admissionItem.name || "");
  if (!label) return [];
  return safeArray(data.courses).filter((course) => safeArray(course.admissions).some((name) => {
    const n = normalize(name);
    return label.includes(n.slice(0, 8)) || n.includes(label.slice(0, 8));
  }));
}

function representativeCourses(limit = 999) {
  const seen = new Set();
  const preferredCities = ["Rio de Janeiro", "São Paulo", "Brasília"];
  const ordered = [];
  preferredCities.forEach((city) => {
    safeArray(data.courses).forEach((course) => {
      const key = `${course.displayName || course.name}-${course.city}`;
      if (!seen.has(key) && course.city === city) {
        ordered.push(course);
        seen.add(key);
      }
    });
  });
  return ordered.slice(0, limit);
}

function generalAdmissionPeriod() {
  const admissions = safeArray(data.admissionTypes).filter((item) => item.startDate || item.endDate);
  const first = admissions[0];
  if (!first) return "";
  return formatPeriod(first.startDate, first.endDate);
}

function vestibularAdmission() {
  return safeArray(data.admissionTypes).find((item) => item.id === "vestibular-fgv") || null;
}

function courseRefParts(courseId) {
  const course = safeArray(data.courses).find((c) => c.id === courseId);
  return { name: course ? (course.displayName || course.name) : courseId, city: course ? course.city : "" };
}

function admissionTypeDetailsItems(item) {
  if (!item) return [];
  const rows = [];
  // CTA obrigatório no contexto de forma de ingresso: Inscreva-se quando está aberta,
  // Avise-me caso contrário.
  rows.push({ title: "Inscrição", type: "inscrição", ctaAdmission: { label: item.label || item.name, ...admissionTypeCta(item) } });
  if (item.registrationFrequency) rows.push({ title: "Quando acontece", shortDescription: item.registrationFrequency, type: "calendário" });
  if (item.examDate) rows.push({ title: "Data da prova", shortDescription: item.examDate, type: "prova" });
  if (safeArray(item.eligibility).length) rows.push({ title: "Quem pode participar", shortDescription: safeArray(item.eligibility).join(" "), type: "elegibilidade" });
  if (safeArray(item.examFormat).length) rows.push({ title: "Como são as provas", shortDescription: safeArray(item.examFormat).join(", ") + ".", type: "prova" });
  if (item.examPhases) rows.push({ title: "Fases do processo", shortDescription: item.examPhases, type: "etapas" });
  if (safeArray(item.requiredDocuments).length) rows.push({ title: "O que levar no dia da prova", shortDescription: safeArray(item.requiredDocuments).join(" "), type: "documentos" });
  if (item.locationRule) rows.push({ title: "Escolha da cidade de prova", shortDescription: item.locationRule, type: "local de prova" });
  if (safeArray(item.seatsByCourse).length) {
    const tableRows = safeArray(item.seatsByCourse).map((row) => {
      const { name, city } = courseRefParts(row.courseId);
      return [name, city, String(row.seats), row.registrationFee];
    });
    rows.push({
      title: "Vagas e taxa de inscrição por curso",
      shortDescription: "Confira vagas e taxa de inscrição por curso e cidade.",
      type: "vagas",
      table: { columns: ["Curso", "Cidade", "Vagas", "Taxa de inscrição"], rows: tableRows }
    });
  }
  if (safeArray(item.internationalDiplomasByCourse).length) {
    const tableRows = safeArray(item.internationalDiplomasByCourse).map((row) => {
      const { name, city } = courseRefParts(row.courseId);
      const diplomas = safeArray(row.diplomas).join(", ") + (row.acceptsOtherEquivalentExams ? " (e outros exames equivalentes)" : "");
      return [name, city, diplomas];
    });
    rows.push({
      title: "Diplomas internacionais aceitos por curso",
      shortDescription: "Confira os diplomas internacionais aceitos por curso e cidade.",
      type: "diplomas",
      table: { columns: ["Curso", "Cidade", "Diplomas aceitos"], rows: tableRows }
    });
  }
  return rows.slice(0, 7);
}

function vestibularDetailsItems() {
  return admissionTypeDetailsItems(vestibularAdmission());
}

function vestibularFaqItems() {
  const item = vestibularAdmission();
  return safeArray(item?.faq).map((entry, index) => ({
    id: `faq-${index}`,
    question: cleanCopy(entry.question || ""),
    answer: cleanCopy(entry.answer || "")
  })).filter((entry) => entry.question && entry.answer);
}


function isSpecificCourseContext(message, courses = [], cityHints = []) {
  const sig = querySignals(message);
  const list = safeArray(courses);
  if (!list.length) return false;
  if (list.length === 1) return true;
  if (sig.asksDifferentials && list.length === 1) return true;
  return false;
}

function isBroadCourseExploration(message, courses = [], cityHints = []) {
  const sig = querySignals(message);
  if (!sig.asksCourse || sig.asksDate || sig.asksCompare || sig.asksDifferentials) return false;
  return !isSpecificCourseContext(message, courses, cityHints);
}

function shouldShowCourseContextEvents(message, courses = [], cityHints = []) {
  const sig = querySignals(message);
  if (sig.asksEvent) return true;
  if (cityHints.length) return true;
  return isSpecificCourseContext(message, courses, cityHints);
}

function courseDifferentials(courses = []) {
  const courseList = safeArray(courses);
  if (courseList.length !== 1) return [];
  const items = [];
  courseList.forEach((course) => {
    safeArray(course.courseDifferentials).forEach((diff) => {
      items.push({
        id: diff.id,
        title: diff.title || "Diferencial",
        shortDescription: diff.shortDescription || diff.description || "",
        type: diff.type || "",
        courseName: courseName(course)
      });
    });
  });
  return items.slice(0, 8);
}

function courseNumbers(courses = []) {
  const courseList = safeArray(courses);
  if (courseList.length !== 1) return [];
  return safeArray(courseList[0].numbers).map((item, index) => ({
    id: `number-${index}`,
    value: item.value || "",
    label: item.label || ""
  })).slice(0, 6);
}

function courseCareerPaths(courses = [], descriptions = []) {
  const courseList = safeArray(courses);
  if (courseList.length !== 1) return [];
  return safeArray(courseList[0].careerPaths).map((text, index) => {
    const description = cleanCopy(safeArray(descriptions)[index] || "");
    // Se o modelo só repetiu o nome da carreira como "descrição", não mostra nada em vez de duplicar o texto.
    const isRedundant = normalize(description) === normalize(text);
    return { id: `career-${index}`, label: text, description: isRedundant ? "" : description };
  });
}

function courseTestimonials(courses = []) {
  const courseList = safeArray(courses);
  if (courseList.length !== 1) return [];
  return safeArray(courseList[0].testimonials).map((item, index) => ({
    id: `testimonial-${index}`,
    name: item.name || "",
    role: item.role || "",
    quote: item.quote || ""
  }));
}

function courseVideos(courses = []) {
  const courseList = safeArray(courses);
  if (courseList.length !== 1) return [];
  return safeArray(courseList[0].videos)
    .map((item) => ({ id: item.id, title: item.title || "", videoId: item.videoId || "" }))
    .filter((item) => item.videoId)
    .slice(0, 6);
}

function admissionTypeForCourseLabel(name) {
  const n = normalize(name);
  const byId = (id) => safeArray(data.admissionTypes).find((item) => item.id === id) || null;
  // Precisa checar "demanda" antes de "vestibular", porque o rótulo da DSD também
  // começa com "Vestibular". "internacional" no singular não é substring de
  // "internacionais" no plural, então usa o radical "internacion".
  if (n.includes("demanda")) return byId("demanda-social-diversidade");
  if (n.includes("internacion")) return byId("exames-internacionais");
  if (n.includes("enem")) return byId("enem");
  if (n.includes("olimpiada")) return byId("olimpiadas");
  if (n.includes("transfer") || n.includes("diploma")) return byId("transferencia-externa");
  if (n.includes("vestibular")) return byId("vestibular-fgv");
  return null;
}

// Um único CTA de inscrição pro curso (não um por modalidade — muita opção de uma vez
// paralisa a decisão). "Inscreva-se" se alguma forma de ingresso do curso está aberta
// (leva pra /inscreva-se com o curso pré-selecionado, a modalidade é escolhida lá),
// "Avise-me" se nenhuma estiver aberta ainda.
function courseEnrollCta(course) {
  const anyOpen = safeArray(course.admissions).some((name) => {
    const admissionType = admissionTypeForCourseLabel(name);
    return admissionType ? normalize(admissionType.status).includes("abert") : false;
  });
  if (anyOpen) {
    return { open: true, href: `/inscreva-se?curso=${encodeURIComponent(course.id)}` };
  }
  return { open: false, prompt: `quero receber aviso quando as inscrições abrirem para ${courseName(course)} em ${course.city}` };
}

function courseDetailItems(courses = []) {
  const course = safeArray(courses)[0];
  if (!course) return [];
  const fields = [
    ["Duração", cleanDisplayValue(course.duration)],
    ["Período", cleanDisplayValue(course.period)],
    ["Mensalidade", cleanDisplayValue(course.tuition)],
    ["Campus", cleanDisplayValue(course.campus)],
    ["Entrada", cleanDisplayValue(course.entry)],
    ["Relação candidato/vaga", course.candidatePerSeat ? `${String(course.candidatePerSeat).replace(/\.$/, "")} candidato/vaga` : ""],
    ["Formas de ingresso", safeArray(course.admissions).join(", ")]
  ];
  return fields
    .filter(([, value]) => value && !/consultar/i.test(String(value)))
    .map(([title, value], index) => ({ id: `course-detail-${index}`, title, value, shortDescription: value, type: "" }));
}

function schoolRecognitions(courses = []) {
  const courseList = safeArray(courses);
  if (courseList.length !== 1) return [];
  const schoolIds = new Set(courseList.map((course) => course.schoolId).filter(Boolean));
  const items = [];
  safeArray(data.schools).forEach((school) => {
    if (!schoolIds.has(school.id)) return;
    safeArray(school.recognitions).forEach((rec) => items.push({
      id: rec.id,
      title: rec.title || "Reconhecimento",
      shortDescription: rec.description || "",
      type: rec.type || "",
      schoolName: school.name || ""
    }));
  });
  return items.slice(0, 6);
}

function action(label, prompt, tone = "default") {
  return { label, prompt, tone };
}

function buildNextActions(message, courses = [], visibleTypes = []) {
  const sig = querySignals(message);
  const actions = [];
  const courseList = safeArray(courses);
  const mainCourse = courseList[0];
  const visible = new Set(visibleTypes);
  const specificCourse = courseList.length === 1;
  const broadCourse = sig.asksCourse && !specificCourse && !sig.asksDate && !sig.asksCompare && !sig.asksDifferentials;

  if (sig.asksVestibularSpecific || (sig.asksDate && normalize(message).includes("vestibular"))) {
    if (!visible.has("prep_materials")) actions.push(action("Estudar com provas anteriores", "quero estudar com provas anteriores do Vestibular FGV", "primary"));
    if (!visible.has("events")) actions.push(action("Conhecer eventos da graduação", "quais eventos da graduação estão disponíveis?"));
    actions.push(action("Ver cursos disponíveis", "quais cursos a FGV oferece?"));
    if (!visible.has("lead_form")) actions.push(action("Receber aviso de inscrição", "quero receber aviso quando as inscrições abrirem"));
    return actions.slice(0, 4);
  }

  if (sig.asksDate) {
    actions.push(action("Ver cursos disponíveis", "quais cursos a FGV oferece?"));
    actions.push(action("Entender formas de ingresso", "quais formas de ingresso posso usar?"));
    if (!visible.has("events")) actions.push(action("Conhecer eventos da graduação", "quais eventos da graduação estão disponíveis?"));
    if (!visible.has("lead_form")) actions.push(action("Receber aviso de inscrição", "quero receber aviso quando as inscrições abrirem", "primary"));
    return actions.slice(0, 4);
  }

  if (sig.asksPrep) {
    actions.push(action("Ver datas do Vestibular FGV", "quais são as datas do Vestibular FGV?", "primary"));
    actions.push(action("Conhecer cursos", "quais cursos a FGV oferece?"));
    actions.push(action("Receber aviso de inscrição", "quero receber aviso quando as inscrições abrirem"));
    return actions.slice(0, 3);
  }

  if (broadCourse) {
    if (normalize(message).includes("administracao")) actions.push(action("Comparar opções de Administração", "qual a diferença entre Administração de Empresas e Administração Pública?", "primary"));
    else actions.push(action("Comparar cursos", "quero comparar cursos", "primary"));
    actions.push(action("Entender formas de ingresso", "quais formas de ingresso posso usar?"));
    actions.push(action("Ver bolsas de estudo", "quais bolsas de estudo a FGV oferece?"));
    actions.push(action("Conhecer eventos da graduação", "quais eventos da graduação estão disponíveis?"));
    return actions.slice(0, 4);
  }

  if (specificCourse && mainCourse && !visible.has("admission_options")) actions.push(action("Ver formas de ingresso", `quais formas de ingresso existem para ${courseName(mainCourse)} em ${mainCourse.city}?`, "primary"));
  if (specificCourse && mainCourse && activeEventsForCourses([mainCourse]).length && !visible.has("events")) actions.push(action("Conhecer eventos na cidade", `quais eventos da graduação existem em ${mainCourse.city}?`));
  if (specificCourse && mainCourse && !visible.has("course_differentials") && safeArray(mainCourse.courseDifferentials).length) actions.push(action("Ver diferenciais do curso", `quais são os diferenciais de ${courseName(mainCourse)} em ${mainCourse.city}?`));
  if (!sig.asksCompare) actions.push(action("Comparar com outro curso", "quero comparar cursos"));
  if (!sig.asksScholarship && actions.length < 4) actions.push(action("Ver bolsas de estudo", "quais bolsas de estudo a FGV oferece?"));
  if (!actions.length) actions.push(action("Conhecer cursos", "quais cursos a FGV oferece?", "primary"));
  return Array.from(new Map(actions.map((item) => [item.label, item])).values()).slice(0, 4);
}

function sectionBase(section, type, fallbackTitle, fallbackIntro, layout = "cards") {
  return {
    type,
    title: cleanCopy(section?.title || fallbackTitle),
    intro: cleanCopy(section?.intro || fallbackIntro),
    layout: section?.layout || layout,
    actions: []
  };
}

function resolveSections(plan, message, options = {}) {
  // Modo experimental, só pra comparar comportamento — não muda o padrão da aplicação.
  // Com aiOnly=true, a rede de segurança de ~10 fallbacks fica desligada e a composição
  // depende inteiramente do que a IA propôs em plan.sections.
  const aiOnly = Boolean(options.aiOnly);
  const sig = querySignals(message);
  const cityHints = cityHits(message, plan.entities?.cities);
  let selectedCourses = matchCoursesFromText(message, plan.entities?.courseIds || plan.entities?.courses || [], cityHints);
  if (sig.asksCourse && !selectedCourses.length && !sig.asksCompare && !cityHints.length) {
    selectedCourses = representativeCourses();
  }
  const selectedAdmissions = matchAdmissionTypes(message, plan.entities?.admissionTypeIds || plan.entities?.admissionTypes || []);
  const specificCourseContext = () => isSpecificCourseContext(message, selectedCourses, cityHints);
  const broadCourseContext = () => isBroadCourseExploration(message, selectedCourses, cityHints);
  // O catálogo só tem FAQ cadastrado para a modalidade "Vestibular FGV" — sem essa checagem, uma pergunta
  // sobre outra modalidade (ex.: Demanda Social) herdaria por engano as dúvidas do Vestibular FGV.
  const vestibularFgvContext = sig.asksVestibularSpecific || selectedAdmissions.some((item) => item.id === "vestibular-fgv");
  // Quando a pessoa pergunta sobre uma única modalidade específica (ENEM, Exames Internacionais,
  // Demanda Social e Diversidade ou Olimpíadas), ela merece o mesmo detalhamento que o Vestibular FGV já tem.
  const specificAdmissionType = !vestibularFgvContext && selectedAdmissions.length === 1 ? selectedAdmissions[0] : null;
  const resolved = [];
  const addSection = (section) => {
    if (!section) return;
    if (["course_cards", "course_detail", "timeline", "admission_options", "events", "scholarships", "course_differentials", "school_recognitions", "course_numbers", "course_careers", "course_testimonials", "course_videos", "course_compare", "prep_materials", "admission_details", "faq", "warning", "lead_form"].includes(section.type)) {
      const already = resolved.some((item) => item.type === section.type);
      if (already && !["course_cards"].includes(section.type)) return;
    }
    resolved.push(section);
  };

  const requestedSections = safeArray(plan.sections).filter((section) => section.type !== "official_links");

  // A composição da página é decidida pela IA primeiro — ela já vê o catálogo completo
  // (cursos, modalidades, flags de conteúdo disponível) e o prompt já orienta quando usar
  // timeline, admission_details vs. admission_options, prep_materials e events para
  // perguntas sobre datas/inscrição. O código só entra depois disso, como rede de segurança.
  requestedSections.forEach((section) => {
    if (section.type === "course_cards") {
      let courses = matchCoursesFromText(message, section.courseIds, cityHints);
      if (sig.asksAllCourses && !cityHints.length) courses = representativeCourses();
      if (courses.length) {
        selectedCourses = selectedCourses.length ? selectedCourses : courses;
        if (isSpecificCourseContext(message, courses, cityHints)) {
          const details = courseDetailItems(courses);
          if (details.length) addSection({ type: "course_detail", title: `Detalhes de ${courseName(courses[0])} — ${courses[0].city}`, intro: "Informações principais do curso organizadas para você decidir com mais clareza.", layout: "cards", items: details, course: courses[0], actions: [] });
        } else {
          addSection({ ...sectionBase(section, "course_cards", sig.asksAllCourses ? "Cursos de graduação por cidade" : "Cursos relacionados", sig.asksAllCourses ? "Explore todos os cursos disponíveis em cada cidade." : "Veja os cursos que mais se aproximam do que você procura.", courses.length > 1 ? "tabs_by_city" : "cards"), items: courses });
        }
      }
    }

    if (section.type === "course_detail") {
      const courses = matchCoursesFromText(message, section.courseIds, cityHints);
      if (isSpecificCourseContext(message, courses, cityHints)) {
        const details = courseDetailItems(courses);
        if (details.length) addSection({ ...sectionBase(section, "course_detail", `Detalhes de ${courseName(courses[0])} — ${courses[0].city}`, "Informações principais do curso organizadas para você decidir com mais clareza."), items: details, course: courses[0] });
      }
    }

    if (section.type === "course_compare") {
      let courses = matchCoursesFromText(message, section.courseIds, cityHints).slice(0, 3);
      if (courses.length < 2) {
        courses = safeArray(data.courses).filter((course) => ["administracao-empresas-sp", "administracao-publica-sp", "administracao-df"].includes(course.id));
      }
      if (courses.length >= 2) addSection({ ...sectionBase(section, "course_compare", "Compare as opções", "Veja diferenças entre cursos, cidades e formas de ingresso."), items: courses.slice(0, 3) });
    }

    if (section.type === "admission_options") {
      addSection({ ...sectionBase(section, "admission_options", "Formas de ingresso", "Confira as modalidades relacionadas à sua busca."), items: admissionItems(message, selectedCourses, section.admissionTypeIds) });
    }

    if (section.type === "timeline") {
      const items = buildTimelineItems(message, selectedCourses, section.admissionTypeIds);
      if (items.length) addSection({ ...sectionBase(section, "timeline", "Datas importantes", "Veja os prazos e marcos disponíveis para sua busca.", "list"), items });
    }

    if (section.type === "events") {
      let items = [];
      if (sig.asksEvent) items = findByIds(allEvents(), section.eventIds);
      if (!items.length && cityHints.length) items = activeEventsByCities(cityHints);
      if (!items.length && specificCourseContext()) items = activeEventsForCourses(selectedCourses);
      if (!items.length && sig.asksEvent) items = allEvents().filter((event) => (event.status || "active") === "active").slice(0, 5);
      if (items.length && shouldShowCourseContextEvents(message, selectedCourses, cityHints)) addSection({ ...sectionBase(section, "events", cityHints.length ? `Conheça a FGV de perto em ${items[0].city}` : specificCourseContext() && selectedCourses[0] ? `Conheça a FGV de perto em ${selectedCourses[0].city}` : "Eventos da graduação", "Eventos são uma forma de conhecer os cursos, conversar com a FGV e viver um pouco da experiência universitária antes de decidir.", "list"), items });
    }

    if (section.type === "scholarships") {
      let items = findByIds(data.scholarships?.programs || [], section.scholarshipIds);
      if (!items.length) items = safeArray(data.scholarships?.programs);
      if (items.length) addSection({ ...sectionBase(section, "scholarships", "Bolsas de estudo", data.scholarships?.intro || "Conheça modalidades de bolsa disponíveis na graduação."), items: items.slice(0, 5) });
    }

    if (section.type === "course_differentials") {
      const items = courseDifferentials(selectedCourses);
      if (items.length) addSection({ ...sectionBase(section, "course_differentials", "Diferenciais do curso", selectedCourses[0]?.courseDifferentialsIntro || "Veja oportunidades e características que fazem parte da experiência do curso."), items });
    }

    if (section.type === "school_recognitions") {
      const items = schoolRecognitions(selectedCourses);
      if (items.length) addSection({ ...sectionBase(section, "school_recognitions", "Reconhecimentos da escola", "Diferenciais acadêmicos e institucionais ligados à escola responsável pelo curso."), items });
    }

    if (section.type === "course_numbers") {
      const items = courseNumbers(selectedCourses);
      if (items.length) addSection({ ...sectionBase(section, "course_numbers", "Números do curso", "Alguns números que ajudam a entender o curso.", "list"), items });
    }

    if (section.type === "course_careers") {
      const items = courseCareerPaths(selectedCourses, section.textItems);
      if (items.length) addSection({ ...sectionBase(section, "course_careers", "Possibilidades de carreira", "Áreas em que quem se forma nesse curso pode atuar.", "list"), items });
    }

    if (section.type === "course_testimonials") {
      const items = courseTestimonials(selectedCourses);
      if (items.length) addSection({ ...sectionBase(section, "course_testimonials", "Quem já passou por aqui", "Depoimentos de estudantes e ex-alunos do curso.", "list"), items });
    }

    if (section.type === "course_videos") {
      const items = courseVideos(selectedCourses);
      if (items.length) addSection({ ...sectionBase(section, "course_videos", "Vídeos do curso", "Conheça mais sobre o curso em vídeo.", "list"), items });
    }

    if (section.type === "prep_materials") {
      let items = findByIds(data.materials, section.materialIds);
      if (!items.length) items = safeArray(data.materials).filter((item) => normalize(item.label || item.title).includes("prova") || normalize(item.label || item.title).includes("gabarito") || normalize(item.label || item.title).includes("edital"));
      if (items.length) addSection({ ...sectionBase(section, "prep_materials", "Prepare-se para o processo seletivo", "Encontre materiais úteis para organizar seus estudos.", "cards"), items: items.slice(0, 4) });
    }

    if (section.type === "admission_details") {
      const admission = specificAdmissionType || vestibularAdmission();
      const items = admissionTypeDetailsItems(admission);
      const title = specificAdmissionType ? `Como funciona: ${specificAdmissionType.label}` : "Como funciona o Vestibular FGV";
      const intro = specificAdmissionType ? (specificAdmissionType.description || "Veja o essencial sobre essa forma de ingresso.") : "Veja o essencial sobre a prova, a inscrição e a preparação para essa forma de ingresso.";
      if (items.length) addSection({ ...sectionBase(section, "admission_details", title, intro, "cards"), items });
    }

    if (section.type === "faq" && vestibularFgvContext) {
      const items = vestibularFaqItems();
      if (items.length) addSection({ ...sectionBase(section, "faq", "Perguntas frequentes sobre o Vestibular FGV", "Tire suas dúvidas antes de se inscrever.", "accordion"), items });
    }

    if (section.type === "warning" && !sig.asksDate && !sig.asksCourse && !sig.asksAdmission && !sig.asksScholarship && !sig.asksEvent) {
      addSection({ ...sectionBase(section, "warning", "Não encontrei esse caminho no Vestibular FGV", "Tente buscar por cursos, formas de ingresso, bolsas, provas, eventos ou inscrição.", "single"), items: safeArray(section.textItems).map((text) => ({ text: cleanCopy(text) })) });
    }
  });

  // Regra de produto: pergunta sobre data/inscrição precisa garantidamente trazer uma
  // timeline, e ela precisa vir primeiro — é a informação factual mais importante nesse
  // contexto. Não travamos o resto da composição: só entramos aqui se a IA não tiver
  // proposto uma timeline sozinha (ou reordenamos se ela existir, mas não em primeiro).
  if (sig.asksDate || plan.intent === "inscricao" || plan.intent === "agenda_editais") {
    const timelineIndex = resolved.findIndex((section) => section.type === "timeline");
    if (timelineIndex > 0) {
      const [timelineSection] = resolved.splice(timelineIndex, 1);
      resolved.unshift(timelineSection);
    } else if (timelineIndex === -1) {
      const timelineItems = buildTimelineItems(message, selectedCourses, selectedAdmissions.map((item) => item.id));
      if (timelineItems.length) {
        resolved.unshift({
          type: "timeline",
          title: selectedCourses.length ? "Datas importantes para sua busca" : "Calendário de inscrição 2027.1",
          intro: selectedCourses.length ? "Separei os prazos e datas disponíveis para os cursos relacionados à sua busca." : "O período previsto de inscrição aparece abaixo por modalidade de ingresso.",
          layout: "list",
          items: timelineItems,
          actions: []
        });
      }
    }
  }

  if (!aiOnly) {
    if (sig.asksCourse && selectedCourses.length && !resolved.some((section) => section.type === "course_cards" || section.type === "course_detail") && !sig.asksDate) {
      if (specificCourseContext()) {
        const details = courseDetailItems(selectedCourses);
        if (details.length) addSection({ type: "course_detail", title: `Detalhes de ${courseName(selectedCourses[0])} — ${selectedCourses[0].city}`, intro: "Informações principais do curso organizadas para você decidir com mais clareza.", layout: "cards", items: details, course: selectedCourses[0], actions: [] });
      } else {
        const coursesToShow = sig.asksAllCourses && !cityHints.length ? representativeCourses() : selectedCourses;
        addSection({ type: "course_cards", title: sig.asksAllCourses ? "Cursos de graduação por cidade" : "Cursos relacionados", intro: sig.asksAllCourses ? "Explore todos os cursos disponíveis em cada cidade." : "Separei as opções mais próximas do que você procura.", layout: coursesToShow.length > 1 ? "tabs_by_city" : "cards", items: coursesToShow, actions: [] });
      }
    }

    // Não mostra admission_options quando a página já é sobre uma modalidade específica
    // (Vestibular FGV, ENEM, DSD...) — repetir a lista completa de modalidades não ajuda
    // quem já está vendo o detalhe de uma delas (mesma regra dada à IA no prompt, item 4b).
    if ((sig.asksAdmission || sig.asksDate) && !resolved.some((section) => section.type === "admission_options") && !selectedCourses.length && !vestibularFgvContext && !specificAdmissionType) {
      addSection({ type: "admission_options", title: "Formas de ingresso", intro: "Veja as modalidades e períodos informados para este processo seletivo.", layout: "cards", items: admissionItems(message, selectedCourses, selectedAdmissions.map((item) => item.id)), actions: [] });
    }

    if (broadCourseContext() && !resolved.some((section) => section.type === "course_compare") && normalize(message).includes("administracao")) {
      const compareCourses = safeArray(data.courses).filter((course) => ["administracao-empresas-sp", "administracao-publica-sp", "administracao-rj", "administracao-df", "administracao-publica-df"].includes(course.id)).slice(0, 4);
      if (compareCourses.length >= 2) addSection({ type: "course_compare", title: "Administração: entenda as diferenças", intro: "Administração de Empresas e Administração Pública têm caminhos diferentes. Compare cidade, escola, duração e formas de ingresso antes de decidir.", layout: "table", items: compareCourses, actions: [] });
    }

    if (broadCourseContext() && !resolved.some((section) => section.type === "admission_options")) {
      addSection({ type: "admission_options", title: "Como você pode entrar", intro: "Depois de escolher um curso, vale entender quais modalidades de ingresso combinam com seu momento.", layout: "cards", items: admissionItems("formas de ingresso", [], selectedAdmissions.map((item) => item.id)), actions: [] });
    }

    if (specificCourseContext() && (sig.asksDifferentials || !broadCourseContext()) && selectedCourses.length && !resolved.some((section) => section.type === "course_differentials")) {
      const items = courseDifferentials(selectedCourses);
      if (items.length) addSection({ type: "course_differentials", title: "Diferenciais do curso", intro: selectedCourses[0]?.courseDifferentialsIntro || "Veja oportunidades e características que fazem parte da experiência do curso.", layout: "cards", items, actions: [] });
    }

    if (specificCourseContext() && sig.asksDifferentials && selectedCourses.length && !resolved.some((section) => section.type === "school_recognitions")) {
      const items = schoolRecognitions(selectedCourses);
      if (items.length) addSection({ type: "school_recognitions", title: "Reconhecimentos da escola", intro: "Diferenciais acadêmicos e institucionais ligados à escola responsável pelo curso.", layout: "cards", items, actions: [] });
    }

    if ((sig.asksCourse || sig.asksEvent) && selectedCourses.length && !resolved.some((section) => section.type === "events") && !sig.asksDate && shouldShowCourseContextEvents(message, selectedCourses, cityHints)) {
      let items = cityHints.length ? activeEventsByCities(cityHints) : activeEventsForCourses(selectedCourses);
      if (!items.length && sig.asksEvent) items = allEvents().filter((event) => (event.status || "active") === "active").slice(0, 5);
      if (items.length) addSection({ type: "events", title: cityHints.length ? `Conheça a FGV de perto em ${items[0].city}` : `Conheça a FGV de perto em ${selectedCourses[0].city}`, intro: "Eventos são uma forma de conhecer os cursos, conversar com a FGV e viver um pouco da experiência universitária antes de decidir.", layout: "list", items, actions: [] });
    }

    if (sig.asksScholarship && !resolved.some((section) => section.type === "scholarships")) {
      const items = safeArray(data.scholarships?.programs).slice(0, 5);
      if (items.length) addSection({ type: "scholarships", title: "Bolsas de estudo", intro: data.scholarships?.intro || "Conheça modalidades de bolsa disponíveis na graduação.", layout: "cards", items, actions: [] });
    }

    if (sig.asksVestibularSpecific && !resolved.some((section) => section.type === "admission_details")) {
      const items = vestibularDetailsItems();
      if (items.length) addSection({ type: "admission_details", title: "Como funciona o Vestibular FGV", intro: "Veja o essencial sobre a prova, a inscrição e a preparação para essa forma de ingresso.", layout: "cards", items, actions: [] });
    }

    if (specificAdmissionType && !resolved.some((section) => section.type === "admission_details")) {
      const items = admissionTypeDetailsItems(specificAdmissionType);
      if (items.length) addSection({ type: "admission_details", title: `Como funciona: ${specificAdmissionType.label}`, intro: specificAdmissionType.description || "Veja o essencial sobre essa forma de ingresso.", layout: "cards", items, actions: [] });
    }

    if (sig.asksVestibularSpecific && !resolved.some((section) => section.type === "prep_materials")) {
      const items = safeArray(data.materials).filter((item) => normalize(item.label || item.title).includes("prova") || normalize(item.label || item.title).includes("gabarito") || normalize(item.label || item.title).includes("edital"));
      if (items.length) addSection({ type: "prep_materials", title: "Prepare-se para o Vestibular FGV", intro: "Use provas anteriores, gabaritos e materiais do processo seletivo para organizar seus estudos.", layout: "cards", items: items.slice(0, 4), actions: [] });
    }

    if (sig.asksFaq && vestibularFgvContext && !resolved.some((section) => section.type === "faq")) {
      const items = vestibularFaqItems();
      if (items.length) addSection({ type: "faq", title: "Perguntas frequentes sobre o Vestibular FGV", intro: "Tire suas dúvidas antes de se inscrever.", layout: "accordion", items, actions: [] });
    }
  }

  const visibleTypes = resolved.map((section) => section.type);
  // A IA já decide primaryCta e followUpSuggestions a cada chamada — usamos essa decisão
  // como fonte principal do próximo passo. buildNextActions só entra como rede de segurança
  // se a resposta da IA vier vazia ou inutilizável.
  const aiSuggestedActions = [];
  if (plan.primaryCta?.label && plan.primaryCta?.prompt) {
    aiSuggestedActions.push({ label: plan.primaryCta.label, prompt: plan.primaryCta.prompt, tone: "primary" });
  }
  safeArray(plan.followUpSuggestions).forEach((suggestion) => {
    const text = String(suggestion || "").trim();
    if (text) aiSuggestedActions.push({ label: text, prompt: text, tone: "default" });
  });
  const dedupedAiActions = Array.from(new Map(aiSuggestedActions.map((item) => [normalize(item.prompt), item])).values()).slice(0, 5);
  const actions = dedupedAiActions.length ? dedupedAiActions : buildNextActions(message, selectedCourses, visibleTypes);

  // Regra de produto: enquanto houver modalidade do processo seletivo regular com
  // inscrições em breve, a página sempre oferece captura de interesse. Não deixamos
  // essa decisão apenas para o modelo, porque é um comportamento obrigatório da jornada.
  // Transferência fica de fora dessa checagem: ela nunca abre junto do ciclo regular,
  // então o status dela sozinho não deveria travar a mensagem genérica de "em breve".
  const hasUpcomingAdmissions = safeArray(data.admissionTypes).some((item) => item.id !== "transferencia-externa" && normalize(item.status).includes("breve"));
  // "Pergunta sobre inscrição/data" não é mais, sozinha, motivo pra forçar o aviso —
  // isso fazia sentido enquanto tudo estava "em breve", mas agora que há modalidade
  // aberta, o sinal que importa é hasUpcomingAdmissions (fato real, não a pergunta) e
  // a decisão editorial da própria IA (já orientada a não pedir aviso quando já abriu).
  const shouldShowLead = Boolean(hasUpcomingAdmissions || plan.leadCapture?.show);

  if (shouldShowLead) {
    let title = "Receba um aviso quando as inscrições abrirem";
    let intro = "Deixe seu nome e e-mail para acompanhar a abertura das inscrições e novidades do processo seletivo.";

    // Enquanto não há inscrições abertas, o pedido de contato precisa ser sempre
    // sobre avisar a abertura — não sobre "receber informações do curso", que soa
    // como um interesse genérico e não comunica o que a pessoa está esperando.
    // Fora dessa janela, a IA já escreveu um título/descrição contextual (leadCapture) —
    // usamos o dela antes de cair nos textos fixos abaixo.
    if (hasUpcomingAdmissions) {
      // mantém o título/intro genéricos definidos acima
    } else if (plan.leadCapture?.title && plan.leadCapture?.description) {
      title = plan.leadCapture.title;
      intro = plan.leadCapture.description;
    } else if (specificCourseContext() && selectedCourses[0]) {
      title = `Receba novidades sobre ${courseName(selectedCourses[0])}`;
      intro = `Deixe seu contato para acompanhar atualizações sobre ${courseName(selectedCourses[0])} em ${selectedCourses[0].city}, formas de ingresso e período de inscrição.`;
    } else if (sig.asksVestibularSpecific) {
      title = "Receba um aviso sobre o Vestibular FGV";
      intro = "Deixe seu contato para acompanhar a abertura das inscrições, datas da prova e materiais de preparação.";
    } else if (sig.asksScholarship) {
      title = "Receba novidades sobre bolsas e inscrições";
      intro = "Deixe seu contato para acompanhar atualizações sobre bolsas, critérios e abertura das inscrições.";
    }

    addSection({
      type: "lead_form",
      title,
      intro,
      layout: "form",
      items: [],
      actions: []
    });
  }

  if (actions.length) {
    let nextTitle = "Quer seguir por onde agora?";
    let nextIntro = "Posso te ajudar a avançar por alguns caminhos.";
    if (sig.asksVestibularSpecific || sig.asksPrep) {
      nextTitle = "Quer se preparar para o Vestibular FGV?";
      nextIntro = "Você pode ver provas anteriores, acompanhar datas ou conhecer os cursos antes de decidir.";
    } else if (sig.asksDate) {
      nextTitle = "Enquanto as inscrições não abrem";
      nextIntro = "Você pode conhecer cursos, entender as formas de ingresso ou receber um aviso sobre o período de inscrição.";
    } else if (broadCourseContext()) {
      nextTitle = "Quer ajuda para escolher?";
      nextIntro = "Posso comparar opções, explicar formas de ingresso ou mostrar bolsas que podem fazer diferença na sua decisão.";
    } else if (specificCourseContext()) {
      nextTitle = "Quer avançar nesse curso?";
      nextIntro = "Veja como entrar, compare com outra opção ou conheça experiências ligadas à cidade do curso.";
    }
    addSection({
      type: "next_step",
      title: nextTitle,
      intro: nextIntro,
      layout: "chips",
      items: actions,
      actions
    });
  }

  // CTA único de inscrição no topo da página — obrigatório no contexto de curso
  // específico (regra fixa, não é decisão da IA).
  const enrollCta = specificCourseContext() && selectedCourses[0] ? courseEnrollCta(selectedCourses[0]) : null;

  return {
    sections: resolved.filter((section) => safeArray(section.items).length || ["lead_form", "next_step", "warning"].includes(section.type)),
    enrollCta
  };
}

function rewriteForKnownData(plan, message, sections) {
  const sig = querySignals(message);
  const q = sig.q;
  const firstAdmission = matchAdmissionTypes(message)[0] || safeArray(data.admissionTypes)[0];
  const firstPeriod = firstAdmission ? formatPeriod(firstAdmission.startDate, firstAdmission.endDate) : generalAdmissionPeriod();
  const normalized = { ...plan };

  normalized.pageTitle = cleanCopy(plan.pageTitle || "Caminho sugerido");
  normalized.answer = cleanCopy(plan.answer || "Separei as informações mais úteis para você continuar.");

  if (sig.asksDate && firstPeriod) {
    // O texto precisa refletir o status real da modalidade — "a abertura ainda não
    // aconteceu" fica errado assim que ela abre, então a frase muda conforme o status.
    const admissionIsOpen = firstAdmission ? normalize(firstAdmission.status).includes("abert") : false;
    if (sig.asksVestibularSpecific) {
      normalized.pageTitle = "Datas do Vestibular FGV 2027.1";
      normalized.answer = admissionIsOpen
        ? `As inscrições para o Vestibular FGV estão abertas, com período de ${firstPeriod}. Abaixo, organizei as datas, como funciona a prova, materiais para estudar e caminhos para continuar.`
        : `As inscrições para o Vestibular FGV estão previstas para ${firstPeriod}. A abertura ainda não aconteceu, mas o período já está indicado. Abaixo, organizei as datas, como funciona a prova, materiais para estudar e caminhos para continuar.`;
    } else {
      normalized.pageTitle = q.includes("2027") || q.includes("processo seletivo")
        ? "Inscrições para o processo seletivo 2027.1"
        : "Datas de inscrição";
      normalized.answer = admissionIsOpen
        ? `As inscrições estão abertas, com período de ${firstPeriod}. Veja abaixo as datas e caminhos relacionados ao que você procura.`
        : `As inscrições estão previstas para ${firstPeriod}. A abertura ainda não aconteceu, mas o período já está indicado. Veja abaixo as datas e caminhos relacionados ao que você procura.`;
    }
  }

  if (sig.asksCourse && !sig.asksDate && !sig.asksCompare) {
    const courses = matchCoursesFromText(message, plan.entities?.courseIds || plan.entities?.courses || [], plan.entities?.cities);
    if (sig.asksAllCourses && courses.length > 1) {
      normalized.pageTitle = "Cursos de graduação FGV";
      normalized.answer = "Organizei os cursos por cidade para facilitar sua escolha. Você pode explorar as opções, comparar caminhos e depois entender as formas de ingresso.";
    } else if (courses.length === 1) {
      normalized.pageTitle = courseName(courses[0]);
      normalized.answer = cleanCopy(plan.answer || `Encontrei o curso de ${courseName(courses[0])} em ${courses[0].city}. Abaixo, você vê as informações principais e alguns caminhos para continuar.`);
    }
  }

  // Última limpeza para impedir referências a outro site ou página externa.
  normalized.pageTitle = cleanCopy(normalized.pageTitle);
  normalized.answer = cleanCopy(normalized.answer);
  normalized.sections = safeArray(sections).map((section) => ({
    ...section,
    title: cleanCopy(section.title || ""),
    intro: cleanCopy(section.intro || ""),
    items: safeArray(section.items).map((item) => {
      const copy = { ...item };
      ["description", "shortDescription", "text", "label", "value", "name", "title"].forEach((key) => {
        if (typeof copy[key] === "string") copy[key] = cleanCopy(copy[key]);
      });
      return copy;
    }),
    actions: safeArray(section.actions).map((item) => ({ ...item, label: cleanCopy(item.label || ""), prompt: item.prompt || "" }))
  }));
  return normalized;
}

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["pageTitle", "answer", "intent", "confidence", "entities", "primaryCta", "followUpSuggestions", "leadCapture", "sections"],
  properties: {
    pageTitle: { type: "string" },
    answer: { type: "string" },
    intent: { type: "string", enum: ["conhecer_cursos", "comparar_cursos", "inscricao", "formas_ingresso", "enem", "provas_gabaritos", "agenda_editais", "bolsas", "evento_visita", "resultado", "faq", "fora_escopo"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    entities: {
      type: "object",
      additionalProperties: false,
      required: ["courseIds", "cities", "admissionTypeIds", "needsLead"],
      properties: {
        courseIds: { type: "array", items: { type: "string" } },
        cities: { type: "array", items: { type: "string" } },
        admissionTypeIds: { type: "array", items: { type: "string" } },
        needsLead: { type: "boolean" }
      }
    },
    primaryCta: {
      type: "object",
      additionalProperties: false,
      required: ["label", "prompt"],
      properties: { label: { type: "string" }, prompt: { type: "string" } }
    },
    followUpSuggestions: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } },
    leadCapture: {
      type: "object",
      additionalProperties: false,
      required: ["show", "reason", "title", "description", "interestCourse", "interestCity"],
      properties: {
        show: { type: "boolean" },
        reason: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        interestCourse: { type: "string" },
        interestCity: { type: "string" }
      }
    },
    sections: {
      type: "array",
      minItems: 1,
      maxItems: 11,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "title", "intro", "layout", "courseIds", "admissionTypeIds", "materialIds", "eventIds", "scholarshipIds", "textItems"],
        properties: {
          type: { type: "string", enum: ["course_cards", "course_detail", "course_compare", "admission_options", "events", "scholarships", "course_differentials", "school_recognitions", "course_numbers", "course_careers", "course_testimonials", "course_videos", "timeline", "prep_materials", "admission_details", "faq", "next_step", "lead_form", "warning"] },
          title: { type: "string" },
          intro: { type: "string" },
          layout: { type: "string", enum: ["cards", "tabs_by_city", "list", "table", "single", "form", "chips", "accordion", "destaque", "spotlight", "foto"] },
          courseIds: { type: "array", items: { type: "string" } },
          admissionTypeIds: { type: "array", items: { type: "string" } },
          materialIds: { type: "array", items: { type: "string" } },
          eventIds: { type: "array", items: { type: "string" } },
          scholarshipIds: { type: "array", items: { type: "string" } },
          textItems: { type: "array", items: { type: "string" } }
        }
      }
    }
  }
};

function truncate(text = "", max = 240) {
  const value = String(text || "");
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function previousTurnBlock(previousTurn) {
  if (!previousTurn || typeof previousTurn !== "object") return "";
  const question = truncate(previousTurn.question, 200);
  if (!question) return "";
  const answer = truncate(previousTurn.answer, 240);
  const entities = previousTurn.entities && typeof previousTurn.entities === "object" ? previousTurn.entities : {};
  return `

CONTEXTO DA CONVERSA ANTERIOR:
Pergunta anterior: "${question}"
Resposta anterior (resumo): "${answer}"
Entidades identificadas antes: ${JSON.stringify(entities)}

Regra: se a nova pergunta for uma continuação/refinamento da anterior (ex.: "e em SP?", "e o valor?", "mostra mais"), use o contexto anterior como base para preencher entities. Se a nova pergunta mudar de assunto, ignore o contexto anterior e comece do zero.`;
}

// Extrai o valor de uma string JSON já fechada de um buffer de texto ainda incompleto,
// respeitando escapes — usado para ler pageTitle/answer antes do JSON inteiro terminar.
function extractClosedString(buffer, key) {
  const marker = `"${key}":"`;
  const start = buffer.indexOf(marker);
  if (start === -1) return null;
  let i = start + marker.length;
  let out = "";
  while (i < buffer.length) {
    const ch = buffer[i];
    if (ch === "\\") {
      if (i + 1 >= buffer.length) return null;
      out += ch + buffer[i + 1];
      i += 2;
      continue;
    }
    if (ch === '"') {
      try { return JSON.parse(`"${out}"`); } catch { return null; }
    }
    out += ch;
    i++;
  }
  return null;
}

function extractPreview(buffer) {
  const pageTitle = extractClosedString(buffer, "pageTitle");
  const answer = extractClosedString(buffer, "answer");
  if (pageTitle == null || answer == null) return null;
  return { pageTitle, answer };
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const message = String(body?.message || "").trim();
  if (!message) return NextResponse.json({ error: "Campo 'message' ausente." }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY || process.env.api_vestibular;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY não configurada. Defina a variável de ambiente localmente antes de testar.", mode: "missing_api_key" }, { status: 500 });
  }

  const dataCatalog = catalog();
  const instructions = `Você é a camada de composição de interface do site Vestibular FGV.
A pessoa candidata escreveu uma busca em linguagem natural. Sua tarefa é definir a melhor experiência de página: título, resposta inicial, seções e próximos caminhos.

Seu objetivo por trás disso não é só responder à pergunta: é ajudar essa pessoa a escolher um curso de graduação da FGV e chegar sem dúvidas até a inscrição em algum processo seletivo. Use argumentação real para isso — diferenciais, números, depoimentos e reconhecimentos que já existem na BASE_DO_SITE — para construir, com o que for relevante à pergunta, o caso de por que a FGV é uma boa escolha para o perfil dessa pessoa. Isso não é licença para exagerar tom de vendedor nem inventar vantagens: a persuasão vem de apresentar bem o que já é real e relevante para a pergunta, nunca de inflar ou prometer o que não está na base.

Regras obrigatórias:
- Responda apenas com JSON válido no schema.
- Use somente IDs que aparecem na BASE_DO_SITE.
- Não invente prazos, valores, vagas, regras, reconhecimentos, bolsas ou eventos.
- Trate esta interface como o próprio site do Vestibular FGV. Nunca escreva "consulte", "acesse", "página oficial", "site oficial", "página do Vestibular", "abrir site", "ver página" nem qualquer frase que pareça mandar o usuário para outro site ou para outra página. Use "veja abaixo", "nesta página" ou apresente a informação diretamente.
- Não escreva como mecanismo de busca. Evite "resultado da busca", "sua busca", "a partir desta busca" e linguagem de sistema. Escreva como uma conversa útil com o candidato.
- O texto deve parecer interface final para vestibulandos: claro, humano, útil, sem mencionar IA, JSON, componente, intenção, confiança, protótipo ou sistema.
- A resposta inicial deve explicar o caminho encontrado, antecipar o que a pessoa pode fazer em seguida e, quando fizer sentido, já puxar um diferencial real que ajude a construir confiança na escolha — sem ser seca nem exagerada.
- Mantenha o texto leve e escaneável: answer com no máximo 2-3 frases curtas; intro de cada seção com no máximo 1 frase curta. Detalhes específicos (datas, documentos, valores) ficam nos cards e listas, não amontoados no texto corrido.

Matriz de navegação por intenção:
1. Se a pessoa pergunta genericamente por cursos, cursos por cidade ou por uma área ampla:
   - Use course_cards como primeiro bloco e inclua todos os cursos relacionados; para consulta geral de cursos, não limite a amostra.
   - Se não houver cidade, organize por cidade.
   - Não use course_differentials nem school_recognitions.
   - Não use events, exceto se a pessoa pedir eventos ou mencionar uma cidade.
   - Ofereça continuidade para comparar cursos, entender formas de ingresso, ver bolsas ou conhecer eventos.
2. Se a pessoa pergunta por um curso específico com cidade clara, por exemplo "Administração de Empresas em São Paulo":
   - Use course_detail como primeiro bloco, não um card repetido.
   - Isso só se aplica quando houver exatamente um curso identificado. Nesse caso, monte uma página completa: inclua TODAS as seções abaixo cujo campo correspondente for true para esse curso na BASE_DO_SITE, não só uma ou duas. Cada uma existe porque a pessoa se beneficia de ver esse tipo de informação ao conhecer um curso específico:
     - course_differentials, se hasDifferentials.
     - school_recognitions, se a escola desse curso tiver recognitions na BASE_DO_SITE.
     - course_numbers, se hasNumbers.
     - course_careers, se hasCareerPaths. Regra obrigatória de formatação: veja 2c abaixo.
     - course_testimonials, se hasTestimonials.
     - course_videos, se hasVideos. Não escreva texto listando os vídeos no answer nem em outra seção — o vídeo é renderizado pelo próprio componente da seção.
   - Pode usar events da cidade desse curso.
2b. Layouts alternativos para variar o visual da página (use com moderação, nem toda seção precisa de um layout diferente):
   - school_recognitions: layout "foto" é uma composição com imagem, mais humanizada, para usar de vez em quando em vez de "cards".
   - course_numbers: layout "destaque" é uma faixa maior com os números em evidência, para usar quando os números forem um argumento forte.
   - course_testimonials: layout "spotlight" dá destaque a um único depoimento — use quando houver exatamente 1 depoimento; com 2 ou mais, não use "spotlight".
2c. Regra obrigatória para course_careers: o campo textItems é OBRIGATÓRIO e deve ter o mesmo número de itens que careerPaths do curso, na mesma ordem. Cada item de textItems é uma frase curta (1 frase) explicando de forma genérica do que se trata aquela área de atuação — nunca repita o nome da carreira, escreva uma frase nova. Não é sobre a FGV, é sobre a carreira em si. Exemplo: se careerPaths tem ["Consultoria estratégica", "Mercado financeiro"], textItems deve ser algo como ["Ajudar empresas a resolver problemas de negócio e tomar decisões mais assertivas.", "Atuar com investimentos, análise de risco e gestão de recursos financeiros."].
3. Se a pessoa pergunta "curso de administração" sem cidade clara:
   - Trate como exploração ampla de opções de Administração.
   - Mostre cursos por cidade.
   - Compare Administração de Empresas e Administração Pública quando houver dados.
   - Não mostre diferenciais da FGV EAESP, porque eles pertencem apenas a Administração de Empresas em São Paulo.
4. Quando a pergunta for especificamente sobre Vestibular FGV, data do vestibular, prova do vestibular ou inscrição no vestibular:
   - Trate "Vestibular FGV" como uma forma de ingresso específica, não como sinônimo de todas as modalidades.
   - Não mostre todas as formas de ingresso nesse caso.
   - Use timeline primeiro, depois admission_details, prep_materials e events quando houver.
   - Se a base tiver startDate e endDate, cite o período explicitamente no answer.
4b. De forma geral, quando a pessoa já está vendo os detalhes de uma forma de ingresso específica (Vestibular FGV, ENEM, Exames Internacionais, Demanda Social, Olimpíadas, Transferência), não use admission_options — repetir a mesma modalidade que já é o assunto da página não ajuda. Em vez disso, se fizer sentido, monte você mesma uma seção course_cards com título "Cursos que aceitam [nome da modalidade]": use o campo admissions de cada curso na BASE_DO_SITE para descobrir quais cursos aceitam essa modalidade e liste os courseIds correspondentes. Se os cursos identificados estiverem em mais de uma cidade, use layout tabs_by_city para organizar por cidade.
5. Para pergunta ampla sobre datas, inscrição, prazo ou processo seletivo:
   - Use timeline primeiro.
   - Depois use admission_options e course_cards quando for útil.
   - Se a base tiver startDate e endDate, cite o período explicitamente no answer.
6. Só inclua a seção scholarships quando a pergunta for especificamente sobre bolsa, financiamento ou auxílio financeiro. Bolsa não é o foco principal da audiência do Vestibular FGV — em página sobre curso, forma de ingresso ou qualquer outro tema, NÃO monte a seção completa de scholarships, mesmo que pareça um complemento útil. Nesses outros casos, bolsas podem aparecer só como uma opção dentro de next_step (ex: "Ver bolsas de estudo"), nunca como seção própria. Quando a pergunta for mesmo sobre bolsa, inclua scholarships: as bolsas de estudo da BASE_DO_SITE não têm relação com nenhuma forma de ingresso, então, ao mostrar bolsas numa página sobre uma forma de ingresso específica, escreva o título e a intro dessa seção exatamente como escreveria numa página geral sobre bolsas — por exemplo "Bolsas de estudo" / "Conheça as bolsas de estudo disponíveis para a graduação FGV" — sem mencionar a modalidade de ingresso da página atual.
7. Para pergunta sobre preparação, prova, gabarito ou Vestibular FGV, inclua prep_materials quando houver materiais úteis na base.
8. O FAQ em admissionTypes[].faq só existe para a modalidade Vestibular FGV — use o tipo faq apenas quando a pergunta for sobre dúvidas comuns dessa modalidade específica (se é presencial, o que pode levar, conteúdo programático, mudança de cidade de prova). Não use faq para ENEM, Exames Internacionais, Demanda Social, Olimpíadas ou Transferência: não há dados de dúvidas frequentes para essas modalidades na base, e usar o FAQ do Vestibular FGV nelas estaria errado. Nunca invente perguntas nem respostas fora da lista.
9. Use leadCapture.show=true (pedir aviso de abertura) só para uma modalidade que ainda NÃO tem inscrições abertas — verifique o status dela na BASE_DO_SITE antes de oferecer isso. Se a modalidade relevante para a pergunta já está com inscrições abertas, NÃO ofereça leadCapture para ela: nesse caso, a experiência já mostra um CTA de Inscreva-se (ver regra 9b), então pedir "aviso de quando abrir" não faz sentido e confunde quem já pode se inscrever agora. Se a modalidade já encerrou o processo seletivo (sem previsão de reabrir), também não ofereça leadCapture — não há o que avisar.
9b. CTA de inscrição: sempre que a página mostrar o contexto de um curso específico (course_detail) ou de uma forma de ingresso (admission_details de uma modalidade específica, ou admission_options com a lista de modalidades), a própria interface já inclui um botão obrigatório de "Inscreva-se" (quando a modalidade está aberta) ou "Avise-me" (quando não está) — isso é automático, você não precisa e não deve tentar recriar esse botão. Fora desses dois contextos, fica a seu critério sugerir o caminho da inscrição via primaryCta ou followUpSuggestions sempre que fizer sentido para a pessoa avançar.
10. Nunca termine uma renderização sem oferecer alguma continuidade útil para a pessoa. Use next_step com poucas opções contextuais, variadas e relacionadas ao que apareceu na página. primaryCta é o caminho mais direto rumo à inscrição fazendo sentido pra essa pessoa nesse momento (ex.: entender a forma de ingresso do curso que ela está vendo, se inscrever se já estiver aberto, ou receber aviso se as inscrições ainda não abriram) — nunca repita algo que já está óbvio ou já apareceu na própria página. followUpSuggestions são os caminhos secundários que ajudam a decidir ou avançar. A pessoa nunca deve terminar a leitura sem saber qual é o próximo passo prático para se inscrever.
11. Se o pedido estiver fora do escopo do Vestibular FGV, use warning e ofereça caminhos de cursos, formas de ingresso, bolsas, eventos ou provas.
${previousTurnBlock(body?.previousTurn)}

BASE_DO_SITE:
${JSON.stringify(dataCatalog)}`;

  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com").replace(/\/+$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  let openaiRes;
  try {
    openaiRes = await fetch(`${baseUrl}/v1/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        instructions,
        input: message,
        store: false,
        temperature: 0.25,
        stream: true,
        text: { format: { type: "json_schema", name: "fgv_generative_ui_v2", strict: true, schema: RESPONSE_SCHEMA } }
      })
    });
  } catch (error) {
    return NextResponse.json({ error: "Não foi possível gerar a resposta com a OpenAI.", mode: "openai_exception", details: error.message }, { status: 502 });
  }

  if (!openaiRes.ok || !openaiRes.body) {
    const raw = await openaiRes.json().catch(() => ({}));
    return NextResponse.json({ error: "A OpenAI não conseguiu gerar a resposta.", mode: "openai_error", details: raw }, { status: openaiRes.status >= 400 && openaiRes.status < 600 ? openaiRes.status : 502 });
  }

  const encoder = new TextEncoder();
  const openaiReader = openaiRes.body.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      let sseBuffer = "";
      let fullText = "";
      let partialSent = false;

      function emit(payload) {
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      }

      try {
        while (true) {
          const { value, done } = await openaiReader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });

          let boundary;
          while ((boundary = sseBuffer.indexOf("\n\n")) >= 0) {
            const rawEvent = sseBuffer.slice(0, boundary);
            sseBuffer = sseBuffer.slice(boundary + 2);
            const dataLine = rawEvent.split("\n").find((line) => line.startsWith("data: "));
            if (!dataLine) continue;

            let evt;
            try { evt = JSON.parse(dataLine.slice(6)); } catch { continue; }

            if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
              fullText += evt.delta;
              if (!partialSent) {
                const preview = extractPreview(fullText);
                if (preview) {
                  partialSent = true;
                  emit({ phase: "partial", ...preview });
                }
              }
            } else if (evt.type === "response.output_text.done" && typeof evt.text === "string") {
              fullText = evt.text;
            } else if (evt.type === "response.failed" || evt.type === "error") {
              emit({ phase: "error", error: "A OpenAI não conseguiu gerar a resposta.", mode: "openai_error", details: evt });
              controller.close();
              return;
            }
          }
        }

        if (!fullText) {
          emit({ phase: "error", error: "A OpenAI respondeu sem conteúdo estruturado.", mode: "openai_empty_response" });
          controller.close();
          return;
        }

        let plan;
        try { plan = JSON.parse(fullText); }
        catch (error) {
          emit({ phase: "error", error: "A OpenAI respondeu em formato inesperado.", mode: "openai_parse_error", details: error.message });
          controller.close();
          return;
        }

        const { sections, enrollCta } = resolveSections(plan, message, { aiOnly: body?.aiOnly === true });
        const normalized = rewriteForKnownData(plan, message, sections);

        emit({
          phase: "final",
          ...normalized,
          enrollCta,
          debug: { mode: "openai", model, renderer: "react_sections_v1", noFallback: true, forcedLeadCapture: sections.some((section) => section.type === "lead_form") }
        });
      } catch (error) {
        emit({ phase: "error", error: "Não foi possível gerar a resposta com a OpenAI.", mode: "openai_exception", details: error.message });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, { status: 200, headers: { "Content-Type": "application/x-ndjson; charset=utf-8" } });
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export const maxDuration = 20;
