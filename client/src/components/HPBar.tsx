import { Progress } from "@/components/ui/progress";
import { Skull } from "lucide-react";

interface HPBarProps {
  current: number | null;
  max: number | null;
  damageTaken?: number;
  characterType?: "player" | "npc" | "boss";
}

export default function HPBar({ current, max, damageTaken = 0, characterType = "npc" }: HPBarProps) {
  if (characterType === "boss") {
    return (
      <div className="space-y-1" data-testid="hp-bar">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Skull className="h-3 w-3" />
            Урон получен
          </span>
          <span className="font-medium text-destructive">{damageTaken}</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full transition-all bg-destructive"
            style={{ width: "100%" }}
          />
        </div>
      </div>
    );
  }

  if (current === null || max === null) {
    return null;
  }

  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  const getColor = () => {
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
