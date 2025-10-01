import { Circle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DeathSaves as DeathSavesType } from "@shared/schema";

interface DeathSavesProps {
  deathSaves: DeathSavesType;
  onUpdate?: (deathSaves: DeathSavesType) => void;
}

export default function DeathSaves({ deathSaves, onUpdate }: DeathSavesProps) {
  const addSuccess = () => {
    if (deathSaves.successes < 3 && onUpdate) {
      onUpdate({ ...deathSaves, successes: deathSaves.successes + 1 });
    }
  };

  const addFailure = () => {
    if (deathSaves.failures < 3 && onUpdate) {
      onUpdate({ ...deathSaves, failures: deathSaves.failures + 1 });
    }
  };

  const reset = () => {
    if (onUpdate) {
      onUpdate({ successes: 0, failures: 0 });
    }
  };

  return (
    <div className="space-y-2 p-2 border border-border rounded-md" data-testid="death-saves">
      <div className="text-xs font-medium text-muted-foreground">Спасброски от смерти</div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 text-xs"
          onClick={addSuccess}
          data-testid="button-add-success"
        >
          <CheckCircle2 className="h-3 w-3 text-chart-4" />
          Успех
        </Button>
        <div className="flex gap-0.5">
          {[...Array(3)].map((_, i) => (
            i < deathSaves.successes ? (
              <CheckCircle2 key={i} className="h-4 w-4 text-chart-4" />
            ) : (
              <Circle key={i} className="h-4 w-4 text-muted-foreground" />
            )
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 text-xs"
          onClick={addFailure}
          data-testid="button-add-failure"
        >
          <XCircle className="h-3 w-3 text-chart-3" />
          Провал
        </Button>
        <div className="flex gap-0.5">
          {[...Array(3)].map((_, i) => (
            i < deathSaves.failures ? (
              <XCircle key={i} className="h-4 w-4 text-chart-3" />
            ) : (
              <Circle key={i} className="h-4 w-4 text-muted-foreground" />
            )
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-6 w-full text-xs"
        onClick={reset}
        data-testid="button-reset-death-saves"
      >
        Сбросить
      </Button>
    </div>
  );
}
