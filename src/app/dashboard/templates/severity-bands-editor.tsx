"use client";

import { SeverityBand } from "@/lib/scoring";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const COLOR_OPTIONS = ["green", "amber", "orange", "red", "blue", "neutral"] as const;

function newBand(): SeverityBand {
  return { min: 0, max: 0, label: "", color: "green" };
}

export function SeverityBandsEditor({
  bands,
  onChange,
}: {
  bands: SeverityBand[];
  onChange: (bands: SeverityBand[]) => void;
}) {
  function update(index: number, patch: Partial<SeverityBand>) {
    onChange(bands.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  function remove(index: number) {
    onChange(bands.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {bands.map((band, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <Input
            type="number"
            value={band.min}
            onChange={(e) => update(i, { min: Number(e.target.value) })}
            placeholder="Min"
            className="w-16"
          />
          <span className="text-zinc-400">–</span>
          <Input
            type="number"
            value={band.max}
            onChange={(e) => update(i, { max: Number(e.target.value) })}
            placeholder="Max"
            className="w-16"
          />
          <Input
            value={band.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="e.g. Moderate"
            className="w-36 flex-1"
          />
          <Select
            value={band.color}
            onChange={(e) => update(i, { color: e.target.value })}
            className="w-28"
          >
            {COLOR_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Badge tone={band.color as Parameters<typeof Badge>[0]["tone"]}>
            {band.label || "preview"}
          </Badge>
          <button
            type="button"
            aria-label="Remove band"
            onClick={() => remove(i)}
            className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-500/10"
          >
            ✕
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...bands, newBand()])}>
        + Add severity band
      </Button>
    </div>
  );
}
