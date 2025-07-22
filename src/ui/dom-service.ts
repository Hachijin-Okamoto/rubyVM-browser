/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* ui/dom-service.ts */

import { astNode, isAstNode } from "../modules/assembly/interface/astNode";
import { assemblyLine } from "../modules/assembly/interface/assemblyLine";
import { VMLogEntry } from "../modules/vm/interface/VMLog";
import { displayStack, showStepSelection, displayNoStack } from "./dom-handler";

export async function readJsonInput(input: HTMLInputElement): Promise<astNode> {
  if (!input.files || input.files.length === 0) {
    throw new Error("ファイルが選択されていません。");
  }

  if (input.files[0].type !== "application/json") {
    throw new Error("ファイル形式が正しくありません。");
  }

  const file: File = input.files[0];
  const reader: FileReader = new FileReader();

  return new Promise<astNode>((resolve, reject) => {
    reader.onload = (): void => {
      try {
        const content: string = reader.result as string;
        const parsed: astNode = JSON.parse(content) as astNode;
        if (isAstNode(parsed)) {
          alert("ASTファイルを正常に読み込みました。");
          resolve(parsed);
        } else {
          throw new Error("不正なAST形式です。");
        }
      } catch (err: any) {
        alert("JSONの読み込みに失敗しました。（" + err + "）");
        reject(new Error("JSONの読み込みに失敗しました。"));
      }
    };
    reader.onerror = (_err: any): void => {
      alert("ファイルの読み込み中にエラーが発生しました。");
      reject(new Error("ファイルの読み込み中にエラーが発生しました。"));
    };
    reader.readAsText(file);
  });
}

export function handleAssemblyClick(ac: number, stackLogs: VMLogEntry[]): void {
  const matchingLogs: VMLogEntry[] = stackLogs.filter((log) => log.ac === ac);

  if (matchingLogs.length === 1) {
    displayStack(matchingLogs[0]);
  } else if (matchingLogs.length > 1) {
    showStepSelection(ac, matchingLogs);
  } else {
    displayNoStack();
  }
}

/**
 * アセンブリ列を出力できる形式に変換する関数
 * @param assemblyLine アセンブリ列（単体）
 * @returns 出力用の文字列
 */
export function formatAssemblyLine(assemblyLine: assemblyLine): string {
  if (assemblyLine.type === "instruction") {
    if (assemblyLine.value !== undefined) {
      if (
        typeof assemblyLine.value === "object" &&
        assemblyLine.value !== null &&
        (assemblyLine.value as any).type === "loop_label"
      ) {
        return `${assemblyLine.name} LABEL->${assemblyLine.value.name}`;
      } else if (
        typeof assemblyLine.value === "object" &&
        assemblyLine.value !== null &&
        (assemblyLine.value as any).type === "function_label"
      ) {
        return `${assemblyLine.name} LABEL->${assemblyLine.value.name}`;
      } else {
        return `${assemblyLine.name} ${assemblyLine.value as string}`;
      }
    } else {
      return `${assemblyLine.name}`;
    }
  } else if (assemblyLine.type === "function_call") {
    return `${assemblyLine.name} ${assemblyLine.functionName}`;
  } else if (
    assemblyLine.type === "loop_label" ||
    assemblyLine.type === "function_label"
  ) {
    return `[Label]:${assemblyLine.name}`;
  } else {
    throw new Error(`Unknown type`);
  }
}
