import { Progress } from "@/components/ui/progress";

interface HPBarProps {
  current: number;
  max: number;
  isBoss?: boolean;
}

export default function HPBar({ current, max, isBoss = false }: HPBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  const getColor = () => {
    if (isBoss) return "bg-faction-boss";
    if (percentage > 60) return "bg-chart-4";
    if (percentage > 30) return "bg-chart-2";
    return "bg-chart-3";
  };

  return (
    <div className="space-y-1" data-testid="hp-bar">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">HP</span>
        <span className="font-medium">
          {current}/{max}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
