import { LoaderCircle } from "lucide-react";

export default function KnowledgeBaseLoading() {
  return (
    <main className="page-container">
      <p className="flex items-center gap-3 text-sm font-semibold text-neutral-600">
        <LoaderCircle aria-hidden="true" className="animate-spin text-emerald-700" size={19} />
        Carregando base de conhecimento...
      </p>
    </main>
  );
}
