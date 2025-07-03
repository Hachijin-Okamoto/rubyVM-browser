/* src/main.ts */

import { astNode } from "./modules/assembly/interface/astNode";
import { generateAssembly } from "./modules/assembly/generateAssembly";
// import { assemblyToBytecode } from "./modules/bytecode/assembly-to-bytecode";
// import { MyVM } from "./modules/vm/myVM";
import { assemblyLine } from "./modules/assembly/interface/assemblyLine";

const jsonInput: HTMLTextAreaElement = document.getElementById(
  "jsonInput",
) as HTMLTextAreaElement;
const runButton: HTMLButtonElement = document.getElementById(
  "runButton",
) as HTMLButtonElement;

const assemblyOutput: HTMLElement = document.getElementById("assemblyOutput")!;
const _bytecodeOutput: HTMLElement = document.getElementById("bytecodeOutput")!;
const _resultOutput: HTMLElement = document.getElementById("resultOutput")!;

runButton.addEventListener("click", () => {
  const ast_data: astNode = JSON.parse(jsonInput.value) as astNode;

  try {
    const assemblyLines: assemblyLine[] = generateAssembly(ast_data);
    assemblyOutput.textContent = JSON.stringify(assemblyLines);
  } catch (Error) {
    assemblyOutput.textContent = String(Error);
  }

  /*
  const bytecode: Uint8Array = assemblyToBytecode(assemblyLines);
  bytecodeOutput.textContent = String(bytecode);

  const vm: MyVM = new MyVM(bytecode);
  resultOutput.textContent = String(vm.run());
  */
});
