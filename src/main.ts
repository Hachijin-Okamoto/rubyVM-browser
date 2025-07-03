/* src/main.ts */

import { astNode } from "./modules/assembly/interface/astNode";
import { generateAssembly } from "./modules/assembly/generateAssembly";
import { assemblyToBytecode } from "./modules/bytecode/assembly-to-bytecode";
import { MyVM } from "./modules/vm/myVM";
import { assemblyLine } from "./modules/assembly/interface/assemblyLine";
import { formatAssemblyLine } from "./modules/assembly/assembly-service";
import { handleAssemblyClick } from "./ui/dom-service";
import { VMLogEntry } from "./modules/vm/interface/VMLog";

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

  let assemblyLines: assemblyLine[] = [];
  let bytecode: Uint8Array;
  let stackLogs: VMLogEntry[];

  try {
    assemblyLines = generateAssembly(ast_data);
    bytecode = assemblyToBytecode(assemblyLines);
    console.log(bytecode);
    bytecodeOutput.textContent = String(bytecode.join(" "));
    const vm: MyVM = new MyVM(bytecode);
    const { result, stackLogs: logs } = vm.runWithLog();
    resultOutput.textContent = result.join("\n");
    stackLogs = logs;
  } catch (Error) {
    console.log(Error);
  }

  assemblyLines.forEach((assemblyLine, index) => {
    const line = document.createElement("div");
    line.textContent = formatAssemblyLine(assemblyLine);
    line.addEventListener("click", () => {
      handleAssemblyClick(index, stackLogs);
    });
    assemblyOutput.appendChild(line);
  });

  /*
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
    */
});
