/* src/modules/assembly/interface/assemblyLine.ts */

export type assemblyLine =
  | Instruction
  | FunctionCall
  | LoopLabel
  | FunctionLabel;

export interface Instruction {
  type: "instruction";
  name: string;
  value?: number | string | LoopLabel;
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
