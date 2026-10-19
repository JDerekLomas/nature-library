/** Paragraphs of plain text quoted from a Wikipedia section. */
export default function WikiText({ text }: { text: string }) {
  return (
    <div className="space-y-3 max-w-[70ch] leading-relaxed">
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
