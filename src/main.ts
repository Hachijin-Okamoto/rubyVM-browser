import { astNode } from "./modules/assembly/interface/astNode";
import { generateAssembly } from "./modules/assembly/generateAssembly";
import { assemblyToBytecode } from "./modules/bytecode/assembly-to-bytecode";
import { MyVM } from "./modules/vm/myVM";
import { assemblyLine } from "./modules/assembly/interface/assemblyLine";
import { formatAssemblyLine } from "./modules/assembly/assembly-service";
import { handleAssemblyClick } from "./ui/dom-service";
import { VMLogEntry } from "./modules/vm/interface/VMLog";
import { displayStack } from "./ui/dom-handler";
import { highlightAssemblyLine } from "./ui/dom-handler";
import "./style.css";

const fileInput = document.getElementById("jsonFileInput") as HTMLInputElement;
const runButton = document.getElementById("runButton") as HTMLButtonElement;

const assemblyOutput = document.getElementById("assemblyOutput")!;
const bytecodeOutput = document.getElementById("bytecodeOutput")!;
const resultOutput = document.getElementById("resultOutput")!;

let parsedAST: astNode | null = null;

let currentStepIndex: number = 0;
let vmLogs: VMLogEntry[] = [];

fileInput.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    try {
      parsedAST = JSON.parse(reader.result as string);
      alert("ASTファイルを読み込みました。実行ボタンを押してください。");
    } catch (err) {
      alert("JSONの読み込みに失敗しました");
      parsedAST = null;
    }
  };

  reader.readAsText(file);
});

// 実行ボタン
runButton.addEventListener("click", () => {
  if (!parsedAST) {
    alert("ASTファイルを先に読み込んでください");
    return;
  }

  assemblyOutput.innerHTML = "";
  bytecodeOutput.textContent = "";
  resultOutput.textContent = "";

  let assemblyLines: assemblyLine[] = [];
  let bytecode: Uint8Array;
  let stackLogs: VMLogEntry[];

  try {
    assemblyLines = generateAssembly(parsedAST);
    bytecode = assemblyToBytecode(assemblyLines);
    bytecodeOutput.textContent = bytecode.join(" ");

    const vm = new MyVM(bytecode);
    const { result, stackLogs: logs } = vm.runWithLog();
    resultOutput.textContent = result.join("\n");
    stackLogs = logs;
    vmLogs = logs;

    assemblyOutput.innerHTML = ""; // 初期化（追記：これ忘れずに！）

    assemblyLines.forEach((assemblyLine, index) => {
      const line = document.createElement("div");
      line.textContent = formatAssemblyLine(assemblyLine);
      line.dataset.ac = index.toString(); // ← ac を data 属性に保持
      line.classList.add("assembly-line"); // ← スタイル用クラスも追加
      line.addEventListener("click", () => {
        handleAssemblyClick(index, stackLogs);
      });
      assemblyOutput.appendChild(line);
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
