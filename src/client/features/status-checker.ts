import { connectDialog } from "../ui/dialog";

import { classifyProtestStatus, protestStatuses, type Status } from "./status-model";

type StatusElements = { openButton: HTMLButtonElement; dialog: HTMLDialogElement; form: HTMLFormElement; emailInput: HTMLTextAreaElement; result: HTMLElement; marker: HTMLElement; title: HTMLElement; copy: HTMLElement; evidence: HTMLElement };
export function initStatusChecker(elements: StatusElements) {
  const { openButton, dialog, form, emailInput, result, marker, title, copy, evidence } = elements;
  connectDialog({
    dialog,
    openButton,
    closeSelector: "[data-close-status]",
    initialFocus: emailInput,
  });

  function showStatus(status: Status) {
    const content = protestStatuses[status];
    result.dataset.status = status;
    marker.textContent = content.marker;
    title.textContent = content.title;
    copy.textContent = content.copy;
    evidence.textContent = content.evidence;
    result.classList.add("visible");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailContent = emailInput.value.trim();
    if (!emailContent) return emailInput.focus();
    showStatus(classifyProtestStatus(emailContent));
  });

  emailInput.addEventListener("input", () => {
    result.classList.remove("visible");
    result.removeAttribute("data-status");
  });
}
