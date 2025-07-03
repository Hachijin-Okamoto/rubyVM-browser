/* src/modules/bytecode/assembly-to-bytecode.ts */

import {
  assemblyLine,
  FunctionLabel,
} from "../assembly/interface/assemblyLine";
import { ASSEMBLY } from "../constants";
import { OPCODES } from "../vm/constants";
import { getVariableId, calcInstrBytes } from "./bytecode-service";

/**
 * アセンブリ風コードをバイトコードに変換する関数
 * @param assemblyLines 関数"generateAssembly"によって生成されたアセンブリ風コード
 * @returns バイトコード列（10進表記）
 */
export function assemblyToBytecode(assemblyLines: assemblyLine[]): Uint8Array {
  const exceptLabelLines: assemblyLine[] = [];
  const labelTable: Map<assemblyLine, number> = new Map<assemblyLine, number>();
  let labelAddress: number = 0;

  // ラベルの位置を計算・保存
  for (const line of assemblyLines) {
    console.log(line.type);
    if (line.type === "loop_label" || line.type === "function_label") {
      labelTable.set(line, labelAddress);
      continue;
    }

    exceptLabelLines.push(line);

    labelAddress += calcInstrBytes(line);
  }

  // 実際に変換
  const bytes: number[] = [];
  for (const line of exceptLabelLines) {
    const opcode: number = OPCODES[line.name];
    if (opcode === undefined) {
      throw new Error(`Unknown instruction: ${line.name}`);
    }

    bytes.push(opcode);

    let oprand: number;
    if (line.type === "instruction") {
      if (line.value === undefined) {
        continue;
      } else if (line.name === ASSEMBLY.STRING) {
        const encoded: Uint8Array = new TextEncoder().encode(
          line.value as string,
        );
        bytes.push(encoded.length & 0xff);
        bytes.push((encoded.length >> 8) & 0xff);
        bytes.push(...encoded);
        continue;
      } else {
        if (!Number.isNaN(Number(line.value))) {
          oprand = Number(line.value);
        } else {
          oprand = getVariableId(line.value as string);
        }
      }
    }
    // TODO:ここ直す
    else if (line.type === "function_call") {
      oprand = labelTable.get({
        type: "function_label",
        name: line.functionName,
      } as FunctionLabel)!;
      bytes.push(oprand & 0xff);
      bytes.push((oprand >> 8) & 0xff);

      oprand = line.argumentCount;
      bytes.push(oprand & 0xff);
      bytes.push((oprand >> 8) & 0xff);
      continue;
    } else {
      throw new Error(`Unknown assembly type: ${line.type}`);
    }

    // リトルエンディアン
    bytes.push(oprand & 0xff);
    bytes.push((oprand >> 8) & 0xff);
  }

  console.log(bytes);
  return new Uint8Array(bytes);
}
