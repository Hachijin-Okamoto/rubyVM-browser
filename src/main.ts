/* src/main.ts */

import { astNode } from "./modules/assembly/interface";
import { generateAssembly } from "./modules/assembly/generateAssembly";
import { assemblyToBytecode } from "./modules/bytecode/assembly-to-bytecode";
import { MyVM } from "./modules/vm/myVM";

const jsonInput: HTMLTextAreaElement = document.getElementById(
  "jsonInput",
) as HTMLTextAreaElement;
const runButton: HTMLButtonElement = document.getElementById(
  "runButton",
) as HTMLButtonElement;

const assemblyOutput: HTMLElement = document.getElementById("assemblyOutput")!;
const bytecodeOutput: HTMLElement = document.getElementById("bytecodeOutput")!;
const resultOutput: HTMLElement = document.getElementById("resultOutput")!;

runButton.addEventListener("click", () => {
  const ast_data: astNode = JSON.parse(jsonInput.value) as astNode;

  const assemblyLines: string[] = generateAssembly(ast_data);
  assemblyOutput.textContent = assemblyLines.join("\n");

  const bytecode: Uint8Array = assemblyToBytecode(assemblyLines);
  bytecodeOutput.textContent = String(bytecode);

  const vm: MyVM = new MyVM(bytecode);
  resultOutput.textContent = String(vm.run());
});
