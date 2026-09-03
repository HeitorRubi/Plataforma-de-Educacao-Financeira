import Markdown from "react-markdown";

type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content.trim()) {
    return <p className="text-neutral-500">Conteúdo ainda não informado.</p>;
  }

  return (
    <div className="max-w-none text-neutral-800 [&_a]:font-medium [&_a]:text-emerald-800 [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-700 [&_blockquote]:pl-4 [&_blockquote]:text-neutral-600 [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-md [&_img]:border [&_img]:border-neutral-200 [&_li]:my-1 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_p]:leading-8 [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-neutral-950 [&_pre]:p-4 [&_pre]:text-neutral-100 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6">
      <Markdown>{content}</Markdown>
    </div>
  );
}
