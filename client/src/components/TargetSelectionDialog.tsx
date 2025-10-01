import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Participant, Action, HitResult } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface TargetSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: Action;
  caster: Participant;
  allParticipants: Participant[];
  onConfirm: (targets: Array<{ targetId: string; hitResult: HitResult }>, isAoE: boolean) => void;
}

export default function TargetSelectionDialog({
  open,
  onOpenChange,
  action,
  caster,
  allParticipants,
  onConfirm,
}: TargetSelectionDialogProps) {
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [hitResults, setHitResults] = useState<Record<string, HitResult>>({});
  const [isAoE, setIsAoE] = useState(false);

  const isMultiTarget = action.targetCount === -1 || action.targetCount > 1;
  const availableTargets = allParticipants.filter((p) => !p.isDead);

  const handleTargetToggle = (targetId: string) => {
    const newSelected = new Set(selectedTargets);
    if (newSelected.has(targetId)) {
      newSelected.delete(targetId);
      const newResults = { ...hitResults };
      delete newResults[targetId];
      setHitResults(newResults);
    } else {
      if (!isMultiTarget && newSelected.size >= 1) {
        newSelected.clear();
        setHitResults({});
      }
      newSelected.add(targetId);
      setHitResults({ ...hitResults, [targetId]: "success" });
    }
    setSelectedTargets(newSelected);
  };

  const handleHitResultChange = (targetId: string, result: HitResult) => {
    setHitResults({ ...hitResults, [targetId]: result });
  };

  const handleConfirm = () => {
    const targets = Array.from(selectedTargets).map((targetId) => ({
      targetId,
      hitResult: hitResults[targetId] || "success",
    }));
    onConfirm(targets, isAoE);
    setSelectedTargets(new Set());
    setHitResults({});
    setIsAoE(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedTargets(new Set());
    setHitResults({});
    setIsAoE(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {caster.name} использует {action.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {action.description || "Выберите цели для применения действия"}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {isMultiTarget && (
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <Checkbox
                id="aoe-mode"
                checked={isAoE}
                onCheckedChange={(checked) => setIsAoE(checked === true)}
              />
              <Label htmlFor="aoe-mode" className="cursor-pointer">
                Режим AoE (применить ко всем целям с одинаковыми эффектами)
              </Label>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold">
              Цели {!isMultiTarget && "(выберите одну)"}:
            </h3>
            {availableTargets.map((target) => (
              <div
                key={target.id}
                className={`p-4 border rounded-lg ${
                  selectedTargets.has(target.id)
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedTargets.has(target.id)}
                    onCheckedChange={() => handleTargetToggle(target.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{target.name}</span>
                      <Badge variant={
                        target.characterType === "player" ? "default" :
                        target.characterType === "boss" ? "destructive" : "secondary"
                      }>
                        {target.characterType === "player" ? "Игрок" :
                         target.characterType === "boss" ? "Босс" : "НПС"}
                      </Badge>
                      {target.isUnconscious && (
                        <Badge variant="outline">Без сознания</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {target.characterType === "boss" ? (
                        <span>Урон получен: {target.damageTaken}</span>
                      ) : (
                        <span>
                          HP: {target.hpCurr}/{target.hpMax}
                        </span>
                      )}
                      {" • "}AC: {target.ac}
                    </div>

                    {selectedTargets.has(target.id) && (
                      <div className="mt-3">
                        <Label className="text-xs mb-2 block">
                          Результат проверки попадания:
                        </Label>
                        <RadioGroup
                          value={hitResults[target.id] || "success"}
                          onValueChange={(value) =>
                            handleHitResultChange(target.id, value as HitResult)
                          }
                          className="grid grid-cols-2 gap-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="success" id={`success-${target.id}`} />
                            <Label
                              htmlFor={`success-${target.id}`}
                              className="cursor-pointer text-sm"
                            >
                              Успех
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="failure" id={`failure-${target.id}`} />
                            <Label
                              htmlFor={`failure-${target.id}`}
                              className="cursor-pointer text-sm"
                            >
                              Провал
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="critical_success"
                              id={`crit-success-${target.id}`}
                            />
                            <Label
                              htmlFor={`crit-success-${target.id}`}
                              className="cursor-pointer text-sm"
                            >
                              Крит. успех
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="critical_failure"
                              id={`crit-failure-${target.id}`}
                            />
                            <Label
                              htmlFor={`crit-failure-${target.id}`}
                              className="cursor-pointer text-sm"
                            >
                              Крит. провал
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedTargets.size === 0}
          >
            Применить к {selectedTargets.size} {selectedTargets.size === 1 ? "цели" : "целям"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
