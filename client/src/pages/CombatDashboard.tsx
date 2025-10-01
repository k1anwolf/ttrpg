import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Save, FolderOpen, Settings } from "lucide-react";
import InitiativeTracker from "@/components/InitiativeTracker";
import CombatControls from "@/components/CombatControls";
import EventLog from "@/components/EventLog";
import ParticipantRow from "@/components/ParticipantRow";
import AddParticipantDialog from "@/components/AddParticipantDialog";
import SaveManager from "@/components/SaveManager";
import type { Participant, EventLog as EventLogType, CombatState, SaveData, RestSettings, Action } from "@shared/schema";

export default function CombatDashboard() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [eventLog, setEventLog] = useState<EventLogType[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSaveManager, setShowSaveManager] = useState(false);
  const [saves, setSaves] = useState<SaveData[]>([]);
  const [restSettings] = useState<RestSettings>({
    shortRest: { hpPercent: 50, mpPercent: 50 },
    longRest: { hpPercent: 100, mpPercent: 100 },
  });

  const sortedParticipants = [...participants].sort((a, b) => b.initiative - a.initiative);

  useEffect(() => {
    const savedData = localStorage.getItem('ttrpg-combat-state');
    if (savedData) {
      try {
        const state: CombatState = JSON.parse(savedData);
        const migratedParticipants = state.participants.map(p => ({
          ...p,
          characterType: p.characterType || p.faction,
          damageTaken: p.damageTaken || 0,
          equipment: p.equipment || [],
          attacks: p.attacks.map(a => ({ ...a, effects: a.effects || [], targetCount: a.targetCount || 1, canRemoveStatus: a.canRemoveStatus || false })),
          abilities: p.abilities.map(a => ({ ...a, effects: a.effects || [], targetCount: a.targetCount || 1, canRemoveStatus: a.canRemoveStatus || false })),
          spells: p.spells.map(a => ({ ...a, effects: a.effects || [], targetCount: a.targetCount || 1, canRemoveStatus: a.canRemoveStatus || false })),
          statuses: p.statuses.map(s => ({ ...s, source: s.source || 'manual' })),
        }));
        setParticipants(migratedParticipants);
        setCurrentTurnIndex(state.currentTurnIndex);
        setCurrentRound(state.currentRound);
        setEventLog(state.eventLog);
      } catch (e) {
        console.error('Failed to load saved state', e);
      }
    }

    const savedSaves = localStorage.getItem('ttrpg-saves');
    if (savedSaves) {
      try {
        setSaves(JSON.parse(savedSaves));
      } catch (e) {
        console.error('Failed to load saves', e);
      }
    }

    if (!savedData) {
      addDemoData();
    }
  }, []);

  useEffect(() => {
    const state: CombatState = {
      participants,
      currentTurnIndex,
      currentRound,
      eventLog,
    };
    localStorage.setItem('ttrpg-combat-state', JSON.stringify(state));
  }, [participants, currentTurnIndex, currentRound, eventLog]);

  const addDemoData = () => {
    const demoParticipants: Participant[] = [
      {
        id: '1',
        name: 'Арагорн',
        initiative: 18,
        characterType: 'player',
        faction: 'player',
        hpMax: 100,
        hpCurr: 80,
        damageTaken: 0,
        mpMax: 50,
        mpCurr: 30,
        ac: 16,
        skills: ['Скрытность', 'Атлетика'],
        characteristics: { strength: 16, dexterity: 14, constitution: 15, intelligence: 10, wisdom: 12, charisma: 14 },
        attacks: [{ id: 'a1', name: 'Удар мечом', type: 'attack', cooldown: 0, currentCooldown: 0, targetCount: 1, canRemoveStatus: false, effects: [{ id: 'e1', type: 'damage', value: 15 }] }],
        abilities: [{ id: 'ab1', name: 'Второе дыхание', type: 'ability', cooldown: 3, currentCooldown: 0, targetCount: 1, canRemoveStatus: false, effects: [{ id: 'e2', type: 'heal', value: 20 }] }],
        spells: [],
        statuses: [],
        equipment: [],
        isDead: false,
        isUnconscious: false,
      },
      {
        id: '2',
        name: 'Гэндальф',
        initiative: 15,
        characterType: 'player',
        faction: 'player',
        hpMax: 80,
        hpCurr: 70,
        damageTaken: 0,
        mpMax: 100,
        mpCurr: 60,
        ac: 14,
        skills: ['Магия', 'История'],
        characteristics: { strength: 10, dexterity: 12, constitution: 14, intelligence: 18, wisdom: 16, charisma: 15 },
        attacks: [],
        abilities: [{ id: 'ab2', name: 'Посох света', type: 'ability', cooldown: 0, currentCooldown: 0, targetCount: 1, canRemoveStatus: false, effects: [{ id: 'e3', type: 'damage', value: 10 }] }],
        spells: [
          { id: 's1', name: 'Огненный шар', type: 'spell', cooldown: 0, currentCooldown: 0, targetCount: -1, canRemoveStatus: false, effects: [{ id: 'e4', type: 'damage', value: 30 }, { id: 'e5', type: 'addStatus', statusName: 'Горение', statusDuration: 2, statusDurationType: 'rounds' }] },
          { id: 's2', name: 'Щит', type: 'spell', cooldown: 0, currentCooldown: 0, targetCount: 1, canRemoveStatus: false, effects: [{ id: 'e6', type: 'addStatus', statusName: 'Защита', statusDuration: 3, statusDurationType: 'rounds' }] },
        ],
        statuses: [],
        equipment: [],
        isDead: false,
        isUnconscious: false,
      },
      {
        id: '3',
        name: 'Орк-воин',
        initiative: 12,
        characterType: 'npc',
        faction: 'npc',
        hpMax: 60,
        hpCurr: 35,
        damageTaken: 0,
        mpMax: 0,
        mpCurr: 0,
        ac: 13,
        skills: [],
        characteristics: { strength: 14, dexterity: 10, constitution: 16, intelligence: 8, wisdom: 8, charisma: 6 },
        attacks: [{ id: 'a2', name: 'Секира', type: 'attack', cooldown: 0, currentCooldown: 0, targetCount: 1, canRemoveStatus: false, effects: [{ id: 'e7', type: 'damage', value: 12 }] }],
        abilities: [],
        spells: [],
        statuses: [{ id: 'st1', name: 'Раненый', duration: 2, durationType: 'rounds', source: 'manual' }],
        equipment: [],
        isDead: false,
        isUnconscious: false,
      },
      {
        id: '4',
        name: 'Балрог',
        initiative: 20,
        characterType: 'boss',
        faction: 'boss',
        hpMax: null,
        hpCurr: null,
        damageTaken: 50,
        mpMax: 150,
        mpCurr: 100,
        ac: 20,
        skills: [],
        characteristics: { strength: 20, dexterity: 12, constitution: 20, intelligence: 16, wisdom: 14, charisma: 18 },
        attacks: [
          { id: 'a3', name: 'Огненный кнут', type: 'attack', cooldown: 0, currentCooldown: 0, targetCount: 1, canRemoveStatus: false, effects: [{ id: 'e8', type: 'damage', value: 25 }] },
          { id: 'a4', name: 'Пламенный меч', type: 'attack', cooldown: 0, currentCooldown: 0, targetCount: 1, canRemoveStatus: false, effects: [{ id: 'e9', type: 'damage', value: 35 }] },
        ],
        abilities: [{ id: 'ab3', name: 'Ужас', type: 'ability', cooldown: 3, currentCooldown: 0, targetCount: -1, canRemoveStatus: false, effects: [{ id: 'e10', type: 'addStatus', statusName: 'Напуган', statusDuration: 2, statusDurationType: 'rounds' }] }],
        spells: [],
        statuses: [],
        equipment: [],
        isDead: false,
        isUnconscious: false,
      },
    ];

    if (participants.length === 0) {
      setParticipants(demoParticipants);
      addEvent('Начало боя', 'round');
    }
  };

  const addEvent = (message: string, type: EventLogType['type']) => {
    const event: EventLogType = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      message,
      type,
    };
    setEventLog((prev) => [...prev, event]);
  };

  const handleNextTurn = () => {
    const newIndex = (currentTurnIndex + 1) % sortedParticipants.length;
    setCurrentTurnIndex(newIndex);

    if (newIndex === 0) {
      setCurrentRound((prev) => prev + 1);
      addEvent(`Начало раунда ${currentRound + 1}`, 'round');

      setParticipants((prev) => prev.map(p => ({
        ...p,
        statuses: p.statuses
          .map(s =>
            s.durationType === 'rounds' && s.duration > 0
              ? { ...s, duration: s.duration - 1 }
              : s
          )
          .filter(s => s.durationType === 'until_removed' || s.duration > 0),
        attacks: p.attacks.map(a => ({
          ...a,
          currentCooldown: Math.max(0, a.currentCooldown - 1),
        })),
        abilities: p.abilities.map(a => ({
          ...a,
          currentCooldown: Math.max(0, a.currentCooldown - 1),
        })),
        spells: p.spells.map(a => ({
          ...a,
          currentCooldown: Math.max(0, a.currentCooldown - 1),
        })),
      })));
    } else {
      setParticipants((prev) => prev.map(p => {
        const isCurrent = p.id === sortedParticipants[newIndex].id;
        if (isCurrent) {
          return {
            ...p,
            statuses: p.statuses
              .map(s =>
                s.durationType === 'turns' && s.duration > 0
                  ? { ...s, duration: s.duration - 1 }
                  : s
              )
              .filter(s => s.durationType === 'until_removed' || s.duration > 0),
          };
        }
        return p;
      }));
    }

    const currentParticipant = sortedParticipants[newIndex];
    addEvent(`Ход: ${currentParticipant.name}`, 'turn');
  };

  const handlePreviousTurn = () => {
    const newIndex = currentTurnIndex === 0 
      ? sortedParticipants.length - 1 
      : currentTurnIndex - 1;
    setCurrentTurnIndex(newIndex);
    
    const currentParticipant = sortedParticipants[newIndex];
    addEvent(`Возврат к ходу: ${currentParticipant.name}`, 'turn');
  };

  const handleResetCombat = () => {
    if (confirm('Сбросить раунды и ходы? Все временные эффекты будут сняты.')) {
      setCurrentTurnIndex(0);
      setCurrentRound(1);

      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          statuses: p.statuses.filter(s => s.durationType === 'until_removed'),
          attacks: p.attacks.map(a => ({ ...a, currentCooldown: 0 })),
          abilities: p.abilities.map(a => ({ ...a, currentCooldown: 0 })),
          spells: p.spells.map(a => ({ ...a, currentCooldown: 0 })),
        }))
      );

      addEvent('Бой сброшен - все временные эффекты сняты', 'round');
    }
  };

  const handleShortRest = () => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.characterType === 'boss' || !p.hpMax) {
          return {
            ...p,
            mpCurr: Math.min(p.mpMax, p.mpCurr + Math.floor(p.mpMax * (restSettings.shortRest.mpPercent / 100))),
          };
        }
        return {
          ...p,
          hpCurr: Math.min(p.hpMax, (p.hpCurr || 0) + Math.floor(p.hpMax * (restSettings.shortRest.hpPercent / 100))),
          mpCurr: Math.min(p.mpMax, p.mpCurr + Math.floor(p.mpMax * (restSettings.shortRest.mpPercent / 100))),
        };
      })
    );
    addEvent('Короткий отдых завершён', 'rest');
  };

  const handleLongRest = () => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.characterType === 'boss') {
          return {
            ...p,
            mpCurr: Math.floor(p.mpMax * (restSettings.longRest.mpPercent / 100)),
            statuses: p.statuses.filter(s => s.durationType === 'until_removed'),
          };
        }
        return {
          ...p,
          hpCurr: p.hpMax ? Math.floor(p.hpMax * (restSettings.longRest.hpPercent / 100)) : 0,
          mpCurr: Math.floor(p.mpMax * (restSettings.longRest.mpPercent / 100)),
          statuses: p.statuses.filter(s => s.durationType === 'until_removed'),
          isDead: false,
          isUnconscious: false,
          deathSaves: undefined,
        };
      })
    );
    addEvent('Длинный отдых завершён', 'rest');
  };

  const handleAddParticipant = (participant: Participant) => {
    setParticipants((prev) => [...prev, participant]);
    addEvent(`${participant.name} присоединился к бою`, 'turn');
  };

  const handleUpdateParticipant = (updated: Participant) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDeleteParticipant = (id: string) => {
    const participant = participants.find((p) => p.id === id);
    if (participant) {
      setParticipants((prev) => prev.filter((p) => p.id !== id));
      addEvent(`${participant.name} покинул бой`, 'turn');
    }
  };

  const handleQuickDamage = (participantId: string, amount: number) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          const participant = participants.find((pp) => pp.id === participantId);

          if (p.characterType === 'boss') {
            const newDamage = p.damageTaken + amount;
            if (participant) {
              addEvent(`${participant.name} получает ${amount} урона (всего: ${newDamage})`, 'damage');
            }
            return { ...p, damageTaken: newDamage };
          }

          const newHp = Math.max(0, (p.hpCurr || 0) - amount);
          if (participant) {
            addEvent(`${participant.name} получает ${amount} урона`, 'damage');
          }

          const isUnconscious = newHp === 0 && !p.isUnconscious && p.characterType === 'player';
          if (isUnconscious) {
            addEvent(`${participant?.name} теряет сознание!`, 'damage');
            return { ...p, hpCurr: newHp, isUnconscious: true, deathSaves: { successes: 0, failures: 0 } };
          }

          const isDead = newHp === 0 && (p.characterType === 'npc' || p.characterType === 'boss');
          if (isDead && participant) {
            addEvent(`${participant.name} умирает!`, 'death');
            return { ...p, hpCurr: newHp, isDead: true };
          }

          return { ...p, hpCurr: newHp };
        }
        return p;
      })
    );
  };

  const handleQuickHeal = (participantId: string, amount: number) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          if (p.characterType === 'boss' || p.hpMax === null) {
            return p;
          }

          const newHp = Math.min(p.hpMax, (p.hpCurr || 0) + amount);
          const participant = participants.find((pp) => pp.id === participantId);
          if (participant) {
            addEvent(`${participant.name} восстанавливает ${amount} HP`, 'heal');
          }

          const wasUnconscious = p.isUnconscious && newHp > 0;
          if (wasUnconscious) {
            addEvent(`${participant?.name} приходит в сознание!`, 'heal');
            return { ...p, hpCurr: newHp, isUnconscious: false, deathSaves: undefined };
          }

          return { ...p, hpCurr: newHp };
        }
        return p;
      })
    );
  };

  const handleSave = (name: string, description: string) => {
    const save: SaveData = {
      id: Date.now().toString(),
      name,
      description,
      timestamp: Date.now(),
      combatState: {
        participants,
        currentTurnIndex,
        currentRound,
        eventLog,
      },
      restSettings,
    };
    
    const newSaves = [...saves, save];
    setSaves(newSaves);
    localStorage.setItem('ttrpg-saves', JSON.stringify(newSaves));
    addEvent(`Сохранение "${name}" создано`, 'action');
  };

  const handleLoadSave = (save: SaveData) => {
    setParticipants(save.combatState.participants);
    setCurrentTurnIndex(save.combatState.currentTurnIndex);
    setCurrentRound(save.combatState.currentRound);
    setEventLog(save.combatState.eventLog);
    addEvent(`Сохранение "${save.name}" загружено`, 'action');
    setShowSaveManager(false);
  };

  const handleDeleteSave = (id: string) => {
    const newSaves = saves.filter((s) => s.id !== id);
    setSaves(newSaves);
    localStorage.setItem('ttrpg-saves', JSON.stringify(newSaves));
  };

  const handleExportSave = (save: SaveData) => {
    const dataStr = JSON.stringify(save, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${save.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSave = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const save: SaveData = JSON.parse(event.target?.result as string);
            save.id = Date.now().toString();
            const newSaves = [...saves, save];
            setSaves(newSaves);
            localStorage.setItem('ttrpg-saves', JSON.stringify(newSaves));
            addEvent(`Импортировано сохранение "${save.name}"`, 'action');
          } catch (error) {
            console.error('Failed to import save', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleApplyAction = (casterId: string, action: any, targetIds: string[], customValues: Record<string, number>) => {
    const caster = participants.find((p) => p.id === casterId);
    if (!caster) return;

    addEvent(`${caster.name} использует ${action.name}`, 'action');

    setParticipants((prev) =>
      prev.map((p) => {
        if (targetIds.includes(p.id)) {
          let updatedP = { ...p };

          action.effects.forEach((effect: any) => {
            switch (effect.type) {
              case 'damage': {
                const damage = effect.value || 0;
                updatedP.hpCurr = Math.max(0, updatedP.hpCurr - damage);
                addEvent(`${p.name} получает ${damage} урона от ${action.name}`, 'damage');
                
                if (updatedP.hpCurr === 0 && !updatedP.isUnconscious) {
                  updatedP.isUnconscious = true;
                  updatedP.deathSaves = { successes: 0, failures: 0 };
                  addEvent(`${p.name} теряет сознание!`, 'damage');
                }
                break;
              }
              case 'customDamage': {
                const damage = customValues[effect.id] || 0;
                updatedP.hpCurr = Math.max(0, updatedP.hpCurr - damage);
                addEvent(`${p.name} получает ${damage} урона от ${action.name}`, 'damage');
                
                if (updatedP.hpCurr === 0 && !updatedP.isUnconscious) {
                  updatedP.isUnconscious = true;
                  updatedP.deathSaves = { successes: 0, failures: 0 };
                  addEvent(`${p.name} теряет сознание!`, 'damage');
                }
                break;
              }
              case 'heal': {
                const heal = effect.value || 0;
                const oldHp = updatedP.hpCurr;
                updatedP.hpCurr = Math.min(updatedP.hpMax, updatedP.hpCurr + heal);
                addEvent(`${p.name} восстанавливает ${updatedP.hpCurr - oldHp} HP от ${action.name}`, 'heal');
                
                if (updatedP.isUnconscious && updatedP.hpCurr > 0) {
                  updatedP.isUnconscious = false;
                  updatedP.deathSaves = undefined;
                  addEvent(`${p.name} приходит в сознание!`, 'heal');
                }
                break;
              }
              case 'customHeal': {
                const heal = customValues[effect.id] || 0;
                const oldHp = updatedP.hpCurr;
                updatedP.hpCurr = Math.min(updatedP.hpMax, updatedP.hpCurr + heal);
                addEvent(`${p.name} восстанавливает ${updatedP.hpCurr - oldHp} HP от ${action.name}`, 'heal');
                
                if (updatedP.isUnconscious && updatedP.hpCurr > 0) {
                  updatedP.isUnconscious = false;
                  updatedP.deathSaves = undefined;
                  addEvent(`${p.name} приходит в сознание!`, 'heal');
                }
                break;
              }
              case 'restoreMP': {
                const restore = effect.value || 0;
                const oldMp = updatedP.mpCurr;
                updatedP.mpCurr = Math.min(updatedP.mpMax, updatedP.mpCurr + restore);
                addEvent(`${p.name} восстанавливает ${updatedP.mpCurr - oldMp} MP от ${action.name}`, 'heal');
                break;
              }
              case 'addStatus': {
                if (effect.statusName) {
                  const status = {
                    id: Date.now().toString() + Math.random(),
                    name: effect.statusName,
                    duration: effect.statusDuration || 1,
                    durationType: effect.statusDurationType || 'rounds',
                    description: effect.statusDescription,
                  };
                  updatedP.statuses = [...updatedP.statuses, status];
                  addEvent(`${p.name} получает статус "${effect.statusName}"`, 'status');
                }
                break;
              }
              case 'removeStatus': {
                if (effect.statusName) {
                  const removed = updatedP.statuses.filter((s) => 
                    s.name.toLowerCase() === effect.statusName.toLowerCase()
                  );
                  if (removed.length > 0) {
                    updatedP.statuses = updatedP.statuses.filter((s) => 
                      s.name.toLowerCase() !== effect.statusName.toLowerCase()
                    );
                    addEvent(`${p.name} теряет статус "${effect.statusName}"`, 'status');
                  }
                }
                break;
              }
            }
          });

          return updatedP;
        }
        return p;
      })
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b-2 border-primary bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Боевой Дашборд TTRPG</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(true)}
                data-testid="button-add-participant"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave(`Авто-сохранение ${Date.now()}`, '')}
                data-testid="button-quick-save"
              >
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSaveManager(true)}
                data-testid="button-open-saves"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Загрузить
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-4 h-full">
          <div className="grid grid-cols-12 gap-4 h-full">
            <div className="col-span-3 space-y-4 overflow-y-auto">
              <InitiativeTracker
                participants={sortedParticipants}
                currentTurnIndex={currentTurnIndex}
              />
              <CombatControls
                currentRound={currentRound}
                currentTurnIndex={currentTurnIndex}
                totalParticipants={sortedParticipants.length}
                onPreviousTurn={handlePreviousTurn}
                onNextTurn={handleNextTurn}
                onResetCombat={handleResetCombat}
                onShortRest={handleShortRest}
                onLongRest={handleLongRest}
                onViewHistory={() => console.log('View history')}
              />
            </div>

            <div className="col-span-6 overflow-y-auto">
              <div className="space-y-4">
                {sortedParticipants.map((participant, index) => (
                  <ParticipantRow
                    key={participant.id}
                    participant={participant}
                    index={index}
                    isActive={currentTurnIndex === index}
                    allParticipants={sortedParticipants}
                    onUpdate={handleUpdateParticipant}
                    onDelete={() => handleDeleteParticipant(participant.id)}
                    onQuickDamage={(amount) => handleQuickDamage(participant.id, amount)}
                    onQuickHeal={(amount) => handleQuickHeal(participant.id, amount)}
                    onApplyAction={(action, targetIds, customValues) => handleApplyAction(participant.id, action, targetIds, customValues)}
                  />
                ))}
              </div>
            </div>

            <div className="col-span-3">
              <EventLog events={eventLog} onClear={() => setEventLog([])} />
            </div>
          </div>
        </div>
      </div>

      <AddParticipantDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddParticipant}
      />

      <SaveManager
        open={showSaveManager}
        onOpenChange={setShowSaveManager}
        saves={saves}
        onLoad={handleLoadSave}
        onDelete={handleDeleteSave}
        onSave={handleSave}
        onExport={handleExportSave}
        onImport={handleImportSave}
      />
    </div>
  );
}
