type CourseStatusProps = {
  isPublished: boolean;
};

export function CourseStatus({ isPublished }: CourseStatusProps) {
  return (
    <span
      className={
        isPublished
          ? "inline-flex self-start items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
          : "inline-flex self-start items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700"
      }
    >
      <span
        aria-hidden="true"
        className={isPublished ? "size-2 rounded-full bg-emerald-600" : "size-2 rounded-full bg-neutral-400"}
      />
      {isPublished ? "Publicado" : "Rascunho"}
    </span>
  );
}
