/* ui/dom-module.ts */

import { assemblyLine } from "../modules/assembly/interface/assemblyLine";
import { astNode } from "../modules/assembly/interface/astNode";
import { VMLogEntry } from "../modules/vm/interface/VMLog";
import { clearOutputs, createAssemblyLineElement } from "./dom-handler";
import { formatAssemblyLine, readJsonInput } from "./dom-service";

export async function readFileInput(
  fileInput: HTMLInputElement,
): Promise<astNode> {
  return await readJsonInput(fileInput);
}

export function clearOutputsEx(): void {
  clearOutputs();
}

export function displayBytecode(bytecode: Uint8Array): void {
  const bytecodeOutput: HTMLTextAreaElement = document.getElementById(
    "bytecodeOutput",
  )! as HTMLTextAreaElement;
  bytecodeOutput.textContent = bytecode.join(" ");
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function displayResult(result: any[]): void {
  const resultOutput: HTMLTextAreaElement = document.getElementById(
    "resultOutput",
  )! as HTMLTextAreaElement;
  resultOutput.textContent = result.join("\n");
}

export function displayAssembly(
  line: assemblyLine,
  index: number,
  logs: VMLogEntry[],
): HTMLElement {
  const fixedAssemblyLine: string = formatAssemblyLine(line);
  return createAssemblyLineElement(fixedAssemblyLine, index, logs);
}
