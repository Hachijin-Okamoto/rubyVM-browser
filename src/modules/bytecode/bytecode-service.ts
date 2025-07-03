/* src/modules/bytecode/bytecode-service.ts */

import { assemblyLine } from "../assembly/interface/assemblyLine";
import { ASSEMBLY } from "../constants";

const variableTable: Map<string, number> = new Map<string, number>();
let variableId: number = 0;

/**
 * 変数名を数値idとして対応付けする関数
 *  @param name 変数名
 *  @return 数値id
 */
export function getVariableId(name: string): number {
  if (!variableTable.has(name)) {
    variableTable.set(name, variableId++);
  }
  return variableTable.get(name)!;
}

export function calcInstrBytes(instruction: assemblyLine): number {
  switch (instruction.type) {
    case "instruction": {
      if (instruction.name === ASSEMBLY.STRING) {
        return (
          3 + new TextEncoder().encode(instruction.value! as string).length
        );
      }
      return instruction.value === null ? 1 : 3;
    }

    case "function_call": {
      return 5;
    }

    default: {
      return NaN;
    }
  }
}
