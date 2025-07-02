/* src/main.ts */

import { astNode } from "./modules/assembly/interface";
import { generateAssembly } from "./modules/assembly/generateAssembly";
import { assemblyToBytecode } from "./modules/bytecode/assembly-to-bytecode";

const jsonInput: HTMLTextAreaElement = document.getElementById(
  "jsonInput",
) as HTMLTextAreaElement;
const runButton: HTMLButtonElement = document.getElementById(
  "runButton",
) as HTMLButtonElement;

const assemblyOutput: HTMLElement = document.getElementById("assemblyOutput")!;
const bytecodeOutput: HTMLElement = document.getElementById("bytecodeOutput")!;

runButton.addEventListener("click", () => {
  const ast_data: astNode = JSON.parse(jsonInput.value) as astNode;

  const assemblyLines: string[] = generateAssembly(ast_data);
  assemblyOutput.textContent = assemblyLines.join("\n");

  const bytecode: Uint8Array = assemblyToBytecode(assemblyLines);
  bytecodeOutput.textContent = String(bytecode);
});
