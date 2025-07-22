/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* ui/dom-handler.ts */

import {
  invertVariableTable,
  variableTable,
} from "../modules/bytecode/bytecode-service";
import { VMLogEntry } from "../modules/vm/interface/VMLog";
import { handleAssemblyClick } from "./dom-service";

export function clearOutputs(): void {
  const assemblyOutput: HTMLTextAreaElement = document.getElementById(
    "assemblyOutput",
  )! as HTMLTextAreaElement;
  const bytecodeOutput: HTMLTextAreaElement = document.getElementById(
    "bytecodeOutput",
  )! as HTMLTextAreaElement;
  const resultOutput: HTMLTextAreaElement = document.getElementById(
    "resultOutput",
  )! as HTMLTextAreaElement;

  assemblyOutput.innerHTML = "";
  bytecodeOutput.textContent = "";
  resultOutput.textContent = "";
}

export function displayStack(log: VMLogEntry): void {
  const stackDisplay: HTMLElement = document.getElementById("stack-display")!;
  stackDisplay.innerText = "";

  // --- スタック部分 ---
  const stackContainer: HTMLDivElement = document.createElement("div");
  stackContainer.style.display = "flex";
  stackContainer.style.flexDirection = "column-reverse";
  stackContainer.style.alignItems = "center";
  stackContainer.style.border = "2px solid #888";
  stackContainer.style.padding = "8px";
  stackContainer.style.height = "180px";
  stackContainer.style.width = "120px";
  stackContainer.style.overflowY = "auto";
  stackContainer.style.backgroundColor = "#f9f9f9";

  for (let i: number = log.stackSnapshot.length - 1; i >= 0; i--) {
    const frame: HTMLDivElement = document.createElement("div");
    frame.style.width = "80px";
    frame.style.padding = "8px";
    frame.style.margin = "4px 0";
    frame.style.backgroundColor = "#d4eaff";
    frame.style.border = "1px solid #007acc";
    frame.style.borderRadius = "4px";
    frame.style.textAlign = "center";
    frame.style.fontFamily = "monospace";

    const value: string | number | any[] = log.stackSnapshot[i];
    frame.textContent =
      typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : String(value);

    stackContainer.appendChild(frame);
  }

  // --- 情報表示エリア ---
  const infoBox: HTMLDivElement = document.createElement("div");
  infoBox.id = "stack-info";
  infoBox.style.marginTop = "16px";
  infoBox.style.padding = "8px";
  infoBox.style.borderTop = "1px dashed #ccc";
  infoBox.style.fontSize = "13px";
  infoBox.style.whiteSpace = "pre-wrap";
  infoBox.style.wordBreak = "break-word";
  infoBox.style.fontFamily = "monospace";

  const invertedVariableTable: Map<number, string> =
    invertVariableTable(variableTable);

  // 内容の差し替え
  const namedEnv: any[] = log.envSnapshot
    ? convertEnv(log.envSnapshot, invertedVariableTable)
    : [];

  const env: string = namedEnvToString(namedEnv);
  const popped: string = log.poppedValues
    ? JSON.stringify(log.poppedValues)
    : "(なし)";
  const pushed: string = log.pushedValue
    ? JSON.stringify(log.pushedValue)
    : "(なし)";
  const desc: string = log.description ?? "(なし)";

  infoBox.innerHTML = `
<b>変数:</b> ${env}<br>
<b>POP:</b> ${popped}<br>
<b>PUSH:</b> ${pushed}<br>
<b>説明:</b> ${desc}
`;

  stackDisplay.appendChild(stackContainer);
  stackDisplay.appendChild(infoBox);

  highlightAssemblyLine(log.ac);
}

function convertEnv(
  envSnapshot: any[],
  invertedVariableTable: Map<number, string>,
): any[] {
  return envSnapshot.map((env) => {
    const namedEnv: Record<string, any> = {};
    for (const key in env) {
      const index: number = Number(key);
      const name: string = invertedVariableTable.get(index) ?? key;
      namedEnv[name] = env[key];
    }
    return namedEnv;
  });
}

function namedEnvToString(namedEnv: any[]): string {
  if (namedEnv.length === 0) return "(なし)";

  return namedEnv
    .map((env, _index) => {
      const vars: string = Object.entries(env)
        .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
        .join(", ");
      return `${vars}`;
    })
    .join("\n");
}

export function displayVariables(envSnapshot: any[]): HTMLElement {
  const container: HTMLDivElement = document.createElement("div");

  envSnapshot.forEach((env, envIndex) => {
    const envBlock: HTMLDivElement = document.createElement("div");
    envBlock.style.marginBottom = "10px";
    envBlock.style.border = "1px solid #ccc";
    envBlock.style.padding = "5px";
    envBlock.style.backgroundColor = "#fefefe";

    const title: HTMLDivElement = document.createElement("div");
    title.textContent = `環境 ${envIndex}`;
    title.style.fontWeight = "bold";
    envBlock.appendChild(title);

    for (const key in env) {
      const row: HTMLDivElement = document.createElement("div");
      row.textContent = `${key} = ${JSON.stringify(env[key])}`;
      envBlock.appendChild(row);
    }

    container.appendChild(envBlock);
  });

  return container;
}

export function showStepSelection(
  ac: number,
  matchingLogs: VMLogEntry[],
): void {
  const stackDisplay: HTMLElement = document.getElementById("stack-display")!;
  stackDisplay.innerText = "";

  const title: HTMLDivElement = document.createElement("div");
  title.innerText = `複数回実行されています（ac=${ac}/pc=${matchingLogs[0].pc}）`;
  stackDisplay.appendChild(title);

  matchingLogs.forEach((log) => {
    const button: HTMLButtonElement = document.createElement("button");
    button.innerText = `ステップ ${log.step}`;
    button.style.margin = "4px";

    button.addEventListener("click", () => {
      displayStack(log);
    });

    stackDisplay.appendChild(button);
  });
}

export function displayNoStack(): void {
  const stackDisplay: HTMLElement = document.getElementById("stack-display")!;
  stackDisplay.innerText = "";
}

export function highlightAssemblyLine(targetAc: number): void {
  const lines: NodeListOf<HTMLElement> =
    document.querySelectorAll<HTMLElement>(".assembly-line");
  lines.forEach((line) => {
    if (parseInt(line.dataset.ac || "-1") === targetAc) {
      line.style.backgroundColor = "#ffe6cc"; // ハイライト色
    } else {
      line.style.backgroundColor = ""; // 元に戻す
    }
  });
}

export function createAssemblyLineElement(
  assemblyLine: string,
  index: number,
  vmLogs: VMLogEntry[],
): HTMLElement {
  const line: HTMLDivElement = document.createElement("div");
  line.textContent = assemblyLine;
  line.dataset.ac = index.toString();
  line.classList.add("assembly-line");
  line.addEventListener("click", () => {
    handleAssemblyClick(index, vmLogs);
  });

  const assemblyOutput: HTMLElement =
    document.getElementById("assemblyOutput")!;
  assemblyOutput.appendChild(line);
  return line;
}
