/* main.ts */
import { astNode } from "./modules/assembly/interface/astNode";
import { generateAssembly } from "./modules/assembly/generateAssembly";
import { assemblyToBytecode } from "./modules/bytecode/assembly-to-bytecode";
import { MyVM } from "./modules/vm/myVM";
import { assemblyLine } from "./modules/assembly/interface/assemblyLine";
import { VMLogEntry } from "./modules/vm/interface/VMLog";
import { displayStack } from "./ui/dom-handler";
import "./style.css";
import {
  readFileInput,
  clearOutputsEx,
  displayBytecode,
  displayResult,
  displayAssembly,
} from "./ui/dom-module";

const fileInput: HTMLInputElement = document.getElementById(
  "jsonFileInput",
)! as HTMLInputElement;
const runButton: HTMLButtonElement = document.getElementById(
  "runButton",
)! as HTMLButtonElement;

let parsedAST: astNode | null = null;

let currentStepIndex: number = 0;
let vmLogs: VMLogEntry[] = [];

fileInput.addEventListener("change", () => {
  void readFileInput(fileInput)
    .then((ast) => {
      parsedAST = ast;
    })
    .catch();
});

runButton.addEventListener("click", () => {
  if (!parsedAST) {
    alert("ASTファイルを先に読み込んでください");
    return;
  }

  clearOutputsEx();

  try {
    const assemblyLines: assemblyLine[] = generateAssembly(parsedAST);
    const bytecode: Uint8Array = assemblyToBytecode(assemblyLines);
    const vm: MyVM = new MyVM(bytecode);
    const { result, stackLogs: logs } = vm.runWithLog();

    displayBytecode(bytecode);
    displayResult(result);

    vmLogs = logs;

    assemblyLines.forEach((assemblyLine, index) => {
      const _line: HTMLElement = displayAssembly(assemblyLine, index, vmLogs);
    });
  } catch (error) {
    console.error(error);
    alert("処理中にエラーが発生しました。詳細はコンソールをご確認ください。");
  }
});

document.getElementById("prevStep")!.addEventListener("click", () => {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    displayStack(vmLogs[currentStepIndex]);
  }
});

document.getElementById("nextStep")!.addEventListener("click", () => {
  if (currentStepIndex < vmLogs.length - 1) {
    currentStepIndex++;
    displayStack(vmLogs[currentStepIndex]);
  }
});
