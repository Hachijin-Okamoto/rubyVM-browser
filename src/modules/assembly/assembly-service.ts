/* src/modules/assembly/assembly-service.ts */

import {
  assemblyLine,
  FunctionLabel,
  LoopLabel,
} from "./interface/assemblyLine";
/**
 * 関数周りに使用するラベルの作成用
 * @param name 関数名
 * @returns ラベル（関数名を平文で含む）
 */
export function getNewFuncLabel(name: string): FunctionLabel {
  return { type: "function_label", name } as FunctionLabel;
}

let labelId: number = 0;
/**
 * ジャンプ命令に使用するラベルの作成用
 * @returns ラベル（ジャンプ用）
 */
export function getNewLabel(): LoopLabel {
  return { type: "loop_label", name: String(labelId++) } as LoopLabel;
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
        return `${assemblyLine.name} ${assemblyLine.value}`;
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
