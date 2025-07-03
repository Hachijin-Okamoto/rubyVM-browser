/* src/modules/assembly/assembly-service.ts */

import { FunctionLabel, LoopLabel } from "./interface/assemblyLine";
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
