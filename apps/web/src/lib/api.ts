import axios from "axios";

import { apiClient, clearStoredSession, getStoredUser, setStoredUser } from "@/lib/api-client";
import type {
  AgentRunDto,
  AuthMeDto,
  CheckInSubmission,
  HealthOverviewDto,
  InterventionDto,
  OnboardingRequestDto,
  ProfileDto,
  RecipeDto,
  RunTraceDto,
  ScenarioDto,
  WearableEventDto,
  CaseDto,
} from "@/lib/api-contracts";
import {
  mapCase,
  mapHealthOverviewToSummary,
  mapInterventionToSupportPlan,
  mapRecipe,
  mapRunTrace,
  mapScenario,
  mapUserFromBackend,
  mapWearableEventToSignal,
} from "@/lib/api-mappers";
import { appConfig } from "@/lib/config";
import {
  mockAdmin,
  mockAgentRun,
  mockCases,
  mockHealthSummary,
  mockRecipes,
  mockScenarios,
  mockSignals,
  mockSupportPlan,
  mockUser,
} from "@/lib/mock-data";
import type { AgentRun, Case, HealthSummary, Recipe, Scenario, Signal, SupportPlan, User } from "@/lib/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

async function fetchSessionUser(fallbackName?: string): Promise<User> {
  const { data: me } = await apiClient.get<AuthMeDto>("/api/auth/me");

  let profile: ProfileDto | null = null;
  try {
    const response = await apiClient.get<ProfileDto>("/api/profile");
    profile = response.data;
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }

  const user = mapUserFromBackend(me, profile, fallbackName || getStoredUser()?.full_name);
  setStoredUser(user);
  return user;
}

export async function refreshSessionUser(fallbackName?: string): Promise<User> {
  return fetchSessionUser(fallbackName);
}

function mapRunRecord(run: AgentRunDto): AgentRun {
  return {
    id: String(run.id),
    user_id: String(run.user_id),
    status: run.status,
    started_at: run.started_at,
    completed_at: run.completed_at || undefined,
    risk_level: run.risk_level || undefined,
    messages: [],
  };
}

async function submitOnboardingLive(data: OnboardingRequestDto): Promise<User> {
  await apiClient.post<ProfileDto>("/api/onboarding", data);
  return fetchSessionUser();
}

async function getRecentSignalsLive(): Promise<Signal[]> {
  const { data } = await apiClient.get<WearableEventDto[]>("/api/events/recent");
  return data.map(mapWearableEventToSignal);
}

async function getSupportPlanLive(): Promise<SupportPlan> {
  const [{ data: interventions }, { data: runs }] = await Promise.all([
    apiClient.get<InterventionDto[]>("/api/interventions"),
    apiClient.get<AgentRunDto[]>("/api/runs"),
  ]);

  const latestIntervention = interventions[0];
  if (!latestIntervention) {
    return {
      meal: { title: "Meal Suggestion", description: "Run a scenario or submit a check-in to generate recommendations.", priority: "medium" },
      activity: { title: "Activity Suggestion", description: "Your next support plan will appear here.", priority: "medium" },
      wellness: { title: "Wellness Action", description: "CareMesh will add an empathy-first action here once a run completes.", priority: "high" },
      empathy_message: "Your support plan will appear here after the first completed run.",
      risk_level: "low",
    };
  }

  const matchingRun = runs.find((run) => run.id === latestIntervention.run_id);
  const riskLevel = matchingRun?.risk_level || "low";
  return mapInterventionToSupportPlan(latestIntervention, riskLevel || "low");
}

async function getCasesLive(): Promise<Case[]> {
  const { data } = await apiClient.get<CaseDto[]>("/api/cases");
  return data.map(mapCase);
}

async function triggerScenarioLive(scenarioId: string): Promise<AgentRun> {
  const { data } = await apiClient.post<{ run_id: number }>(`/api/scenarios/${scenarioId}/run`);
  return getAgentRunLive(String(data.run_id));
}

async function getRunsLive(): Promise<AgentRun[]> {
  const { data } = await apiClient.get<AgentRunDto[]>("/api/runs");
  return data.map(mapRunRecord);
}

async function getAgentRunLive(runId: string): Promise<AgentRun> {
  const { data } = await apiClient.get<RunTraceDto>(`/api/runs/${runId}`);
  return mapRunTrace(data);
}

async function getHealthSummaryLive(): Promise<HealthSummary> {
  const { data } = await apiClient.get<HealthOverviewDto>("/api/health/overview");
  return mapHealthOverviewToSummary(data);
}

async function getRecipesLive(): Promise<Recipe[]> {
  const { data } = await apiClient.get<RecipeDto[]>("/api/recipes");
  return data.map(mapRecipe);
}

async function getRecipeLive(id: string): Promise<Recipe> {
  const { data } = await apiClient.get<RecipeDto>(`/api/recipes/${id}`);
  return mapRecipe(data);
}

async function getScenariosLive(): Promise<Scenario[]> {
  const { data } = await apiClient.get<ScenarioDto[]>("/api/scenarios");
  return data.map(mapScenario);
}

async function submitCheckInLive(data: CheckInSubmission): Promise<AgentRun> {
  await Promise.all([
    apiClient.post("/api/events/ingest", {
      signal_type: "sleep_hours",
      value: String(data.sleep_hours),
      unit: "hours",
      source: "manual",
    }),
    apiClient.post("/api/events/ingest", {
      signal_type: "stress_level",
      value: String(Math.round(data.stress / 10)),
      unit: "1-10",
      source: "manual",
    }),
    apiClient.post("/api/events/ingest", {
      signal_type: "check_in_mood",
      value: String(data.mood),
      unit: "1-10",
      source: "manual",
    }),
    data.note.trim()
      ? apiClient.post("/api/events/ingest", {
          signal_type: "check_in_note",
          value: data.note.trim(),
          unit: "",
          source: "manual",
        })
      : Promise.resolve(),
  ]);

  const { data: run } = await apiClient.post<AgentRunDto>("/api/runs/trigger", {});
  return mapRunRecord(run);
}

async function submitOnboardingMock(data: OnboardingRequestDto): Promise<User> {
  await delay(500);
  const user = getStoredUser() ?? mockUser;
  const updated = { ...user, persona: data.persona_type, onboarded: true };
  setStoredUser(updated);
  return updated;
}

async function getRecentSignalsMock(): Promise<Signal[]> {
  await delay(300);
  return mockSignals;
}

async function getSupportPlanMock(): Promise<SupportPlan> {
  await delay(400);
  return mockSupportPlan;
}

async function getCasesMock(): Promise<Case[]> {
  await delay(400);
  return mockCases;
}

async function triggerScenarioMock(scenarioId: string): Promise<AgentRun> {
  await delay(1500);
  return { ...mockAgentRun, id: `r-${Date.now()}`, scenario: scenarioId, status: "running" };
}

async function getRunsMock(): Promise<AgentRun[]> {
  await delay(250);
  return [mockAgentRun];
}

async function getAgentRunMock(_runId: string): Promise<AgentRun> {
  await delay(300);
  return mockAgentRun;
}

async function getHealthSummaryMock(): Promise<HealthSummary> {
  await delay(400);
  return mockHealthSummary;
}

async function getRecipesMock(): Promise<Recipe[]> {
  await delay(300);
  return mockRecipes;
}

async function getRecipeMock(id: string): Promise<Recipe> {
  await delay(200);
  return mockRecipes.find((recipe) => recipe.id === id) || mockRecipes[0];
}

async function getScenariosMock(): Promise<Scenario[]> {
  await delay(200);
  return mockScenarios;
}

async function submitCheckInMock(): Promise<AgentRun> {
  await delay(1000);
  return { ...mockAgentRun, id: `r-${Date.now()}`, status: "running" };
}

export function isMockApiEnabled() {
  return appConfig.useMockApi;
}

export { getStoredUser };

export function logout() {
  clearStoredSession();
}

export async function submitOnboarding(data: OnboardingRequestDto): Promise<User> {
  return appConfig.useMockApi ? submitOnboardingMock(data) : submitOnboardingLive(data);
}

export async function getRecentSignals(): Promise<Signal[]> {
  return appConfig.useMockApi ? getRecentSignalsMock() : getRecentSignalsLive();
}

export async function getSupportPlan(): Promise<SupportPlan> {
  return appConfig.useMockApi ? getSupportPlanMock() : getSupportPlanLive();
}

export async function getCases(): Promise<Case[]> {
  return appConfig.useMockApi ? getCasesMock() : getCasesLive();
}

export async function triggerScenario(scenarioId: string): Promise<AgentRun> {
  return appConfig.useMockApi ? triggerScenarioMock(scenarioId) : triggerScenarioLive(scenarioId);
}

export async function getRuns(): Promise<AgentRun[]> {
  return appConfig.useMockApi ? getRunsMock() : getRunsLive();
}

export async function getAgentRun(runId: string): Promise<AgentRun> {
  return appConfig.useMockApi ? getAgentRunMock(runId) : getAgentRunLive(runId);
}

export async function getHealthSummary(): Promise<HealthSummary> {
  return appConfig.useMockApi ? getHealthSummaryMock() : getHealthSummaryLive();
}

export async function getRecipes(): Promise<Recipe[]> {
  return appConfig.useMockApi ? getRecipesMock() : getRecipesLive();
}

export async function getRecipe(id: string): Promise<Recipe> {
  return appConfig.useMockApi ? getRecipeMock(id) : getRecipeLive(id);
}

export async function getScenarios(): Promise<Scenario[]> {
  return appConfig.useMockApi ? getScenariosMock() : getScenariosLive();
}

export async function submitCheckIn(data: CheckInSubmission): Promise<AgentRun> {
  return appConfig.useMockApi ? submitCheckInMock() : submitCheckInLive(data);
}
