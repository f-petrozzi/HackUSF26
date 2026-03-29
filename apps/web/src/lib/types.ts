export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type CaseStatus = "open" | "in_progress" | "closed";
export type PersonaType = "student" | "caregiver" | "older_adult" | "accessibility_focused";
export type UserRole = "member" | "admin";
export type RunStatus = "pending" | "running" | "completed" | "failed";
export type SignalType =
  | "sleep_hours"
  | "sleep_quality"
  | "stress_level"
  | "heart_rate"
  | "steps"
  | "activity_level"
  | "check_in_mood"
  | "check_in_note";
export type AgentName =
  | "coordinator"
  | "signal_interpretation"
  | "risk_stratification"
  | "intervention_planning"
  | "empathy_checkin"
  | "validation_loop"
  | "student_support"
  | "caregiver_burnout"
  | "unknown";
export type AgentType = "local" | "a2a" | "parallel" | "loop";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  persona?: PersonaType;
  onboarded: boolean;
}

export interface Signal {
  id: string;
  user_id: string;
  signal_type: SignalType;
  value: string;
  unit: string;
  recorded_at: string;
}

export interface SupportPlan {
  meal: InterventionCard;
  activity: InterventionCard;
  wellness: InterventionCard;
  empathy_message: string;
  risk_level: RiskLevel;
  confidence?: number;
}

export interface InterventionCard {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

export interface Case {
  id: string;
  user_id: string;
  user_name?: string;
  persona?: PersonaType;
  risk_level: RiskLevel;
  status: CaseStatus;
  summary: string;
  created_at: string;
  updated_at: string;
}

export interface AgentMessage {
  id: string;
  run_id: string;
  agent_name: AgentName | string;
  agent_type: AgentType;
  content: string;
  timestamp: string;
  parent_id?: string;
  is_a2a?: boolean;
  loop_iteration?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface AgentRun {
  id: string;
  user_id: string;
  scenario?: string;
  status: RunStatus;
  started_at: string;
  completed_at?: string;
  risk_level?: RiskLevel;
  messages: AgentMessage[];
}

export interface HealthSummary {
  steps: { current: number; goal: number; trend: number };
  sleep: { hours: number; quality: string; trend: number };
  heart_rate: { current: number; resting: number; trend: number };
  stress: { level: number; trend: number };
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  tags: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: { group: string; items: string[] }[];
  instructions: { group: string; steps: string[] }[];
  image_url?: string;
}

export interface Scenario {
  id: string;
  label: string;
  description: string;
  persona: PersonaType;
}
