/* modules/vm/myVM.ts */

import { ASSEMBLY } from "../constants";
import { OPCODES, OPCODE_NAMES } from "./interface/constants";
import { VMLogEntry } from "./interface/VMLog";
import { pcToAC } from "../counter-map";
import {
  variableTable,
  invertVariableTable,
} from "../bytecode/bytecode-service";

/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export class MyVM {
  pc: number;
  stack: (number | string | any[])[] = [];
  code: Uint8Array;
  envStack: Array<number[]> = [];
  callStack: number[] = [];
  variableTable: Map<number, string> = new Map();

  // スタックの中身表示用
  logs: VMLogEntry[] = [];
  lastInstructionInfo: any;

  constructor(code: Uint8Array) {
    this.code = code;
    this.pc = this.findStart();
    this.envStack.push([]);
    this.variableTable = invertVariableTable(variableTable);
  }

  findStart(): number {
    for (let i: number = this.code.length - 1; i >= 0; i--) {
      if (this.code[i] === OPCODES[ASSEMBLY.RETURN]) {
        return i + 1;
      }
    }
    return 0;
  }

  runWithLog(): {
    result: (number | string | any[])[];
    stackLogs: VMLogEntry[];
  } {
    const result: (number | string | any[])[] = [];
    let stepCounter: number = 0;
    while (this.pc < this.code.length) {
      const currentPC: number = this.pc;
      const opcode: number = this.code[this.pc++];

      //console.log(this.stack);
      //console.log(this.envStack);
      //console.log("pc:", this.pc - 1, " opcode:", opcode.toString(16));

      const output: number | string | any[] = this.execute(opcode)!;
      if (output !== undefined) {
        result.push(output);
      }

      this.logs.push({
        step: stepCounter++,
        ac: pcToAC.get(currentPC)!,
        pc: this.pc,
        opcode,
        stackSnapshot: [...this.stack],
        envSnapshot: this.envStack.map((e) => ({ ...e })),
        ...this.lastInstructionInfo,
      });
    }

    return { result, stackLogs: this.logs };
  }

  private execute(opcode: number): number | string | any[] | undefined {
    switch (opcode) {
      case OPCODES[ASSEMBLY.NUMBER]:
        const val: number = this.readInt16();
        this.stack.push(val);

        this.lastInstructionInfo = { pushedValue: val };
        break;

      case OPCODES[ASSEMBLY.STRING]: {
        const len: number = this.readInt16();
        const strBytes: Uint8Array = this.code.slice(this.pc, this.pc + len);
        this.pc += len;
        const str: string = new TextDecoder().decode(strBytes);
        (this.stack as (number | string)[]).push(str);

        this.lastInstructionInfo = { pushedValue: str };
        break;
      }

      case OPCODES[ASSEMBLY.ADDITION]:
      case OPCODES[ASSEMBLY.SUBTRACTION]:
      case OPCODES[ASSEMBLY.MULTIPLICATION]:
      case OPCODES[ASSEMBLY.DIVISION]:
      case OPCODES[ASSEMBLY.REMAINDER]:
      case OPCODES[ASSEMBLY.POWER]:
      case OPCODES[ASSEMBLY.GREATER]:
      case OPCODES[ASSEMBLY.LESS]:
      case OPCODES[ASSEMBLY.GREATER_EQUAL]:
      case OPCODES[ASSEMBLY.LESS_EQUAL]:
      case OPCODES[ASSEMBLY.EQUAL]:
      case OPCODES[ASSEMBLY.NOT_EQUAL]: {
        const b: number = this.stack.pop()! as number;
        const a: number = this.stack.pop()! as number;
        const result: number = this.calc(a, b, opcode);
        this.stack.push(result);

        this.lastInstructionInfo = {
          poppedValues: [a, b],
          pushedValue: [result],
          description: `${OPCODE_NAMES[opcode]} : ${a} ${b} -> ${result}`,
        };
        break;
      }

      case OPCODES[ASSEMBLY.ASSIGNMENT]:
        const value: number = this.stack.pop()! as number;
        const variableId: number = this.readInt16();
        this.envStack[this.envStack.length - 1][variableId] = value!;

        this.lastInstructionInfo = {
          poppedValues: value,
          description: `${this.variableTable.get(variableId)} <- ${value}`,
        };
        break;

      // TODO:ここの変数命名何とかする（上と被り）
      case OPCODES[ASSEMBLY.REFERENCE]:
        const _variableId: number = this.readInt16();
        const _val: number =
          this.envStack[this.envStack.length - 1][_variableId];
        this.stack.push(_val);

        this.lastInstructionInfo = { pushedValue: _val };
        break;

      case OPCODES[ASSEMBLY.JUMP]:
        const address: number = this.readInt16();
        this.pc = address;

        this.lastInstructionInfo = { description: `jump to ${address}` };
        break;

      case OPCODES[ASSEMBLY.JUMP_IF_FALSE]:
        const _address: number = this.readInt16();
        const condition: number = this.stack.pop()! as number;
        if (condition === 0) {
          this.pc = _address;
        }

        this.lastInstructionInfo = {
          poppedValues: condition,
          description: `jump if poppedValue is 0 to ${_address}`,
        };
        break;

      case OPCODES[ASSEMBLY.RETURN]:
        if (this.callStack.length === 0) {
          throw new Error("Call stack underflow");
        }
        this.envStack.pop();
        this.pc = this.callStack.pop()!;
        break;

      case OPCODES[ASSEMBLY.FUNCTION_CALL]:
        const targetAddress: number = this.readInt16();
        const argsCount: number = this.readInt16();

        /*
          const newEnv: { [key: number]: number } = {};

          for (let i: number = 0; i < argsCount; i++) {
            newEnv[i] = this.stack.pop()!;
          }

          this.envStack.push(newEnv);
          /*/
        const newEnv: number[] = [];

        for (let i: number = argsCount - 1; i >= 0; i--) {
          newEnv[i] = this.stack.pop()! as number;
        }

        this.envStack.push(newEnv);
        //*/

        this.callStack.push(this.pc);
        this.pc = targetAddress;
        break;

      case OPCODES[ASSEMBLY.OUTPUT]:
        return this.stack.pop()!;

      case OPCODES[ASSEMBLY.ARRAY_DEFINITION]:
        const length: number = this.readInt16();
        const newArray: any[] = [];
        for (let i: number = 0; i < length; i++) {
          newArray.unshift(this.stack.pop());
        }
        this.stack.push(newArray);
        break;

      case OPCODES[ASSEMBLY.ARRAY_ASSIGNMENT]:
        const valueSet: number | string = this.stack.pop()! as number | string;
        const indexSet: number = this.stack.pop()! as number;
        const targetArraySet: any[] = this.stack.pop()! as any[];
        targetArraySet[indexSet] = valueSet;
        break;

      case OPCODES[ASSEMBLY.ARRAY_REFERRENCE]:
        const indexGet: number = this.stack.pop()! as number;
        const targetArrayGet: any[] = this.stack.pop()! as any[];
        this.stack.push(targetArrayGet[indexGet]);
        break;

      case OPCODES[ASSEMBLY.SHUFFLE]:
        const targetArrayShuffle: any[] = this.stack.pop()! as any[];
        const _newArray: any[] = [...targetArrayShuffle];
        for (let i: number = _newArray.length - 1; i > 0; i--) {
          const j: number = Math.floor(Math.random() * (i + 1));
          [_newArray[i], _newArray[j]] = [_newArray[j], _newArray[i]];
        }
        this.stack.push(_newArray);
        break;

      case OPCODES[ASSEMBLY.END]:
        return;

      default:
        throw new Error(`Unknown opcode: ${opcode}`);
    }
  }

  private readInt16(): number {
    const bytes: Uint8Array = this.code.slice(this.pc, this.pc + 2);
    this.pc += 2;
    return bytes[0] | (bytes[1] << 8);
  }

  private calc(x: number, y: number, opcode: number): number {
    switch (opcode) {
      case OPCODES[ASSEMBLY.ADDITION]:
        return x + y;
      case OPCODES[ASSEMBLY.SUBTRACTION]:
        return x - y;
      case OPCODES[ASSEMBLY.MULTIPLICATION]:
        return x * y;
      case OPCODES[ASSEMBLY.DIVISION]:
        return x / y;
      case OPCODES[ASSEMBLY.REMAINDER]:
        return x % y;
      case OPCODES[ASSEMBLY.POWER]:
        return x ** y;
      case OPCODES[ASSEMBLY.GREATER]:
        return x > y ? 1 : 0;
      case OPCODES[ASSEMBLY.LESS]:
        return x < y ? 1 : 0;
      case OPCODES[ASSEMBLY.GREATER_EQUAL]:
        return x >= y ? 1 : 0;
      case OPCODES[ASSEMBLY.LESS_EQUAL]:
        return x <= y ? 1 : 0;
      case OPCODES[ASSEMBLY.EQUAL]:
        return x == y ? 1 : 0;
      case OPCODES[ASSEMBLY.NOT_EQUAL]:
        return x != y ? 1 : 0;
      default:
        throw new Error(`Unkown opcode:${opcode}`);
    }
  }
}
