import { AlertTriangle, ArrowUpRight, CheckCircle2, Radio, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

export function IntelFrame({
  eyebrow,
  title,
  detail,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="relative -mx-5 -my-9 min-h-[calc(100dvh-5rem)] overflow-hidden bg-[#07151e] px-5 py-9 text-[#d9e9e9] md:-mx-9 md:px-9">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(104,171,175,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(104,171,175,.06)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#1f5660] opacity-30 [box-shadow:0_0_0_28px_rgba(27,87,95,.08),0_0_0_56px_rgba(27,87,95,.06)]" />
      <div className="relative mx-auto max-w-[1500px]">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#1c3540] pb-7 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.24em] text-[#64c5c0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e3b34c] shadow-[0_0_12px_rgba(227,179,76,.55)]" />
              {eyebrow}
            </div>
            <h2 className="max-w-4xl font-display text-4xl font-bold tracking-[-.045em] text-[#f0f3e8] md:text-6xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#86a6aa]">{detail}</p>
          </div>
          {action}
        </div>
        {children}
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#1c3540] pt-4 font-mono text-[9px] uppercase tracking-[.16em] text-[#587b81]">
          <span className="flex items-center gap-2"><Radio size={12} className="text-[#64c5c0]" /> Synthetic prototype dataset</span>
          <span>Model-estimated outputs require human review</span>
          <span className="ml-auto">Last sync 06:42 UTC · signal bus nominal</span>
        </div>
      </div>
    </div>
  );
}

export function IntelCard({ children, className = '', testId }: { children: ReactNode; className?: string; testId?: string }) {
  return <section data-testid={testId} className={`border border-[#1e3c47] bg-[#0c202b]/95 ${className}`}>{children}</section>;
}

export function Kpi({ label, value, detail, tone = 'teal', testId }: { label: string; value: string; detail: string; tone?: 'teal' | 'amber' | 'red'; testId: string }) {
  const color = tone === 'red' ? 'text-[#f27d68]' : tone === 'amber' ? 'text-[#e8bd59]' : 'text-[#6dd1c5]';
  return <div data-testid={testId} className="border-l border-[#2c5660] pl-4">
    <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#668b91]">{label}</div>
    <div className={`mt-2 font-display text-3xl font-bold ${color}`}>{value}</div>
    <div className="mt-1 text-xs text-[#75979b]">{detail}</div>
  </div>;
}

export function BarMeter({ value, color = 'teal', testId }: { value: number; color?: 'teal' | 'amber' | 'red'; testId: string }) {
  const bg = color === 'red' ? 'bg-[#e56c5a]' : color === 'amber' ? 'bg-[#d6a840]' : 'bg-[#4cbcb3]';
  return <div data-testid={testId} className="h-1.5 w-full bg-[#19343e]"><div className={`h-full transition-all duration-700 ${bg}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

export function TrendLine({ points, color = '#61c9c1', testId }: { points: { label: string; value: number }[]; color?: string; testId: string }) {
  const max = Math.max(...points.map((point) => point.value), 1);
  const min = Math.min(...points.map((point) => point.value), 0);
  const range = Math.max(max - min, 1);
  const path = points.map((point, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
    const y = 94 - ((point.value - min) / range) * 78;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  return <div data-testid={testId} className="relative h-40 overflow-hidden border-b border-[#23434b] bg-[linear-gradient(to_bottom,transparent_49%,rgba(77,151,153,.12)_50%,transparent_51%)]">
    <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      {points.map((point, index) => <circle key={`${point.label}-${index}`} cx={points.length === 1 ? 50 : (index / (points.length - 1)) * 100} cy={94 - ((point.value - min) / range) * 78} r="1.8" fill={color} />)}
    </svg>
    <div className="absolute inset-x-0 bottom-1 flex justify-between px-1 font-mono text-[9px] text-[#55787f]">
      <span>{points[0]?.label ?? 'BASELINE'}</span><span>{points.at(-1)?.label ?? 'CURRENT'}</span>
    </div>
  </div>;
}

export function DataState({ kind, retry }: { kind: 'loading' | 'error' | 'empty'; retry?: () => void }) {
  if (kind === 'loading') return <div data-testid="state-loading" className="grid gap-4 md:grid-cols-3"><div className="h-28 animate-pulse bg-[#0d2732]" /><div className="h-28 animate-pulse bg-[#0d2732]" /><div className="h-28 animate-pulse bg-[#0d2732]" /><div className="h-72 animate-pulse bg-[#0d2732] md:col-span-3" /></div>;
  if (kind === 'error') return <div data-testid="state-error" className="border border-[#773f3c] bg-[#25191d] p-10 text-center"><AlertTriangle className="mx-auto mb-3 text-[#f27d68]" size={25} /><h3 className="font-display text-xl font-bold text-[#f0d9d0]">Intelligence feed unavailable</h3><p className="mx-auto mt-2 max-w-md text-sm text-[#a87f80]">The synthetic signal service did not respond. No decision has been made.</p>{retry && <button data-testid="button-retry-intelligence" onClick={retry} className="mt-5 inline-flex items-center gap-2 border border-[#8a5650] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#f5b29f] hover:bg-[#3b2427]"><RefreshCw size={13} /> Retry connection</button>}</div>;
  return <div data-testid="state-empty" className="border border-dashed border-[#31545a] bg-[#0b202a] px-6 py-16 text-center"><CheckCircle2 className="mx-auto mb-3 text-[#5ab7af]" size={26} /><h3 className="font-display text-xl font-bold text-[#dcebe6]">No signals in this view</h3><p className="mx-auto mt-2 max-w-md text-sm text-[#77979b]">The model has not identified a qualifying pattern for the current scope.</p></div>;
}

export function EvidenceTag({ children, testId = 'tag-model-estimated' }: { children: ReactNode; testId?: string }) {
  return <span data-testid={testId} className="inline-flex items-center gap-1.5 border border-[#66532b] bg-[#211d12] px-2 py-1 font-mono text-[9px] uppercase tracking-[.12em] text-[#d9b965]"><ArrowUpRight size={11} /> {children}</span>;
}