/* src/main.ts */

import { astNode } from "./modules/assembly/interface/astNode";
import { generateAssembly } from "./modules/assembly/generateAssembly";
import { assemblyToBytecode } from "./modules/bytecode/assembly-to-bytecode";
import { MyVM } from "./modules/vm/myVM";
import { assemblyLine } from "./modules/assembly/interface/assemblyLine";
import { formatAssemblyLine } from "./modules/assembly/assembly-service";

const jsonInput: HTMLTextAreaElement = document.getElementById(
  "jsonInput",
) as HTMLTextAreaElement;
const runButton: HTMLButtonElement = document.getElementById(
  "runButton",
) as HTMLButtonElement;
// アセンブリ列を押したときにループ回数
const assemblyLoopList: HTMLElement = document.getElementById(
  "assemblyLoopList",
) as HTMLElement;

const assemblyOutput: HTMLElement = document.getElementById("assemblyOutput")!;
const bytecodeOutput: HTMLElement = document.getElementById("bytecodeOutput")!;
const resultOutput: HTMLElement = document.getElementById("resultOutput")!;
const stackPreview: HTMLElement = document.getElementById("stackPreview")!;

const stackLogs = [
  { pc: 0, stackSnapshot: [] },
  { pc: 1, stackSnapshot: ["Hello"] },
  { pc: 2, stackSnapshot: [] },
];

runButton.addEventListener("click", () => {
  const ast_data: astNode = JSON.parse(jsonInput.value) as astNode;
  let assemblyLines: assemblyLine[];

  try {
    assemblyLines = generateAssembly(ast_data);
    assemblyLines.forEach((assemblyLine, index) => {
      const line = document.createElement("div");
      line.textContent = formatAssemblyLine(assemblyLine);
      assemblyOutput.appendChild(line);

      line.addEventListener("click", () => {
        const log = stackLogs.find((logs) => logs.pc === index);
        stackPreview.textContent = log
          ? JSON.stringify(log.stackSnapshot, null, 2)
          : "No log for this line";
      });
      assemblyOutput.appendChild(line);
    });
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
    const stackLogs = vm.runWithLog().stackLogs;
    console.log(stackLogs);
    //resultOutput.textContent = String(vm.runWithLog().result);
  } catch (Error) {
    resultOutput.textContent = String(Error);
  }
});

function showLoopCountButton(assemblyCounter: number) {}
