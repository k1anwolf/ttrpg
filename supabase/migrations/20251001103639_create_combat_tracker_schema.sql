/*
  # TTRPG Combat Tracker Database Schema

  ## Overview
  Creates comprehensive database structure for a TTRPG combat tracker with advanced features including:
  - Character types (player, NPC, boss)
  - Equipment system with stat bonuses
  - Boss damage tracking instead of HP
  - Tick-based cooldown and effect mechanics
  - Death save system for players
  - Target selection and hit check system

  ## Tables Created

  ### 1. combat_sessions
  Stores combat session information
  - id: Unique identifier
  - name: Session name
  - description: Optional description
  - current_turn_index: Index of current turn
  - current_round: Current round number
  - created_at: Creation timestamp
  - updated_at: Last update timestamp

  ### 2. participants
  Stores combat participants (players, NPCs, bosses)
  - id: Unique identifier
  - combat_session_id: Foreign key to combat_sessions
  - name: Character name
  - initiative: Initiative roll value
  - character_type: player/npc/boss
  - hp_max: Maximum HP (null for bosses)
  - hp_curr: Current HP (null for bosses)
  - damage_taken: Total damage taken (for bosses)
  - mp_max: Maximum MP
  - mp_curr: Current MP
  - ac: Armor Class
  - characteristics: JSONB storing STR, DEX, CON, INT, WIS, CHA
  - death_saves_successes: Death save successes (players only)
  - death_saves_failures: Death save failures (players only)
  - is_dead: Whether character is dead
  - is_unconscious: Whether character is unconscious
  - created_at: Creation timestamp

  ### 3. actions
  Stores actions (attacks, abilities, spells)
  - id: Unique identifier
  - participant_id: Foreign key to participants
  - name: Action name
  - action_type: attack/ability/spell
  - cooldown_max: Maximum cooldown in ticks
  - cooldown_curr: Current cooldown remaining
  - description: Optional description
  - target_count: Number of targets (1 = single, -1 = AoE)
  - can_remove_status: Whether this action can remove statuses
  - status_to_remove: ID of status this action removes

  ### 4. action_effects
  Stores effects for each action
  - id: Unique identifier
  - action_id: Foreign key to actions
  - effect_type: Type of effect (damage, heal, addStatus, etc.)
  - value: Numeric value for effect
  - status_name: Name of status to apply
  - status_duration: Duration in ticks
  - status_duration_type: rounds/turns/until_removed
  - status_description: Description of status

  ### 5. statuses
  Stores active statuses on participants
  - id: Unique identifier
  - participant_id: Foreign key to participants
  - name: Status name
  - duration: Duration in ticks
  - duration_type: rounds/turns/until_removed
  - description: Optional description
  - source: Source of status (equipment/action/manual)
  - created_at: Creation timestamp

  ### 6. equipment
  Stores equipment items
  - id: Unique identifier
  - participant_id: Foreign key to participants
  - name: Equipment name
  - slot: Equipment slot (weapon, armor, accessory, etc.)
  - description: Optional description
  - stat_bonuses: JSONB storing stat modifications
  - is_equipped: Whether currently equipped

  ### 7. event_logs
  Stores combat event log
  - id: Unique identifier
  - combat_session_id: Foreign key to combat_sessions
  - timestamp: Event timestamp
  - message: Log message
  - event_type: Type of event
  - created_at: Creation timestamp

  ### 8. action_applications
  Stores history of action applications with target selection
  - id: Unique identifier
  - combat_session_id: Foreign key to combat_sessions
  - action_id: Foreign key to actions
  - source_participant_id: Who used the action
  - is_aoe: Whether this was an AoE application
  - timestamp: When action was used

  ### 9. action_targets
  Stores individual targets and hit results for each action application
  - id: Unique identifier
  - action_application_id: Foreign key to action_applications
  - target_participant_id: Target of the action
  - hit_result: success/failure/critical_success/critical_failure
  - created_at: Creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies allow authenticated users to manage their own sessions
*/

-- Create enum types
CREATE TYPE character_type AS ENUM ('player', 'npc', 'boss');
CREATE TYPE action_type AS ENUM ('attack', 'ability', 'spell');
CREATE TYPE effect_type AS ENUM ('damage', 'heal', 'restoreMP', 'addStatus', 'removeStatus', 'customDamage', 'customHeal');
CREATE TYPE duration_type AS ENUM ('rounds', 'turns', 'until_removed');
CREATE TYPE hit_result_type AS ENUM ('success', 'failure', 'critical_success', 'critical_failure');
CREATE TYPE event_type AS ENUM ('damage', 'heal', 'status', 'turn', 'round', 'action', 'rest', 'death', 'resurrect');

-- Combat Sessions table
CREATE TABLE IF NOT EXISTS combat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  current_turn_index integer DEFAULT 0,
  current_round integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  combat_session_id uuid REFERENCES combat_sessions(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  initiative integer NOT NULL,
  character_type character_type NOT NULL DEFAULT 'npc',
  hp_max integer,
  hp_curr integer,
  damage_taken integer DEFAULT 0,
  mp_max integer DEFAULT 0,
  mp_curr integer DEFAULT 0,
  ac integer DEFAULT 10,
  characteristics jsonb DEFAULT '{"strength": 10, "dexterity": 10, "constitution": 10, "intelligence": 10, "wisdom": 10, "charisma": 10}'::jsonb,
  death_saves_successes integer DEFAULT 0,
  death_saves_failures integer DEFAULT 0,
  is_dead boolean DEFAULT false,
  is_unconscious boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Actions table
CREATE TABLE IF NOT EXISTS actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  action_type action_type NOT NULL,
  cooldown_max integer DEFAULT 0,
  cooldown_curr integer DEFAULT 0,
  description text,
  target_count integer DEFAULT 1,
  can_remove_status boolean DEFAULT false,
  status_to_remove uuid,
  created_at timestamptz DEFAULT now()
);

-- Action Effects table
CREATE TABLE IF NOT EXISTS action_effects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid REFERENCES actions(id) ON DELETE CASCADE NOT NULL,
  effect_type effect_type NOT NULL,
  value integer,
  status_name text,
  status_duration integer,
  status_duration_type duration_type,
  status_description text,
  created_at timestamptz DEFAULT now()
);

-- Statuses table
CREATE TABLE IF NOT EXISTS statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  duration integer NOT NULL,
  duration_type duration_type NOT NULL,
  description text,
  source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slot text NOT NULL,
  description text,
  stat_bonuses jsonb DEFAULT '{}'::jsonb,
  is_equipped boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Event Logs table
CREATE TABLE IF NOT EXISTS event_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  combat_session_id uuid REFERENCES combat_sessions(id) ON DELETE CASCADE NOT NULL,
  timestamp bigint NOT NULL,
  message text NOT NULL,
  event_type event_type NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Action Applications table
CREATE TABLE IF NOT EXISTS action_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  combat_session_id uuid REFERENCES combat_sessions(id) ON DELETE CASCADE NOT NULL,
  action_id uuid REFERENCES actions(id) ON DELETE SET NULL,
  source_participant_id uuid REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  is_aoe boolean DEFAULT false,
  timestamp bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Action Targets table
CREATE TABLE IF NOT EXISTS action_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_application_id uuid REFERENCES action_applications(id) ON DELETE CASCADE NOT NULL,
  target_participant_id uuid REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  hit_result hit_result_type NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE combat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for combat_sessions
CREATE POLICY "Users can view own combat sessions"
  ON combat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own combat sessions"
  ON combat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own combat sessions"
  ON combat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own combat sessions"
  ON combat_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for participants
CREATE POLICY "Users can view participants in own sessions"
  ON participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM combat_sessions
      WHERE combat_sessions.id = participants.combat_session_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create participants in own sessions"
  ON participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM combat_sessions
      WHERE combat_sessions.id = participants.combat_session_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update participants in own sessions"
  ON participants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM combat_sessions
      WHERE combat_sessions.id = participants.combat_session_id
      AND combat_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM combat_sessions
      WHERE combat_sessions.id = participants.combat_session_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete participants in own sessions"
  ON participants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM combat_sessions
      WHERE combat_sessions.id = participants.combat_session_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

-- RLS Policies for actions
CREATE POLICY "Users can view actions in own sessions"
  ON actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      JOIN combat_sessions ON participants.combat_session_id = combat_sessions.id
      WHERE participants.id = actions.participant_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create actions in own sessions"
  ON actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants
      JOIN combat_sessions ON participants.combat_session_id = combat_sessions.id
      WHERE participants.id = actions.participant_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update actions in own sessions"
  ON actions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      JOIN combat_sessions ON participants.combat_session_id = combat_sessions.id
      WHERE participants.id = actions.participant_id
      AND combat_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants
      JOIN combat_sessions ON participants.combat_session_id = combat_sessions.id
      WHERE participants.id = actions.participant_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete actions in own sessions"
  ON actions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      JOIN combat_sessions ON participants.combat_session_id = combat_sessions.id
      WHERE participants.id = actions.participant_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

-- Similar RLS policies for other tables (action_effects, statuses, equipment, event_logs, action_applications, action_targets)
CREATE POLICY "Users can manage action_effects"
  ON action_effects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM actions
      JOIN participants ON actions.participant_id = participants.id
      JOIN combat_sessions ON participants.combat_session_id = combat_sessions.id
      WHERE actions.id = action_effects.action_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage statuses"
  ON statuses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      JOIN combat_sessions ON participants.combat_session_id = combat_sessions.id
      WHERE participants.id = statuses.participant_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage equipment"
  ON equipment FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      JOIN combat_sessions ON participants.combat_session_id = combat_sessions.id
      WHERE participants.id = equipment.participant_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage event_logs"
  ON event_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM combat_sessions
      WHERE combat_sessions.id = event_logs.combat_session_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage action_applications"
  ON action_applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM combat_sessions
      WHERE combat_sessions.id = action_applications.combat_session_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage action_targets"
  ON action_targets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM action_applications
      JOIN combat_sessions ON action_applications.combat_session_id = combat_sessions.id
      WHERE action_applications.id = action_targets.action_application_id
      AND combat_sessions.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_session ON participants(combat_session_id);
CREATE INDEX IF NOT EXISTS idx_actions_participant ON actions(participant_id);
CREATE INDEX IF NOT EXISTS idx_action_effects_action ON action_effects(action_id);
CREATE INDEX IF NOT EXISTS idx_statuses_participant ON statuses(participant_id);
CREATE INDEX IF NOT EXISTS idx_equipment_participant ON equipment(participant_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_session ON event_logs(combat_session_id);
CREATE INDEX IF NOT EXISTS idx_action_applications_session ON action_applications(combat_session_id);
CREATE INDEX IF NOT EXISTS idx_action_targets_application ON action_targets(action_application_id);
