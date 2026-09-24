import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { Icon } from '../../components/ui';

export function HomeMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer: IntersectionObserver | undefined;
    const targets = Array.from(
      root.querySelectorAll<HTMLElement>(
        '.home-section-heading, .home-new-filters, .home-lifecycle, .home-lifecycle-eyebrow, .home-lifecycle-copy h2, .home-lifecycle-description, .home-lifecycle-divider, .home-lifecycle-cta, .home-category, .home-featured-grid > a, .home-gift-grid > a, .home-district-panel > a, .home-trade-grid > a, .home-items > a, .home-discovery-track > a, .home-value, .home-value-intro, .home-process li, .home-trust-grid > div, .home-ai, .home-final',
      ),
    );
    const show = (target: HTMLElement) => {
      target.classList.add('home-seen');
      observer?.unobserve(target);
    };
    const setup = () => {
      observer?.disconnect();
      if (preference.matches) {
        targets.forEach(show);
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) show(entry.target as HTMLElement);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -24px 0px' },
      );
      targets.forEach((target) => {
        const index = Array.from(target.parentElement?.children ?? []).indexOf(target);
        target.style.setProperty('--home-delay', `${Math.max(0, index % 4) * 65}ms`);
        target.classList.add('home-reveal');
        // Keep restored scroll positions and keyboard navigation immediately readable.
        if (target.getBoundingClientRect().bottom < 0) show(target);
        else observer?.observe(target);
      });
    };
    const onFocus = (event: FocusEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>('.home-reveal');
      if (target) show(target);
    };
    setup();
    root.addEventListener('focusin', onFocus);
    preference.addEventListener('change', setup);
    return () => {
      observer?.disconnect();
      root.removeEventListener('focusin', onFocus);
      preference.removeEventListener('change', setup);
      targets.forEach((target) => {
        target.classList.remove('home-reveal', 'home-seen');
        target.style.removeProperty('--home-delay');
      });
    };
  }, []);

  return (
    <div ref={rootRef} className="home-content">
      {children}
    </div>
  );
}

export function HomeDiscoveryRail({
  children,
  label = 'Món đồ nổi bật',
  variant = 'items',
}: {
  children: ReactNode;
  label?: string;
  variant?: 'items' | 'categories' | 'featured' | 'wide' | 'values' | 'districts' | 'new-items';
}) {
  const trackId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () =>
      setEdges({
        start: track.scrollLeft < 4,
        end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
      });
    update();
    track.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => {
      track.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [children]);
  const move = (direction: number) => {
    const track = trackRef.current;
    if (track)
      track.scrollBy({
        left: direction * track.clientWidth * 0.85,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
  };
  return (
    <div className={`home-discovery home-rail-${variant}`}>
      <div className="home-discovery-controls">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={edges.start}
          aria-controls={trackId}
          aria-label={`Xem trước: ${label}`}
          title="Xem trước"
        >
          <Icon name="arrow" className="size-5 rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={edges.end}
          aria-controls={trackId}
          aria-label={`Xem tiếp: ${label}`}
          title="Xem tiếp"
        >
          <Icon name="arrow" className="size-5" />
        </button>
      </div>
      <div
        ref={trackRef}
        id={trackId}
        className="home-discovery-track"
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
