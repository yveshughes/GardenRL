'use client';

export default function ProgressIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`progress-dot ${i === current ? 'active' : ''}`}
        />
      ))}
    </div>
  );
}
