import { FIELD_RULES, validateProtestPayload, type ProtestPayload, type FieldName, type FieldError } from "../../shared/protest-schema";
import { INCIDENT_TYPES, OUTCOMES, OUTCOME_CONFLICTS, SESSION_TYPES } from "../../shared/protest-options";
import { createFormErrors } from "../ui/errors";
import { requestDescription } from "./generate-api";

type FormElements = HTMLFormControlsCollection & {
  incidentType: HTMLSelectElement; sessionType: HTMLSelectElement;
} & Record<Exclude<FieldName, "outcomes" | "incidentType" | "sessionType">, HTMLInputElement | HTMLTextAreaElement>;
type ProtestForm = HTMLFormElement & { elements: FormElements };
type FormView = { form: HTMLFormElement; submitButton: HTMLButtonElement; statusError: HTMLElement; resultCard: HTMLElement; resultText: HTMLElement; translationText: HTMLElement; copyButton: HTMLButtonElement; skipDetailsButton: HTMLButtonElement };


function appendOptions(select: HTMLSelectElement, options: readonly { value: string; uiLabel: string }[]) {
  const placeholder = new Option("请选择", "");
  select.replaceChildren(placeholder, ...options.map(({ value, uiLabel }) => new Option(uiLabel, value)));
}

function configureForm(form: ProtestForm) {
  appendOptions(form.elements.incidentType, INCIDENT_TYPES);
  appendOptions(form.elements.sessionType, SESSION_TYPES);

  const checks = form.querySelector(".checks");
  if (!checks) throw new Error("Missing outcomes container");
  checks.replaceChildren(...OUTCOMES.map(({ value, uiLabel }) => {
    const label = document.createElement("label");
    label.className = "check";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "outcomes";
    input.value = value;
    const text = document.createElement("span");
    text.textContent = uiLabel;
    label.append(input, text);
    return label;
  }));

  for (const [field, rule] of Object.entries(FIELD_RULES)) {
    const input = form.elements[field as Exclude<FieldName, "outcomes">];
    if (!input || field === "outcomes") continue;
    input.required = rule.required;
    if ("maxLength" in rule && "maxLength" in input) input.maxLength = rule.maxLength;
  }
}

function collectPayload(form: ProtestForm): ProtestPayload {
  return {
    incidentType: form.elements.incidentType.value,
    protestedDriverName: form.elements.protestedDriverName.value.trim(),
    sessionType: form.elements.sessionType.value,
    lapOrTime: form.elements.lapOrTime.value.trim(),
    trackLocation: form.elements.trackLocation.value.trim(),
    otherCarNumber: form.elements.otherCarNumber.value.trim(),
    observedAction: form.elements.observedAction.value.trim(),
    userAction: form.elements.userAction.value.trim(),
    outcomes: [...form.querySelectorAll<HTMLInputElement>("input[name='outcomes']:checked")].map((input) => input.value),
    additionalContext: form.elements.additionalContext.value.trim(),
  };
}

function requiredMessage(field: FieldName): string | undefined {
  return (FIELD_RULES[field] as { requiredMessage?: string }).requiredMessage;
}

function validationMessage(field: FieldName, error: FieldError) {
  if (error.code === "required") return requiredMessage(field) || "请填写此项。";
  if (error.code === "too_long") return `最多可填写 ${error.maxLength} 个字符。`;
  if (field === "incidentType") return "请选择有效的违规类型。";
  if (field === "sessionType") return "请选择有效的场次类型。";
  if (error.code === "other_requires_context") return "请选择“其他”后，在补充信息中说明具体后果。";
  if (field === "outcomes") return "请选择有效且不冲突的事故后果。";
  return "请检查此项内容。";
}

export function initProtestForm(elements: FormView) {
  const { submitButton, statusError, resultCard, resultText, translationText, copyButton, skipDetailsButton } = elements;
  const form = elements.form as ProtestForm;
  configureForm(form);
  const formErrors = createFormErrors(form, statusError);

  function resetResult() {
    resultText.textContent = "";
    translationText.textContent = "";
    resultCard.classList.remove("has-result");
    copyButton.disabled = true;
    copyButton.textContent = "复制英文";
  }

  function setLoading(loading: boolean) {
    submitButton.disabled = loading;
    submitButton.textContent = loading ? "正在整理…" : "生成描述与翻译 →";
  }

  function refreshVisibleFieldError(field: FieldName) {
    const errorElement = form.querySelector(`#${field}-error`);
    if (!errorElement?.textContent) return;
    const error = validateProtestPayload(collectPayload(form)).errors[field];
    if (error) formErrors.showField(field, validationMessage(field, error));
    else formErrors.clearField(field);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formErrors.clearAll();
    resetResult();

    const payload = collectPayload(form);
    const validation = validateProtestPayload(payload);
    if (validation.fields.length) {
      for (const field of validation.fields) {
        const error = validation.errors[field];
        if (error) formErrors.showField(field, validationMessage(field, error));
      }
      form.elements[validation.fields[0] as Exclude<FieldName, "outcomes">]?.focus();
      return;
    }

    setLoading(true);
    const result = await requestDescription(payload);
    if (!result.ok) {
      for (const field of result.fields) {
        const error = validation.errors[field];
        formErrors.showField(field, error ? validationMessage(field, error) : requiredMessage(field) || result.message);
      }
      formErrors.showStatus(result.message);
      if (result.fields.length) form.elements[result.fields[0] as Exclude<FieldName, "outcomes">]?.focus();
    } else {
      resultText.textContent = result.description;
      translationText.textContent = result.translation;
      resultCard.classList.add("has-result");
      copyButton.disabled = false;
      resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    setLoading(false);  });

  function handleFormEdit(event: Event) {
    resetResult();
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
    if (target instanceof HTMLInputElement && target.name === "outcomes" && target.checked) {
      const pair = OUTCOME_CONFLICTS.find((values) => values.includes(target.value));
      const conflictingValue = pair?.find((value) => value !== target.value);
      const conflictingInput = conflictingValue && form.querySelector<HTMLInputElement>(`input[name="outcomes"][value="${conflictingValue}"]`);
      if (conflictingInput) conflictingInput.checked = false;
    }

    const field = target.name as FieldName;
    if (!field) return;
    refreshVisibleFieldError(field);
    if (field === "outcomes") refreshVisibleFieldError("additionalContext");
    if (field === "additionalContext") refreshVisibleFieldError("outcomes");
  }

  form.addEventListener("input", handleFormEdit);
  form.addEventListener("change", handleFormEdit);

  skipDetailsButton.addEventListener("click", () => {
    submitButton.scrollIntoView({ behavior: "smooth", block: "center" });
    submitButton.focus({ preventScroll: true });
  });

  copyButton.addEventListener("click", async () => {
    if (!resultText.textContent) return;
    try {
      await navigator.clipboard.writeText(resultText.textContent);
      copyButton.textContent = "已复制英文 ✓";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(resultText);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      copyButton.textContent = "请手动复制";
    }
    window.setTimeout(() => { copyButton.textContent = "复制英文"; }, 1800);
  });
}
