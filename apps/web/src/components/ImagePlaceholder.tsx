import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Stand-in until real S3 images land (plan.md §12). The same name always gets the same gradient.
const GRADIENTS = [
  'from-sky-200 to-indigo-300',
  'from-emerald-200 to-teal-300',
  'from-amber-200 to-orange-300',
  'from-rose-200 to-pink-300',
  'from-violet-200 to-purple-300',
  'from-lime-200 to-green-300',
];

function hash(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function ImagePlaceholder({ name, className }: { name: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`${name} (no photo yet)`}
      className={cn(
        'flex aspect-video w-full items-center justify-center bg-gradient-to-br',
        GRADIENTS[hash(name) % GRADIENTS.length],
        className,
      )}
    >
      <Building2 className="size-10 text-white/80" aria-hidden />
    </div>
  );
}
