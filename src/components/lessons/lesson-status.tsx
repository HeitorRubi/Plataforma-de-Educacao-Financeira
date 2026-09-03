type LessonStatusProps = {
  isPublished: boolean;
};

export function LessonStatus({ isPublished }: LessonStatusProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        isPublished
          ? "bg-emerald-50 text-emerald-800"
          : "bg-neutral-200 text-neutral-700"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${
          isPublished ? "bg-emerald-600" : "bg-neutral-500"
        }`}
      />
      {isPublished ? "Publicada" : "Rascunho"}
    </span>
  );
}
