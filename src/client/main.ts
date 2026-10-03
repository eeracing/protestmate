import { initProtestForm } from "./features/protest-form";
import { initProtestGuide } from "./features/protest-guide";
import { initStatusChecker } from "./features/status-checker";

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing page element: ${id}`);
  return element as T;
}

initProtestForm({
  form: byId<HTMLFormElement>("protest-form"),
  submitButton: byId<HTMLButtonElement>("submit-button"),
  statusError: byId<HTMLElement>("status-error"),
  resultCard: byId<HTMLElement>("result-card"),
  resultText: byId<HTMLElement>("result-text"),
  translationText: byId<HTMLElement>("result-translation-text"),
  copyButton: byId<HTMLButtonElement>("copy-button"),
  skipDetailsButton: byId<HTMLButtonElement>("skip-details-button"),
});

initStatusChecker({
  openButton: byId<HTMLButtonElement>("open-status-checker"),
  dialog: byId<HTMLDialogElement>("status-checker"),
  form: byId<HTMLFormElement>("status-checker-form"),
  emailInput: byId<HTMLTextAreaElement>("status-email-input"),
  result: byId<HTMLElement>("status-result"),
  marker: byId<HTMLElement>("status-result-marker"),
  title: byId<HTMLElement>("status-result-title"),
  copy: byId<HTMLElement>("status-result-copy"),
  evidence: byId<HTMLElement>("status-result-evidence"),
});

initProtestGuide({
  openButton: byId<HTMLButtonElement>("open-protest-guide"),
  dialog: byId<HTMLDialogElement>("protest-guide"),
  imageDialog: byId<HTMLDialogElement>("guide-image-dialog"),
  fullImage: byId<HTMLImageElement>("guide-image-full"),
});
