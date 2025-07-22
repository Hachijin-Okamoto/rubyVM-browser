/* modules/assembly/interface/assemblyLine.ts */

export type assemblyLine =
  | Instruction
  | FunctionCall
  | LoopLabel
  | FunctionLabel;

export interface Instruction {
  type: "instruction";
  name: string;
  value?: number | string | LoopLabel | FunctionLabel;
}

export interface FunctionCall {
  type: "function_call";
  name: string;
  functionName: string;
  argumentCount: number;
}

export interface LoopLabel {
  type: "loop_label";
  name: string;
}

export interface FunctionLabel {
  type: "function_label";
  name: string;
}

/**
 * 型ガード関数
 */
export function isLoopLabel(line: unknown): line is LoopLabel {
  return (line as LoopLabel).type === "loop_label";
}
