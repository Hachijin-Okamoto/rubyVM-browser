/* src/ui/dom-service.ts */

import { VMLogEntry } from "../modules/vm/interface/VMLog";
import { displayStack, showStepSelection, displayNoStack } from "./dom-handler";

export function handleAssemblyClick(ac: number, stackLogs: VMLogEntry[]): void {
  const matchingLogs = stackLogs.filter((log) => log.ac === ac);

  if (matchingLogs.length === 1) {
    displayStack(matchingLogs[0]);
  } else if (matchingLogs.length > 1) {
    showStepSelection(ac, matchingLogs);
  } else {
    displayNoStack();
  }
}
