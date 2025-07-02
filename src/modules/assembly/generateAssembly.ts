/* src/modules/assembly/generateAssembly.ts */

import { astNode } from "./interface";
import { ASSEMBLY } from "../constants";
import { getNewFuncLabel } from "./assembly-service";

// * ジャンプ命令に使用するラベルの作成用

let labelId: number = 0;
function getNewLabel(): string {
  return `LABEL_${labelId++}`;
}

// * ここまで

const functionTable: Map<string, string[]> = new Map<string, string[]>();

/* eslint-disable no-case-declarations */
export function generateAssembly(node: astNode): string[] {
  switch (node.type) {
    case "program_node":
      return generateAssembly(node.statements);

    case "statements_node":
      return node.body.flatMap(generateAssembly);

    case "integer_node":
      return [ASSEMBLY.NUMBER + ` ${node.value}`];

    case "call_node": {
      if (node.name === "exit") {
        return [ASSEMBLY.END];
      }
      const receiverCode: string[] = node.receiver
        ? generateAssembly(node.receiver)
        : [];
      const argsCode: string[] =
        node.arguments.arguments.flatMap(generateAssembly);

      if (functionTable.has(node.name)) {
        const funcInfo: string[] = functionTable.get(node.name)!;
        const argsCount: number = funcInfo.length;
        return [
          ...receiverCode,
          ...argsCode,
          `${ASSEMBLY.FUNCTION_CALL} ${node.name} ${argsCount}`,
        ];
      }

      switch (node.name) {
        case "+":
          return [...receiverCode, ...argsCode, ASSEMBLY.ADDITION];
        case "-":
          return [...receiverCode, ...argsCode, ASSEMBLY.SUBTRACTION];
        case "*":
          return [...receiverCode, ...argsCode, ASSEMBLY.MULTIPLICATION];
        case "/":
          return [...receiverCode, ...argsCode, ASSEMBLY.DIVISION];
        case "%":
          return [...receiverCode, ...argsCode, ASSEMBLY.REMAINDER];
        case "**":
          return [...receiverCode, ...argsCode, ASSEMBLY.POWER];
        case ">":
          return [...receiverCode, ...argsCode, ASSEMBLY.GREATER];
        case "<":
          return [...receiverCode, ...argsCode, ASSEMBLY.LESS];
        case ">=":
          return [...receiverCode, ...argsCode, ASSEMBLY.GREATER_EQUAL];
        case "<=":
          return [...receiverCode, ...argsCode, ASSEMBLY.LESS_EQUAL];
        case "==":
          return [...receiverCode, ...argsCode, ASSEMBLY.EQUAL];
        case "!=":
          return [...receiverCode, ...argsCode, ASSEMBLY.NOT_EQUAL];
        case "puts":
          return [...argsCode, ASSEMBLY.OUTPUT];
        case "print":
          return [...argsCode, ASSEMBLY.OUTPUT];
        case "[]=":
          return [...receiverCode, ...argsCode, ASSEMBLY.ARRAY_ASSIGNMENT];
        case "[]":
          return [...receiverCode, ...argsCode, ASSEMBLY.ARRAY_REFERRENCE];
        case "shuffle":
          return [...argsCode, ASSEMBLY.SHUFFLE];
        default:
          return [
            ...receiverCode,
            ...argsCode,
            ASSEMBLY.FUNCTION_CALL + ` ${node.name}`,
          ];
      }
    }

    case "arguments_node":
      return node.arguments.flatMap(generateAssembly);

    case "local_variable_write_node":
      const valueCode: string[] = generateAssembly(node.value);
      return [...valueCode, ASSEMBLY.ASSIGNMENT + ` ${node.name}`];

    case "local_variable_read_node":
      return [ASSEMBLY.REFERENCE + ` ${node.name}`];

    case "if_node":
      const conditionCode: string[] = generateAssembly(node.predicate);
      const bodyCode: string[] = generateAssembly(node.statements);

      const endLabel: string = getNewLabel();

      return [
        ...conditionCode,
        ASSEMBLY.JUMP_IF_FALSE + ` ${endLabel}`,
        ...bodyCode,
        `${endLabel}:`,
      ];

    case "for_node":
      const indexName: string = node.index.name;
      const indexCode: string[] = generateAssembly({
        type: "local_variable_read_node",
        name: indexName,
      });
      const startCode: string[] = generateAssembly(node.collection.left);
      const endCode: string[] = generateAssembly(node.collection.right);
      const _bodyCode: string[] = generateAssembly(node.statements);

      const loopStartLabel: string = getNewLabel();
      const loopEndLabel: string = getNewLabel();

      return [
        ...startCode,
        ASSEMBLY.ASSIGNMENT + ` ${indexName}`,
        `${loopStartLabel}:`,
        ...indexCode,
        ...endCode,
        ASSEMBLY.LESS_EQUAL,
        ASSEMBLY.JUMP_IF_FALSE + ` ${loopEndLabel}`,
        ..._bodyCode,
        ...indexCode,
        ASSEMBLY.NUMBER + " 1",
        ASSEMBLY.ADDITION,
        ASSEMBLY.ASSIGNMENT + ` ${indexName}`,
        ASSEMBLY.JUMP + ` ${loopStartLabel}`,
        `${loopEndLabel}:`,
      ];

    case "range_node":
      return [];

    case "while_node":
      const _loopStartLabel: string = getNewLabel();
      const _loopEndLabel: string = getNewLabel();
      const predicateCode: string[] = generateAssembly(node.predicate);
      const __bodyCode: string[] = generateAssembly(node.statements);

      return [
        `${_loopStartLabel}:`,
        ...predicateCode,
        ASSEMBLY.JUMP_IF_FALSE + ` ${_loopEndLabel}`,
        ...__bodyCode,
        ASSEMBLY.JUMP + ` ${_loopStartLabel}`,
        `${_loopEndLabel}:`,
      ];

    case "string_node":
      const stringValue: string = node.unescaped;
      return [ASSEMBLY.STRING + ` ${stringValue}`];

    case "def_node":
      functionTable.set(
        node.name,
        node.parameters.requireds.map((param) => param.name),
      );
      const functionDefnitionLabel: string = getNewFuncLabel(node.name);
      const ___bodyCode: string[] = generateAssembly(node.body);
      return [`${functionDefnitionLabel}:`, ...___bodyCode]; // 常にreturn文が書かれているという想定

    case "return_node": {
      const returnValueCode: string[] = generateAssembly(node.arguments);
      return [...returnValueCode, ASSEMBLY.RETURN];
    }

    case "array_node": {
      const elementsCode: string[] = node.elements.flatMap((element: astNode) =>
        generateAssembly(element),
      );
      return [
        ...elementsCode,
        ASSEMBLY.ARRAY_DEFINITION + ` ${node.elements.length}`,
      ];
    }
    default:
      throw new Error(`Unknown node type:${node.type}`);
  }
}
