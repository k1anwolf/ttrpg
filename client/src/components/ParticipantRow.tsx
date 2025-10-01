import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Sword, Wand as Wand2, Scroll, ChevronDown, ChevronUp, Plus, CreditCard as Edit, Zap, Shield, Skull, HeartPulse, Settings } from "lucide-react";
import type { Participant, Action } from "@shared/schema";
import HPBar from "./HPBar";
import MPBar from "./MPBar";
import StatusChip from "./StatusChip";
import DeathSaves from "./DeathSaves";
import ActionEditor from "./ActionEditor";
import ApplyActionDialog from "./ApplyActionDialog";
import StatusManager from "./StatusManager";
import EquipmentManager from "./EquipmentManager";
import ManualEditDialog from "./ManualEditDialog";

interface ParticipantRowProps {
  participant: Participant;
  index: number;
  isActive: boolean;
  allParticipants: Participant[];
  onUpdate: (participant: Participant) => void;
  onDelete: () => void;
  onQuickDamage: (amount: number) => void;
  onQuickHeal: (amount: number) => void;
  onApplyAction: (action: Action, targetIds: string[], customValues: Record<string, number>) => void;
}

export default function ParticipantRow({
  participant,
  index,
  isActive,
  allParticipants,
  onUpdate,
  onDelete,
  onQuickDamage,
  onQuickHeal,
  onApplyAction,
}: ParticipantRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [showActionEditor, setShowActionEditor] = useState(false);
  const [editingAction, setEditingAction] = useState<{ action?: Action; type: "attack" | "ability" | "spell" } | null>(null);
  const [showApplyAction, setShowApplyAction] = useState(false);
  const [applyingAction, setApplyingAction] = useState<Action | null>(null);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [showEquipmentManager, setShowEquipmentManager] = useState(false);
  const [showManualEdit, setShowManualEdit] = useState(false);

  const getFactionColor = () => {
    switch (participant.characterType) {
      case "player": return "border-l-faction-player";
      case "npc": return "border-l-faction-npc";
      case "boss": return "border-l-faction-boss";
      default: return "";
    }
  };

  const handleKill = () => {
    onUpdate({ ...participant, isDead: true, isUnconscious: false, deathSaves: undefined });
  };

  const handleResurrect = () => {
    if (participant.characterType === "boss") {
      onUpdate({ ...participant, isDead: false, damageTaken: 0 });
    } else {
      onUpdate({ ...participant, isDead: false, isUnconscious: false, hpCurr: 1, deathSaves: undefined });
    }
  };

  const handleDeathSaveResurrect = () => {
    onUpdate({ ...participant, isUnconscious: false, hpCurr: 1, deathSaves: undefined });
  };

  const handleDeathSaveDeath = () => {
    onUpdate({ ...participant, isDead: true, isUnconscious: false, deathSaves: undefined });
  };

  const handleAddAction = (type: "attack" | "ability" | "spell") => {
    setEditingAction({ type });
    setShowActionEditor(true);
  };

  const handleEditAction = (action: Action, type: "attack" | "ability" | "spell") => {
    setEditingAction({ action, type });
    setShowActionEditor(true);
  };

  const handleSaveAction = (action: Action) => {
    const type = editingAction?.type;
    if (!type) return;

    const field = type === "attack" ? "attacks" : type === "ability" ? "abilities" : "spells";
    const actions = participant[field];
    const existingIndex = actions.findIndex((a) => a.id === action.id);

    if (existingIndex >= 0) {
      onUpdate({
        ...participant,
        [field]: actions.map((a) => (a.id === action.id ? action : a)),
      });
    } else {
      onUpdate({
        ...participant,
        [field]: [...actions, action],
      });
    }

    setEditingAction(null);
  };

  const handleDeleteAction = (actionId: string, type: "attack" | "ability" | "spell") => {
    const field = type === "attack" ? "attacks" : type === "ability" ? "abilities" : "spells";
    onUpdate({
      ...participant,
      [field]: participant[field].filter((a) => a.id !== actionId),
    });
  };

  const handleUseAction = (action: Action) => {
    setApplyingAction(action);
    setShowApplyAction(true);
  };

  const handleApplyActionConfirm = (targetIds: string[], customValues: Record<string, number>) => {
    if (applyingAction) {
      onApplyAction(applyingAction, targetIds, customValues);
    }
  };

  return (
    <>
      <div
        className={`border-l-4 ${getFactionColor()} bg-card p-4 rounded-md space-y-3 ${
          isActive ? 'ring-2 ring-ring' : ''
        }`}
        data-testid={`participant-row-${participant.id}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="shrink-0">
                {index + 1}
              </Badge>
              <Input
                value={participant.name}
                onChange={(e) => onUpdate({ ...participant, name: e.target.value })}
                className="h-8 font-medium"
                data-testid={`input-name-${participant.id}`}
              />
              <Input
                type="number"
                value={participant.initiative}
                onChange={(e) => onUpdate({ ...participant, initiative: Number(e.target.value) })}
                className="h-8 w-20"
                data-testid={`input-initiative-${participant.id}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <HPBar
                  current={participant.hpCurr}
                  max={participant.hpMax}
                  damageTaken={participant.damageTaken}
                  characterType={participant.characterType}
                />
              </div>
              <div>
                <MPBar current={participant.mpCurr} max={participant.mpMax} />
              </div>
            </div>

            {participant.isDead && (
              <Badge variant="destructive" className="w-full justify-center">
                <Skull className="h-3 w-3 mr-1" />
                Мертв
              </Badge>
            )}

            {participant.isUnconscious && participant.deathSaves && participant.characterType === "player" && (
              <DeathSaves
                deathSaves={participant.deathSaves}
                onUpdate={(ds) => onUpdate({ ...participant, deathSaves: ds })}
                onResurrect={handleDeathSaveResurrect}
                onDeath={handleDeathSaveDeath}
              />
            )}

            {participant.statuses.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {participant.statuses.map((status) => (
                  <StatusChip
                    key={status.id}
                    status={status}
                    onRemove={() => {
                      onUpdate({
                        ...participant,
                        statuses: participant.statuses.filter((s) => s.id !== status.id),
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              data-testid={`button-expand-${participant.id}`}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowManualEdit(true)}
              data-testid={`button-manual-edit-${participant.id}`}
              title="Редактировать"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowStatusManager(true)}
              data-testid={`button-manage-statuses-${participant.id}`}
              title="Статусы"
            >
              <Zap className="h-4 w-4" />
            </Button>
            {(participant.characterType === "player" || participant.characterType === "npc") && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowEquipmentManager(true)}
                data-testid={`button-equipment-${participant.id}`}
                title="Снаряжение"
              >
                <Shield className="h-4 w-4" />
              </Button>
            )}
            {participant.isDead ? (
              <Button
                variant="outline"
                size="icon"
                onClick={handleResurrect}
                data-testid={`button-resurrect-${participant.id}`}
                title="Воскресить"
              >
                <HeartPulse className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="icon"
                onClick={handleKill}
                data-testid={`button-kill-${participant.id}`}
                title="Убить"
              >
                <Skull className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="destructive"
              size="icon"
              onClick={onDelete}
              data-testid={`button-delete-${participant.id}`}
              title="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onQuickDamage(5)}
            data-testid={`button-damage-5-${participant.id}`}
          >
            -5 HP
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onQuickDamage(10)}
            data-testid={`button-damage-10-${participant.id}`}
          >
            -10 HP
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-chart-4"
            onClick={() => onQuickHeal(5)}
            data-testid={`button-heal-5-${participant.id}`}
          >
            +5 HP
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-chart-4"
            onClick={() => onQuickHeal(10)}
            data-testid={`button-heal-10-${participant.id}`}
          >
            +10 HP
          </Button>
        </div>

        {expanded && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">AC:</span> {participant.ac}
              </div>
              <div>
                <span className="text-muted-foreground">СИЛ:</span> {participant.characteristics.strength}
              </div>
              <div>
                <span className="text-muted-foreground">ЛОВ:</span> {participant.characteristics.dexterity}
              </div>
              <div>
                <span className="text-muted-foreground">ТЕЛ:</span> {participant.characteristics.constitution}
              </div>
              <div>
                <span className="text-muted-foreground">ИНТ:</span> {participant.characteristics.intelligence}
              </div>
              <div>
                <span className="text-muted-foreground">МДР:</span> {participant.characteristics.wisdom}
              </div>
              <div>
                <span className="text-muted-foreground">ХАР:</span> {participant.characteristics.charisma}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sword className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Атаки</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 text-xs"
                  onClick={() => handleAddAction("attack")}
                  data-testid={`button-add-attack-${participant.id}`}
                >
                  <Plus className="h-3 w-3" />
                  Добавить
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {participant.attacks.map((attack) => (
                  <Badge
                    key={attack.id}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover-elevate"
                    onClick={() => handleUseAction(attack)}
                    data-testid={`badge-attack-${attack.id}`}
                  >
                    {attack.name}
                    <Edit
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAction(attack, "attack");
                      }}
                    />
                    <Trash2
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAction(attack.id, "attack");
                      }}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Умения</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 text-xs"
                  onClick={() => handleAddAction("ability")}
                  data-testid={`button-add-ability-${participant.id}`}
                >
                  <Plus className="h-3 w-3" />
                  Добавить
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {participant.abilities.map((ability) => (
                  <Badge
                    key={ability.id}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover-elevate"
                    onClick={() => handleUseAction(ability)}
                    data-testid={`badge-ability-${ability.id}`}
                  >
                    {ability.name}
                    <Edit
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAction(ability, "ability");
                      }}
                    />
                    <Trash2
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAction(ability.id, "ability");
                      }}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Scroll className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Заклинания</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 text-xs"
                  onClick={() => handleAddAction("spell")}
                  data-testid={`button-add-spell-${participant.id}`}
                >
                  <Plus className="h-3 w-3" />
                  Добавить
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {participant.spells.map((spell) => (
                  <Badge
                    key={spell.id}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover-elevate"
                    onClick={() => handleUseAction(spell)}
                    data-testid={`badge-spell-${spell.id}`}
                  >
                    {spell.name}
                    <Edit
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAction(spell, "spell");
                      }}
                    />
                    <Trash2
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAction(spell.id, "spell");
                      }}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {editingAction && (
        <ActionEditor
          open={showActionEditor}
          onOpenChange={setShowActionEditor}
          action={editingAction.action}
          actionType={editingAction.type}
          onSave={handleSaveAction}
        />
      )}

      <ApplyActionDialog
        open={showApplyAction}
        onOpenChange={setShowApplyAction}
        action={applyingAction}
        caster={participant}
        targets={allParticipants.filter((p) => p.id !== participant.id && !p.isDead)}
        onApply={handleApplyActionConfirm}
      />

      <StatusManager
        open={showStatusManager}
        onOpenChange={setShowStatusManager}
        statuses={participant.statuses}
        onAdd={(status) => {
          onUpdate({
            ...participant,
            statuses: [...participant.statuses, status],
          });
        }}
        onUpdate={(status) => {
          onUpdate({
            ...participant,
            statuses: participant.statuses.map((s) => (s.id === status.id ? status : s)),
          });
        }}
        onRemove={(statusId) => {
          onUpdate({
            ...participant,
            statuses: participant.statuses.filter((s) => s.id !== statusId),
          });
        }}
      />

      <EquipmentManager
        open={showEquipmentManager}
        onOpenChange={setShowEquipmentManager}
        equipment={participant.equipment || []}
        onUpdate={(equipment) => {
          onUpdate({ ...participant, equipment });
        }}
      />

      <ManualEditDialog
        open={showManualEdit}
        onOpenChange={setShowManualEdit}
        participant={participant}
        onUpdate={onUpdate}
      />
    </>
  );
}
