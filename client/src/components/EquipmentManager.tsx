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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Shield } from "lucide-react";
import type { Equipment } from "@shared/schema";

interface EquipmentManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment[];
  onUpdate: (equipment: Equipment[]) => void;
}

export default function EquipmentManager({
  open,
  onOpenChange,
  equipment,
  onUpdate,
}: EquipmentManagerProps) {
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slot: "",
    description: "",
    statBonuses: {} as Record<string, number>,
  });

  const handleAddEquipment = () => {
    const newEquipment: Equipment = {
      id: Date.now().toString(),
      name: formData.name,
      slot: formData.slot,
      description: formData.description,
      statBonuses: formData.statBonuses,
      isEquipped: true,
    };
    onUpdate([...equipment, newEquipment]);
    resetForm();
    setShowAddForm(false);
  };

  const handleRemoveEquipment = (id: string) => {
    onUpdate(equipment.filter((e) => e.id !== id));
  };

  const handleToggleEquipped = (id: string) => {
    onUpdate(
      equipment.map((e) =>
        e.id === id ? { ...e, isEquipped: !e.isEquipped } : e
      )
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slot: "",
      description: "",
      statBonuses: {},
    });
  };

  const handleBonusChange = (stat: string, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue === 0) {
      const newBonuses = { ...formData.statBonuses };
      delete newBonuses[stat];
      setFormData({ ...formData, statBonuses: newBonuses });
    } else {
      setFormData({
        ...formData,
        statBonuses: { ...formData.statBonuses, [stat]: numValue },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Управление снаряжением
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {equipment.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-muted-foreground">
              Снаряжение отсутствует
            </div>
          )}

          {equipment.map((item) => (
            <div
              key={item.id}
              className={`p-4 border rounded-lg ${
                item.isEquipped ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{item.name}</h4>
                    <Badge variant="outline">{item.slot}</Badge>
                    {item.isEquipped && (
                      <Badge variant="default">Надето</Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.description}
                    </p>
                  )}
                  {Object.keys(item.statBonuses).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(item.statBonuses).map(([stat, value]) => (
                        <Badge key={stat} variant="secondary">
                          {stat}: {value > 0 ? "+" : ""}
                          {value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={item.isEquipped ? "default" : "outline"}
                    onClick={() => handleToggleEquipped(item.id)}
                  >
                    {item.isEquipped ? "Снять" : "Надеть"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveEquipment(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {showAddForm && (
            <div className="p-4 border rounded-lg border-primary bg-muted/50 space-y-4">
              <h4 className="font-semibold">Добавить снаряжение</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eq-name">Название</Label>
                  <Input
                    id="eq-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Меч воина"
                  />
                </div>
                <div>
                  <Label htmlFor="eq-slot">Слот</Label>
                  <Input
                    id="eq-slot"
                    value={formData.slot}
                    onChange={(e) =>
                      setFormData({ ...formData, slot: e.target.value })
                    }
                    placeholder="Оружие"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="eq-description">Описание</Label>
                <Textarea
                  id="eq-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Описание предмета"
                />
              </div>

              <div>
                <Label>Бонусы к характеристикам</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["STR", "DEX", "CON", "INT", "WIS", "CHA", "AC", "HP"].map((stat) => (
                    <div key={stat} className="flex items-center gap-2">
                      <Label className="text-xs min-w-[40px]">{stat}:</Label>
                      <Input
                        type="number"
                        value={formData.statBonuses[stat] || ""}
                        onChange={(e) => handleBonusChange(stat, e.target.value)}
                        placeholder="0"
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddEquipment} disabled={!formData.name || !formData.slot}>
                  Добавить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}

          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить снаряжение
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
