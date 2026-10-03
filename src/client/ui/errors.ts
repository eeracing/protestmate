export function createFormErrors(form: HTMLFormElement, statusElement: HTMLElement) {
  function fieldInputs(field: string) {
    return form.querySelectorAll(`[name="${field}"]`);
  }

  function clearField(field: string) {
    for (const input of fieldInputs(field)) input.removeAttribute("aria-invalid");
    const error = form.querySelector(`#${field}-error`);
    if (error) error.textContent = "";
  }

  function showField(field: string, message: string) {
    for (const input of fieldInputs(field)) input.setAttribute("aria-invalid", "true");
    const error = form.querySelector(`#${field}-error`);
    if (error) error.textContent = message;
  }

  function clearAll() {
    for (const element of form.querySelectorAll("[aria-invalid='true']")) {
      element.removeAttribute("aria-invalid");
    }
    for (const element of form.querySelectorAll(".field-error")) element.textContent = "";
    statusElement.textContent = "";
    statusElement.classList.remove("visible");
  }

  function showStatus(message: string) {
    statusElement.textContent = message;
    statusElement.classList.add("visible");
  }

  return { clearAll, clearField, showField, showStatus };
}

