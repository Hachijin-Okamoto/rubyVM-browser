/* modules/vm/interface/VMLog.ts */

/* eslint-disable @typescript-eslint/no-explicit-any */
export type VMLogEntry = {
  step: number; // VMの実行が累計何回目か
  ac: number; // アセンブリ列の何列目か
  pc: number; // バイトコード列の何列目か
  opcode: number;
  stackSnapshot: (number | string | any[])[];
  envSnapshot?: any[];
  poppedValues?: any[];
  pushedValue?: any[];
  description?: string;
};
