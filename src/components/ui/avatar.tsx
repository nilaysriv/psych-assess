import { cn } from "@/lib/cn";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Props = {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
};

export function Avatar({ name, src, size = 36, className }: Props) {
  const style = { width: size, height: size };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data: URLs aren't compatible with next/image
      <img
        src={src}
        alt={name}
        style={style}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      style={style}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-indigo-600 font-medium text-white",
        className,
      )}
    >
      <span style={{ fontSize: size * 0.4 }}>{initialsFor(name)}</span>
    </div>
  );
}
