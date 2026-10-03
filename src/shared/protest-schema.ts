import { INCIDENT_TYPES, SESSION_TYPES, OUTCOMES, OUTCOME_CONFLICTS } from "./protest-options";

export const FIELD_RULES = Object.freeze({
  incidentType: { required: true, requiredMessage: "请选择违规类型。" },
  protestedDriverName: { required: true, maxLength: 100, requiredMessage: "请填写被投诉车手的名称。" },
  sessionType: { required: false },
  lapOrTime: { required: false, maxLength: 80 },
  trackLocation: { required: false, maxLength: 120 },
  otherCarNumber: { required: false, maxLength: 32 },
  observedAction: { required: true, maxLength: 1000, requiredMessage: "请简单描述事件经过。" },
  userAction: { required: false, maxLength: 800 },
  outcomes: { required: false },
  additionalContext: { required: false, maxLength: 1200 },
} as const);

const incidentValues = new Set(INCIDENT_TYPES.map(({ value }) => value));
const sessionValues = new Set(SESSION_TYPES.map(({ value }) => value));
const outcomeValues = new Set(OUTCOMES.map(({ value }) => value));
const stringFields = Object.entries(FIELD_RULES)
  .filter(([field]) => !["incidentType", "sessionType", "outcomes"].includes(field));

export type ProtestPayload = {
  incidentType: string;
  protestedDriverName: string;
  sessionType: string;
  lapOrTime: string;
  trackLocation: string;
  otherCarNumber: string;
  observedAction: string;
  userAction: string;
  outcomes: string[];
  additionalContext: string;
};
export type FieldName = keyof ProtestPayload;
export type FieldError = { code: string; maxLength?: number };

function emptyValue(): ProtestPayload {
  return {
    incidentType: "",
    protestedDriverName: "",
    sessionType: "",
    lapOrTime: "",
    trackLocation: "",
    otherCarNumber: "",
    observedAction: "",
    userAction: "",
    outcomes: [],
    additionalContext: "",
  };
}

function conflicts(values: string[]) {
  return OUTCOME_CONFLICTS.some((pair) => pair.every((value) => values.includes(value)));
}

export function validateProtestPayload(payload: unknown) {
  const value = emptyValue();
  const errors: Partial<Record<FieldName, FieldError>> = {};

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    for (const [field, rule] of Object.entries(FIELD_RULES)) {
      if (rule.required) errors[field as FieldName] = { code: "required" };
    }
    return { fields: Object.keys(errors) as FieldName[], errors, value };
  }

  const input = payload as Record<string, unknown>;

  if (typeof input.incidentType !== "string" || !incidentValues.has(input.incidentType)) {
    errors.incidentType = { code: input.incidentType ? "invalid_choice" : "required" };
  } else {
    value.incidentType = input.incidentType;
  }

  if (input.sessionType === undefined || input.sessionType === null || input.sessionType === "") {
    value.sessionType = "";
  } else if (typeof input.sessionType !== "string" || !sessionValues.has(input.sessionType)) {
    errors.sessionType = { code: "invalid_choice" };
  } else {
    value.sessionType = input.sessionType;
  }

  for (const [field, rule] of stringFields) {
    const raw = input[field];
    if (raw === undefined || raw === null) {
      if (rule.required) errors[field as FieldName] = { code: "required" };
      continue;
    }
    if (typeof raw !== "string") {
      errors[field as FieldName] = { code: "invalid_type" };
      continue;
    }

    const normalized = raw.trim();
    value[field as keyof Omit<ProtestPayload, "outcomes">] = normalized;
    if (rule.required && !normalized) {
      errors[field as FieldName] = { code: "required" };
    } else if ("maxLength" in rule && normalized.length > rule.maxLength) {
      errors[field as FieldName] = { code: "too_long", maxLength: rule.maxLength };
    }
  }

  const outcomes = input.outcomes;
  if (outcomes === undefined || outcomes === null) {
    value.outcomes = [];
  } else if (
    !Array.isArray(outcomes) ||
    outcomes.length > OUTCOMES.length ||
    outcomes.some((item) => typeof item !== "string" || !outcomeValues.has(item)) ||
    new Set(outcomes).size !== outcomes.length ||
    conflicts(outcomes as string[])
  ) {
    errors.outcomes = { code: "invalid_outcomes" };
  } else {
    value.outcomes = outcomes as string[];
  }

  if (value.outcomes.includes("other") && !value.additionalContext) {
    errors.additionalContext = { code: "other_requires_context" };
  }

  return { fields: Object.keys(errors) as FieldName[], errors, value };
}
