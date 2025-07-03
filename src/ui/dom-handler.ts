/* src/ui/dom-handler.ts */

import { VMLogEntry } from "../modules/vm/interface/VMLog";

export function displayStack(snapshot: (number | string | any[])[]): void {
  const stackDisplay: HTMLElement = document.getElementById("stack-display")!;
  stackDisplay.innerText = "";
  stackDisplay.innerText = JSON.stringify(snapshot, null, 2);
}

export function showStepSelection(
  ac: number,
  matchingLogs: VMLogEntry[],
): void {
  const stackDisplay: HTMLElement = document.getElementById("stack-display")!;
  stackDisplay.innerText = "";

  const title = document.createElement("div");
  title.innerText = `複数回実行されています（ac=${ac}/pc=${matchingLogs[0].pc}）`;
  stackDisplay.appendChild(title);

  matchingLogs.forEach((log) => {
    const button = document.createElement("button");
    button.innerText = `ステップ ${log.step}（PC=${log.pc}）`;
    button.style.margin = "4px";

    button.addEventListener("click", () => {
      displayStack(log.stackSnapshot);
    });

    stackDisplay.appendChild(button);
  });
}

export function displayNoStack(): void {
  const stackDisplay: HTMLElement = document.getElementById("stack-display")!;
  stackDisplay.innerText = "";
}
