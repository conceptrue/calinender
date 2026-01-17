"use client";

interface LegendItem {
  color: string;
  label: string;
}

const legendItems: LegendItem[] = [
  { color: "bg-red-200", label: "Periode" },
  { color: "bg-red-100", label: "Voorspelde periode" },
  { color: "bg-blue-300", label: "Ovulatie" },
  { color: "bg-blue-100", label: "Vruchtbaar" },
];

export function Legend() {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4 text-sm">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`h-4 w-4 rounded ${item.color}`} />
          <span className="text-muted-foreground">{item.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
        <span className="text-muted-foreground">Symptomen</span>
      </div>
    </div>
  );
}
