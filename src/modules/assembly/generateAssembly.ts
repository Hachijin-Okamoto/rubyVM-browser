/* src/modules/assembly/generateAssembly.ts */

import { astNode } from "./interface/astNode";
import { ASSEMBLY } from "../constants";
import { getNewFuncLabel, getNewLabel } from "./assembly-service";
import {
  assemblyLine,
  Instruction,
  FunctionCall,
  LoopLabel,
  FunctionLabel,
} from "./interface/assemblyLine";

// key: 関数名 value: 引数の数
const functionTable: Map<string, string[]> = new Map<string, string[]>();

/**
 * ASTからアセンブリ列に変換する関数
 * @param node ASTのjsonファイルをnode型に変換したもの
 * @returns アセンブリ列
 */
export function generateAssembly(node: astNode): assemblyLine[] {
  switch (node.type) {
    case "program_node": {
      return generateAssembly(node.statements);
    }

    case "statements_node": {
      return node.body.flatMap(generateAssembly);
    }

    case "integer_node": {
      return [
        {
          type: "instruction",
          name: ASSEMBLY.NUMBER,
          value: node.value,
        } as Instruction,
      ];
    }
    case "call_node": {
      if (node.name === "exit") {
        return [{ type: "instruction", name: ASSEMBLY.END } as Instruction];
      }

      const receiverCode: assemblyLine[] = node.receiver
        ? generateAssembly(node.receiver)
        : [];
      const argsCode: assemblyLine[] =
        node.arguments.arguments.flatMap(generateAssembly);

      if (functionTable.has(node.name)) {
        const funcInfo: string[] = functionTable.get(node.name)!;
        const argsCount: number = funcInfo.length;
        return [
          ...receiverCode,
          ...argsCode,
          {
            type: "function_call",
            name: ASSEMBLY.FUNCTION_CALL,
            functionName: node.name,
            argumentCount: argsCount,
          } as FunctionCall,
        ];
      }

      switch (node.name) {
        case "+":
          return [
            ...receiverCode,
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.ADDITION } as Instruction,
          ];
        case "-":
          return [
            ...receiverCode,
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.SUBTRACTION } as Instruction,
          ];
        case "*":
          return [
            ...receiverCode,
            ...argsCode,
            {
              type: "instruction",
              name: ASSEMBLY.MULTIPLICATION,
            } as Instruction,
          ];
        case "/":
          return [
            ...receiverCode,
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.DIVISION } as Instruction,
          ];
        case "%":
          return [
            ...receiverCode,
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.REMAINDER } as Instruction,
          ];
        case "**":
          return [
            ...receiverCode,
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.POWER } as Instruction,
          ];
        case ">":
          return [
            ...receiverCode,
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.GREATER } as Instruction,
          ];
        case "<":
          return [
            ...receiverCode,
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.LESS } as Instruction,
          ];
        case ">=":
          return [
            ...receiverCode,
            ...argsCode,
            {
              type: "instruction",
              name: ASSEMBLY.GREATER_EQUAL,
            } as Instruction,
          ];
        case "<=":
          return [
            ...receiverCode,
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.LESS_EQUAL } as Instruction,
          ];
        case "==":
          return [
            ...receiverCode,
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.EQUAL } as Instruction,
          ];
        case "!=":
          return [
            ...receiverCode,
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.NOT_EQUAL } as Instruction,
          ];
        case "puts":
          return [
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.OUTPUT } as Instruction,
          ];
        case "print":
          return [
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.OUTPUT } as Instruction,
          ];
        case "[]=":
          return [
            ...receiverCode,
            ...argsCode,
            {
              type: "instruction",
              name: ASSEMBLY.ARRAY_ASSIGNMENT,
            } as Instruction,
          ];
        case "[]":
          return [
            ...receiverCode,
            ...argsCode,
            {
              type: "instruction",
              name: ASSEMBLY.ARRAY_REFERRENCE,
            } as Instruction,
          ];
        case "shuffle":
          return [
            ...argsCode,
            { type: "instruction", name: ASSEMBLY.SHUFFLE } as Instruction,
          ];
        default:
          return [
            ...receiverCode,
            ...argsCode,
            {
              type: "instruction",
              name: ASSEMBLY.FUNCTION_CALL,
              value: node.name,
            } as Instruction,
          ];
      }
    }

    case "arguments_node": {
      return node.arguments.flatMap(generateAssembly);
    }

    case "local_variable_write_node": {
      const valueCode: assemblyLine[] = generateAssembly(node.value);
      return [
        ...valueCode,
        {
          type: "instruction",
          name: ASSEMBLY.ASSIGNMENT,
          value: node.name,
        } as Instruction,
      ];
    }

    case "local_variable_read_node": {
      return [
        {
          type: "instruction",
          name: ASSEMBLY.REFERENCE,
          value: node.name,
        } as Instruction,
      ];
    }

    case "if_node": {
      const conditionCode: assemblyLine[] = generateAssembly(node.predicate);
      const bodyCode: assemblyLine[] = generateAssembly(node.statements);

      const endLabel: LoopLabel = getNewLabel();

      return [
        ...conditionCode,
        {
          type: "instruction",
          name: ASSEMBLY.JUMP_IF_FALSE,
          value: endLabel,
        } as Instruction,
        ...bodyCode,
        endLabel,
      ];
    }

    case "for_node": {
      const indexName: string = node.index.name;
      const indexCode: assemblyLine[] = generateAssembly({
        type: "local_variable_read_node",
        name: indexName,
      });
      const startCode: assemblyLine[] = generateAssembly(node.collection.left);
      const endCode: assemblyLine[] = generateAssembly(node.collection.right);
      const bodyCode: assemblyLine[] = generateAssembly(node.statements);

      const loopStartLabel: LoopLabel = getNewLabel();
      const loopEndLabel: LoopLabel = getNewLabel();

      return [
        ...startCode,
        {
          type: "instruction",
          name: ASSEMBLY.ASSIGNMENT,
          value: indexName,
        } as Instruction,
        loopStartLabel,
        ...indexCode,
        ...endCode,
        { type: "instruction", name: ASSEMBLY.LESS_EQUAL } as Instruction,
        {
          type: "instruction",
          name: ASSEMBLY.JUMP_IF_FALSE,
          value: loopEndLabel,
        } as Instruction,
        ...bodyCode,
        ...indexCode,
        { type: "instruction", name: ASSEMBLY.NUMBER, value: 1 } as Instruction,
        { type: "instruction", name: ASSEMBLY.ADDITION } as Instruction,
        {
          type: "instruction",
          name: ASSEMBLY.ASSIGNMENT,
          value: indexName,
        } as Instruction,
        {
          type: "instruction",
          name: ASSEMBLY.JUMP,
          value: loopStartLabel,
        } as Instruction,
        loopEndLabel,
      ];
    }

    case "range_node": {
      return [];
    }

    case "while_node": {
      const loopStartLabel: LoopLabel = getNewLabel();
      const loopEndLabel: LoopLabel = getNewLabel();
      const predicateCode: assemblyLine[] = generateAssembly(node.predicate);
      const bodyCode: assemblyLine[] = generateAssembly(node.statements);

      return [
        loopStartLabel,
        ...predicateCode,
        {
          type: "instruction",
          name: ASSEMBLY.JUMP_IF_FALSE,
          value: loopEndLabel,
        } as Instruction,
        ...bodyCode,
        {
          type: "instruction",
          name: ASSEMBLY.JUMP,
          value: loopStartLabel,
        } as Instruction,
        loopEndLabel,
      ];
    }

    case "string_node": {
      const stringValue: string = node.unescaped;
      return [
        {
          type: "instruction",
          name: ASSEMBLY.STRING,
          value: stringValue,
        } as Instruction,
      ];
    }

    case "def_node": {
      functionTable.set(
        node.name,
        node.parameters.requireds.map((param) => param.name),
      );
      const functionDefnitionLabel: FunctionLabel = getNewFuncLabel(node.name);
      const bodyCode: assemblyLine[] = generateAssembly(node.body);
      return [functionDefnitionLabel, ...bodyCode]; // 常にreturn文が書かれているという想定
    }

    case "return_node": {
      const returnValueCode: assemblyLine[] = generateAssembly(node.arguments);
      return [
        ...returnValueCode,
        { type: "instruction", name: ASSEMBLY.RETURN } as Instruction,
      ];
    }

    case "array_node": {
      const elementsCode: assemblyLine[] = node.elements.flatMap(
        (element: astNode) => generateAssembly(element),
      );
      return [
        ...elementsCode,
        {
          type: "instruction",
          name: ASSEMBLY.ARRAY_DEFINITION,
          value: node.elements.length,
        } as Instruction,
      ];
    }
    default:
      throw new Error(`Unknown node type:${node.type}`);
  }
}
