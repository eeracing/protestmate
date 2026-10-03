import { OUTCOMES, SESSION_TYPES } from "../../shared/protest-options";
import type { ProtestPayload } from "../../shared/protest-schema";
import { SYSTEM_PROMPT } from "./prompt";
import { runAiWithFallback, type AiInput } from "./provider";
import type { Env } from "../env";

const sessionLabels = new Map(SESSION_TYPES.map(({ value, aiLabel }) => [value, aiLabel]));
const outcomeLabels = new Map(OUTCOMES.map(({ value, aiLabel }) => [value, aiLabel]));

function buildMessages(data: ProtestPayload): AiInput["messages"] {
  const incidentData: Record<string, string | string[] | undefined> = {
    protested_driver_name: data.protestedDriverName,
    protested_driver_action: data.observedAction,
  };

  if (data.sessionType) incidentData.session_type = sessionLabels.get(data.sessionType);
  if (data.lapOrTime) incidentData.incident_time = data.lapOrTime;
  if (data.trackLocation) incidentData.track_location = data.trackLocation;
  if (data.otherCarNumber) incidentData.protested_driver_car_number = data.otherCarNumber;
  if (data.userAction) incidentData.my_action = data.userAction;
  if (data.outcomes.length) incidentData.outcomes = data.outcomes.map((item) => outcomeLabels.get(item) ?? item);
  if (data.additionalContext) incidentData.additional_context = data.additionalContext;

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: JSON.stringify(incidentData) },
  ];
}

export function buildAiInput(data: ProtestPayload): AiInput {
  return {
    messages: buildMessages(data),
    temperature: 0,
    max_tokens: 3000,
    stream: false,
  };
}

export async function generateDescription(data: ProtestPayload, env: Env) {
  return runAiWithFallback(env, buildAiInput(data), data.protestedDriverName, data.otherCarNumber);
}
