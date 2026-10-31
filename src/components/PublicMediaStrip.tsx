const SHOTS = [
  {
    src: '/taste/lahore-badshahi.jpg',
    w: 1920,
    h: 1280,
    alt: 'Badshahi Mosque courtyard and prayer hall, Lahore',
  },
  {
    src: '/taste/islamabad-faisal.jpg',
    w: 1920,
    h: 1336,
    alt: 'Faisal Mosque under a clear sky, Islamabad',
  },
  {
    src: '/taste/lahore-gcu.jpg',
    w: 1600,
    h: 1200,
    alt: 'Government College University architecture, Lahore',
  },
  {
    src: '/taste/karachi-harbour-chart.jpg',
    w: 1920,
    h: 2866,
    alt: 'Historical Admiralty chart of Karachi Harbour',
  },
] as const

/** Four+ real pictures so secondary pages meet the imagery floor. */
export function PublicMediaStrip({ start = 0 }: { start?: number }) {
  const items = [...SHOTS.slice(start), ...SHOTS.slice(0, start)].slice(0, 4)
  return (
    <section className="gallery-strip" aria-label="Places around the work">
      {items.map((shot) => (
        <figure key={shot.src} className="reveal">
          <img
            src={shot.src}
            width={shot.w}
            height={shot.h}
            alt={shot.alt}
            loading="lazy"
            decoding="async"
          />
        </figure>
      ))}
    </section>
  )
}
