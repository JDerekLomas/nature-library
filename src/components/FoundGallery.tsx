import type { FoundImage } from "@/lib/images";

/** Pictures found for a species without its own: the first large, the rest small, every one credited. */
export default function FoundGallery({ images, alt, none, credit }: { images: FoundImage[]; alt: string; none: string; credit: string }) {
  if (!images.length)
    return (
      <div className="mount aspect-[4/5] flex items-center justify-center text-center px-8">
        <span className="label text-ink-2">{none}</span>
      </div>
    );
  const [first, ...rest] = images;
  return (
    <figure>
      <a href={first.page} target="_blank" rel="noreferrer" className="mount block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={first.url} alt={alt} className="w-full aspect-[4/5] object-cover bg-paper-3" />
      </a>
      {rest.length > 0 && (
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {rest.map((im) => (
            <a key={im.page} href={im.page} target="_blank" rel="noreferrer" className="aspect-square overflow-hidden border rule block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.thumb} alt="" loading="lazy" className="w-full h-full object-cover" />
            </a>
          ))}
        </div>
      )}
      <figcaption className="mt-3 text-xs text-ink-2 leading-snug">
        {first.attribution} · {first.source}. {credit}
      </figcaption>
    </figure>
  );
}
