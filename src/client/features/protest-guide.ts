import { connectDialog } from "../ui/dialog";

type GuideElements = { openButton: HTMLButtonElement; dialog: HTMLDialogElement; imageDialog: HTMLDialogElement; fullImage: HTMLImageElement };
export function initProtestGuide({ openButton, dialog, imageDialog, fullImage }: GuideElements) {
  connectDialog({ dialog, openButton, closeSelector: "[data-close-guide]" });

  for (const imageButton of dialog.querySelectorAll<HTMLButtonElement>("[data-guide-image]")) {
    imageButton.addEventListener("click", () => {
      fullImage.src = imageButton.dataset.guideImage ?? "";
      fullImage.alt = imageButton.dataset.guideAlt ?? "";
      imageDialog.showModal();
    });
  }

  imageDialog.querySelector("[data-close-image]")?.addEventListener("click", () => imageDialog.close());
  imageDialog.addEventListener("click", (event) => {
    if (event.target === imageDialog) imageDialog.close();
  });
  imageDialog.addEventListener("close", () => {
    fullImage.removeAttribute("src");
    fullImage.alt = "";
  });
}

