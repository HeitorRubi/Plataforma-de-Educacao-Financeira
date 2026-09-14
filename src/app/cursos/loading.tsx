import { LoaderCircle } from "lucide-react";

export default function CoursesLoading() {
  return (
    <main className="page-container">
      <p className="flex items-center gap-3 text-sm font-semibold text-neutral-600">
        <LoaderCircle aria-hidden="true" className="animate-spin text-emerald-700" size={19} />
        Carregando cursos...
      </p>
    </main>
  );
}
