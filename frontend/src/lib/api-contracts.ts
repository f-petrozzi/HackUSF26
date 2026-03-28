import type { PersonaType, RunStatus, RiskLevel, SignalType } from "@/lib/types";

export interface TokenResponseDto {
  access_token: string;
  token_type: "bearer";
  user_id: number;
  role: "member" | "admin";
}

export interface AuthMeDto {
  id: number;
  email: string;
  role: "member" | "admin";
  has_profile: boolean;
}

export interface ProfileDto {
  id: number;
  user_id: number;
  age_range: string;
  sex: string;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string;
  activity_level: string;
  dietary_style: string;
  allergies: string[];
  persona_type: PersonaType;
  created_at: string;
}

export interface AccessibilityDto {
  user_id: number;
  simplified_language: boolean;
  large_text: boolean;
  low_energy_mode: boolean;
}

export interface WearableEventDto {
  id: number;
  user_id: number;
  source: string;
  signal_type: SignalType;
  value: string;
  unit: string;
  recorded_at: string;
}

export interface NormalizedEventDto {
  id: number;
  user_id: number;
  signals: Record<string, unknown>;
  summary: string;
  created_at: string;
}

export interface AgentRunDto {
  id: number;
  user_id: number;
  normalized_event_id: number | null;
  status: RunStatus;
  started_at: string;
  completed_at: string | null;
  risk_level: RiskLevel | "";
}

export interface AgentMessageDto {
  id: number;
  run_id: number;
  agent_name: string;
  agent_type: "local" | "a2a" | "parallel" | "loop";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  iteration: number;
  duration_ms: number | null;
  created_at: string;
}

export interface RunTraceDto {
  run: AgentRunDto;
  messages: AgentMessageDto[];
}

export interface CaseDto {
  id: number;
  user_id: number;
  run_id: number | null;
  risk_level: RiskLevel;
  status: "open" | "in_progress" | "closed";
  created_at: string;
  updated_at: string;
}

export interface InterventionDto {
  id: number;
  run_id: number | null;
  user_id: number;
  meal_suggestion: string;
  activity_suggestion: string;
  wellness_action: string;
  empathy_message: string;
  created_at: string;
}

export interface NotificationDto {
  id: number;
  user_id: number;
  type: string;
  content: string;
  status: string;
  created_at: string;
}

export interface ResourceDto {
  id: number;
  persona_type: PersonaType;
  category: string;
  title: string;
  description: string;
  url: string;
}

export interface ScenarioDto {
  id: string;
  name: string;
  description: string;
  persona_type: PersonaType;
}

export interface HealthOverviewDto {
  latest_date: string | null;
  steps: number;
  step_goal: number;
  active_calories: number;
  total_calories: number;
  resting_hr: number;
  avg_hr: number;
  body_battery_high: number;
  body_battery_low: number;
  stress_avg: number;
  active_minutes: number;
  sleep_hours: number;
  sleep_score: number;
  garmin_connected: boolean;
}

export interface RecipeIngredientDto {
  name: string;
  quantity: string;
  category: string;
  section: string;
}

export interface RecipeDto {
  id: number;
  user_id: number;
  title: string;
  description: string;
  source_url: string;
  our_way_notes: string;
  prep_minutes: number;
  cook_minutes: number;
  servings: number;
  tags: string[];
  ingredients: RecipeIngredientDto[];
  instructions: string;
  photo_filename: string;
  created_at: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
}

export interface OnboardingRequestDto {
  age_range: string;
  sex: string;
  height_cm?: number;
  weight_kg?: number;
  goal: string;
  activity_level: string;
  dietary_style: string;
  allergies: string[];
  persona_type: PersonaType;
  simplified_language: boolean;
  large_text: boolean;
  low_energy_mode: boolean;
}

export interface CheckInSubmission {
  mood: number;
  sleep_hours: number;
  stress: number;
  note: string;
}
