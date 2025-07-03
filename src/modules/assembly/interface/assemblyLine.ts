/* src/modules/assembly/interface/assemblyLine.ts */

export type assemblyLine =
  | Instruction
  | FunctionCall
  | LoopLabel
  | FunctionLabel;

export interface Instruction {
  name: string;
  value?: number | string | LoopLabel;
}

export interface FunctionCall {
  name: string;
  functionName: string;
  argumentCount: number;
}

export interface LoopLabel {
  name: string;
}

export interface FunctionLabel {
  name: string;
}
