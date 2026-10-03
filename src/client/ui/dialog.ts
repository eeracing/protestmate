type DialogOptions = { dialog: HTMLDialogElement; openButton?: HTMLElement; closeSelector: string; initialFocus?: HTMLElement };
export function connectDialog({ dialog, openButton, closeSelector, initialFocus }: DialogOptions) {
  openButton?.addEventListener("click", () => {
    dialog.showModal();
    if (initialFocus) window.setTimeout(() => initialFocus.focus(), 0);
  });

  for (const closeButton of dialog.querySelectorAll(closeSelector)) {
    closeButton.addEventListener("click", () => dialog.close());
  }

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

