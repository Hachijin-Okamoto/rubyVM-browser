/* src/modules/bytecode/assembly-to-bytecode.ts */

import { ASSEMBLY } from "../constants";
import { OPCODES } from "../vm/constants";

// * 変数名をバイトコードに相互変換する用

const variableTable: Map<string, number> = new Map<string, number>();
let variableId: number = 0;
function getVariableId(name: string): number {
  if (!variableTable.has(name)) {
    variableTable.set(name, variableId++);
  }
  return variableTable.get(name)!;
}

// * ここまで

/**
 * アセンブリ風コードをバイトコードに変換する関数
 * @param assemblyLines 関数"generateAssembly"によって生成されたアセンブリ風コード
 * @returns バイトコード列（10進表記）
 */
export function assemblyToBytecode(assemblyLines: string[]): Uint8Array {
  const exceptLabelLines: string[] = [];
  const labelTable: Map<string, number> = new Map<string, number>();
  let labelAddress: number = 0;

  // ラベルの位置を保存
  for (const line of assemblyLines) {
    if (line.endsWith(":")) {
      const label: string = line.slice(0, -1);
      labelTable.set(label, labelAddress);
      continue;
    }

    const [instr, ...args] = line.split(" ");
    exceptLabelLines.push(line);

    if (instr === ASSEMBLY.STRING) {
      const _encoded: Uint8Array = new TextEncoder().encode(args.join(" "));
      labelAddress += 1 + 2 + _encoded.length;
    } else {
      labelAddress += 1 + args.length * 2;
    }
  }

  const bytes: number[] = [];

  for (const line of exceptLabelLines) {
    const [instr, ...args] = line.split(" ");

    const opcode: number = OPCODES[instr];
    if (opcode === undefined) {
      throw new Error(`Unknown instruction: ${instr}`);
    }

    bytes.push(opcode);

    // TODO:ここもうちょっときれいにする
    for (const arg of args) {
      let num: number;
      if (instr === ASSEMBLY.STRING) {
        const encoded: Uint8Array = new TextEncoder().encode(arg);
        bytes.push(encoded.length & 0xff);
        bytes.push((encoded.length >> 8) & 0xff);
        bytes.push(...encoded);
        continue;
      }

      if (instr === ASSEMBLY.FUNCTION_CALL) {
        if (!Number.isNaN(Number(arg))) {
          num = Number(arg);
        } else {
          num = labelTable.get(`LABEL_${arg}`)!;
        }
      } else if (!Number.isNaN(Number(arg))) {
        num = Number(arg);
      } else if (labelTable.has(arg)) {
        num = labelTable.get(arg)!;
      } else {
        num = getVariableId(arg);
      }

      // リトルエンディアン
      bytes.push(num & 0xff);
      bytes.push((num >> 8) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}
