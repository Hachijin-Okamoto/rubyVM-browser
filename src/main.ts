/* src/main.ts */

import { astNode } from "./modules/assembly/interface/astNode";
import { generateAssembly } from "./modules/assembly/generateAssembly";
import { assemblyToBytecode } from "./modules/bytecode/assembly-to-bytecode";
import { MyVM } from "./modules/vm/myVM";
import { assemblyLine } from "./modules/assembly/interface/assemblyLine";

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
  let assemblyLines: assemblyLine[];

  try {
    assemblyLines = generateAssembly(ast_data);
    assemblyOutput.textContent = JSON.stringify(assemblyLines);
  } catch (Error) {
    assemblyOutput.textContent = String(Error);
    return;
  }

  let bytecode: Uint8Array;
  try {
    bytecode = assemblyToBytecode(assemblyLines);
    bytecodeOutput.textContent = String(bytecode.join(" "));
  } catch (Error) {
    bytecodeOutput.textContent = String(Error);
    return;
  }

  try {
    const vm: MyVM = new MyVM(bytecode);
    resultOutput.textContent = String(vm.run());
  } catch (Error) {
    resultOutput.textContent = String(Error);
  }
});
