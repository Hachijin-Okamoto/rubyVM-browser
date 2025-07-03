/* src/modules/bytecode/assembly-to-bytecode.ts */

import {
  assemblyLine,
  FunctionLabel,
} from "../assembly/interface/assemblyLine";
import { ASSEMBLY } from "../constants";
import { OPCODES } from "../vm/interface/constants";
import { getVariableId, calcInstrBytes } from "./bytecode-service";
import { pcToAC, labelToAc } from "../counter-map";

/**
 * アセンブリ風コードをバイトコードに変換する関数
 * @param assemblyLines 関数"generateAssembly"によって生成されたアセンブリ風コード
 * @returns バイトコード列（10進表記）
 */
export function assemblyToBytecode(assemblyLines: assemblyLine[]): Uint8Array {
  const exceptLabelLines: assemblyLine[] = [];
  const labelTable: Map<string, number> = new Map<string, number>();
  let labelAddress: number = 0;

  // ラベルの位置を計算・保存

  for (let i: number = 0; i < assemblyLines.length; i++) {
    const line: assemblyLine = assemblyLines[i];
    if (line.type === "loop_label" || line.type === "function_label") {
      labelTable.set(line.name, labelAddress);
      labelToAc.set(line, i);
      continue;
    }

    exceptLabelLines.push(line);

    labelAddress += calcInstrBytes(line);
  }
  /*for (const line of assemblyLines) {
    if (line.type === "loop_label" || line.type === "function_label") {
      labelTable.set(line, labelAddress);
      continue;
    }

    exceptLabelLines.push(line);

    labelAddress += calcInstrBytes(line);
  }*/

  let pc: number = 0;
  // 実際に変換
  const bytes: number[] = [];
  for (let i = 0; i < assemblyLines.length; i++) {
    const line: assemblyLine = assemblyLines[i];

    if (line.type === "loop_label" || line.type === "function_label") {
      continue;
    }

    const opcode: number = OPCODES[line.name];
    if (opcode === undefined) {
      throw new Error(`Unknown instruction: ${line.name}`);
    }
    bytes.push(opcode);

    pcToAC.set(pc, i);
    pc++;

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
        pc += 2 + encoded.length;
        continue;
      } else if (
        typeof line.value === "object" &&
        line.value !== null &&
        (line.value as any).type === "loop_label"
      ) {
        oprand = labelTable.get(line.value.name)!;
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
      oprand = labelTable.get(line.functionName)!;
      bytes.push(oprand & 0xff);
      bytes.push((oprand >> 8) & 0xff);
      pc += 2;

      oprand = line.argumentCount;
      bytes.push(oprand & 0xff);
      bytes.push((oprand >> 8) & 0xff);
      pc += 2;
      continue;
    } else {
      throw new Error(`Unknown assembly type`);
    }

    // リトルエンディアン
    bytes.push(oprand & 0xff);
    bytes.push((oprand >> 8) & 0xff);
    pc += 2;
  }

  return new Uint8Array(bytes);
}
