import type { CourseProgress } from "@/lib/progress/types";

type CourseProgressSummaryProps = {
  progress: CourseProgress;
};

export function CourseProgressSummary({
  progress,
}: CourseProgressSummaryProps) {
  return (
    <section className="border-b border-neutral-200 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-800">Seu progresso</p>
          <h2 className="mt-1 text-xl font-semibold">
            {progress.completedLessons} de {progress.totalLessons}{" "}
            {progress.totalLessons === 1 ? "aula concluída" : "aulas concluídas"}
          </h2>
        </div>
        <span className="text-2xl font-bold text-neutral-900">
          {progress.percentage}%
        </span>
      </div>

      <div
        aria-label={`${progress.percentage}% do curso concluído`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress.percentage}
        className="mt-5 h-2 overflow-hidden rounded-full bg-neutral-200"
        role="progressbar"
      >
        <div
          className="h-full bg-emerald-700 transition-[width]"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {progress.totalLessons === 0 && (
        <p className="mt-3 text-sm text-neutral-500">
          O curso ainda não possui aulas publicadas.
        </p>
      )}
    </section>
  );
}
