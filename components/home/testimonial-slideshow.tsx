'use client';

import { useEffect, useRef } from 'react';
import { testimonials } from '@/app/data/testimonials';

const ROWS = 3;
const AUTO_SCROLL_MS = 3500;
const SCROLL_PIXELS = 340;

/** Stable public portrait selected from the testimonial seed. */
function getAvatarUrl(seed: string): string {
  const numericSeed = Number.parseInt(seed, 10) || 1;
  const gender = numericSeed % 2 === 0 ? 'women' : 'men';
  const portrait = 20 + (numericSeed % 60);
  return `https://randomuser.me/api/portraits/${gender}/${portrait}.jpg`;
}

function getRows(): typeof testimonials[] {
  const perRow = Math.ceil(testimonials.length / ROWS);
  const rows: typeof testimonials[] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(testimonials.slice(r * perRow, (r + 1) * perRow));
  }
  return rows;
}

export function TestimonialSlideshow() {
  const rows = getRows();
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto-scroll all rows by default (continuous scroll)
  useEffect(() => {
    const interval = setInterval(() => {
      rowRefs.current.forEach((el) => {
        if (!el) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) return;
        const next = Math.min(el.scrollLeft + SCROLL_PIXELS, maxScroll);
        el.scrollTo({ left: next, behavior: 'smooth' });
        if (next >= maxScroll - 2) {
          setTimeout(() => {
            el.scrollTo({ left: 0, behavior: 'smooth' });
          }, 400);
        }
      });
    }, AUTO_SCROLL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="space-y-8 md:space-y-10">
        {rows.map((rowTestimonials, rowIndex) => (
          <div key={rowIndex} className="relative">
            <div
              ref={(el) => { rowRefs.current[rowIndex] = el; }}
              className="flex gap-6 overflow-x-auto pb-2 scroll-smooth"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {rowTestimonials.map((t) => (
                <article
                  key={`${rowIndex}-${t.avatarSeed}`}
                  className="min-w-[300px] shrink-0 snap-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:min-w-[320px] md:min-w-[340px]"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getAvatarUrl(t.avatarSeed)}
                      alt={`${t.name} profile photo`}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <p className="font-semibold text-slate-900 dark:text-white">{t.name}</p>
                  </div>
                  <p className="mt-4 text-slate-600 dark:text-slate-400">&ldquo;{t.quote}&rdquo;</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
