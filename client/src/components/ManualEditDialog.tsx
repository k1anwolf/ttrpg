import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Participant, Characteristics } from "@shared/schema";

interface ManualEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: Participant;
  onUpdate: (updated: Participant) => void;
}

export default function ManualEditDialog({
  open,
  onOpenChange,
  participant,
  onUpdate,
}: ManualEditDialogProps) {
  const [hpCurr, setHpCurr] = useState(participant.hpCurr?.toString() || "");
  const [hpMax, setHpMax] = useState(participant.hpMax?.toString() || "");
  const [mpCurr, setMpCurr] = useState(participant.mpCurr.toString());
  const [mpMax, setMpMax] = useState(participant.mpMax.toString());
  const [damageTaken, setDamageTaken] = useState(participant.damageTaken.toString());
  const [ac, setAc] = useState(participant.ac.toString());
  const [characteristics, setCharacteristics] = useState<Characteristics>(
    participant.characteristics
  );

  const handleSave = () => {
    const isBoss = participant.characterType === "boss";
    const updated: Participant = {
      ...participant,
      hpCurr: isBoss ? null : parseInt(hpCurr) || 0,
      hpMax: isBoss ? null : parseInt(hpMax) || 0,
      mpCurr: parseInt(mpCurr) || 0,
      mpMax: parseInt(mpMax) || 0,
      damageTaken: parseInt(damageTaken) || 0,
      ac: parseInt(ac) || 0,
      characteristics,
    };
    onUpdate(updated);
    onOpenChange(false);
  };

  const handleCharacteristicChange = (key: keyof Characteristics, value: string) => {
    setCharacteristics({
      ...characteristics,
      [key]: parseInt(value) || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактировать {participant.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resources">Ресурсы</TabsTrigger>
            <TabsTrigger value="stats">Характеристики</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-4 mt-4">
            {participant.characterType === "boss" ? (
              <div>
                <Label htmlFor="damage-taken">Получено урона</Label>
                <Input
                  id="damage-taken"
                  type="number"
                  value={damageTaken}
                  onChange={(e) => setDamageTaken(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hp-curr">Текущее HP</Label>
                    <Input
                      id="hp-curr"
                      type="number"
                      value={hpCurr}
                      onChange={(e) => setHpCurr(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hp-max">Максимальное HP</Label>
                    <Input
                      id="hp-max"
                      type="number"
                      value={hpMax}
                      onChange={(e) => setHpMax(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mp-curr">Текущее MP</Label>
                <Input
                  id="mp-curr"
                  type="number"
                  value={mpCurr}
                  onChange={(e) => setMpCurr(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="mp-max">Максимальное MP</Label>
                <Input
                  id="mp-max"
                  type="number"
                  value={mpMax}
                  onChange={(e) => setMpMax(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ac">Класс брони (AC)</Label>
              <Input
                id="ac"
                type="number"
                value={ac}
                onChange={(e) => setAc(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="strength">Сила (STR)</Label>
                <Input
                  id="strength"
                  type="number"
                  value={characteristics.strength}
                  onChange={(e) => handleCharacteristicChange("strength", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dexterity">Ловкость (DEX)</Label>
                <Input
                  id="dexterity"
                  type="number"
                  value={characteristics.dexterity}
                  onChange={(e) => handleCharacteristicChange("dexterity", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="constitution">Телосложение (CON)</Label>
                <Input
                  id="constitution"
                  type="number"
                  value={characteristics.constitution}
                  onChange={(e) =>
                    handleCharacteristicChange("constitution", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="intelligence">Интеллект (INT)</Label>
                <Input
                  id="intelligence"
                  type="number"
                  value={characteristics.intelligence}
                  onChange={(e) =>
                    handleCharacteristicChange("intelligence", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="wisdom">Мудрость (WIS)</Label>
                <Input
                  id="wisdom"
                  type="number"
                  value={characteristics.wisdom}
                  onChange={(e) => handleCharacteristicChange("wisdom", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="charisma">Харизма (CHA)</Label>
                <Input
                  id="charisma"
                  type="number"
                  value={characteristics.charisma}
                  onChange={(e) => handleCharacteristicChange("charisma", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
