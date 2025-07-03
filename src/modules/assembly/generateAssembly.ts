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
      return [{ name: ASSEMBLY.NUMBER, value: node.value } as Instruction];
    }
    case "call_node": {
      if (node.name === "exit") {
        return [{ name: ASSEMBLY.END } as Instruction];
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
            { name: ASSEMBLY.ADDITION } as Instruction,
          ];
        case "-":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.SUBTRACTION } as Instruction,
          ];
        case "*":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.MULTIPLICATION } as Instruction,
          ];
        case "/":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.DIVISION } as Instruction,
          ];
        case "%":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.REMAINDER } as Instruction,
          ];
        case "**":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.POWER } as Instruction,
          ];
        case ">":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.GREATER } as Instruction,
          ];
        case "<":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.LESS } as Instruction,
          ];
        case ">=":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.GREATER_EQUAL } as Instruction,
          ];
        case "<=":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.LESS_EQUAL } as Instruction,
          ];
        case "==":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.EQUAL } as Instruction,
          ];
        case "!=":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.NOT_EQUAL } as Instruction,
          ];
        case "puts":
          return [...argsCode, { name: ASSEMBLY.OUTPUT } as Instruction];
        case "print":
          return [...argsCode, { name: ASSEMBLY.OUTPUT } as Instruction];
        case "[]=":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.ARRAY_ASSIGNMENT } as Instruction,
          ];
        case "[]":
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.ARRAY_REFERRENCE } as Instruction,
          ];
        case "shuffle":
          return [...argsCode, { name: ASSEMBLY.SHUFFLE } as Instruction];
        default:
          return [
            ...receiverCode,
            ...argsCode,
            { name: ASSEMBLY.FUNCTION_CALL, value: node.name } as Instruction,
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
        { name: ASSEMBLY.ASSIGNMENT, value: node.name } as Instruction,
      ];
    }

    case "local_variable_read_node": {
      return [{ name: ASSEMBLY.REFERENCE, value: node.name } as Instruction];
    }

    case "if_node": {
      const conditionCode: assemblyLine[] = generateAssembly(node.predicate);
      const bodyCode: assemblyLine[] = generateAssembly(node.statements);

      const endLabel: LoopLabel = getNewLabel();

      return [
        ...conditionCode,
        { name: ASSEMBLY.JUMP_IF_FALSE, value: endLabel } as Instruction,
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
        { name: ASSEMBLY.ASSIGNMENT, value: indexName } as Instruction,
        loopStartLabel,
        ...indexCode,
        ...endCode,
        { name: ASSEMBLY.LESS_EQUAL } as Instruction,
        { name: ASSEMBLY.JUMP_IF_FALSE, value: loopEndLabel } as Instruction,
        ...bodyCode,
        ...indexCode,
        { name: ASSEMBLY.NUMBER, value: 1 } as Instruction,
        { name: ASSEMBLY.ADDITION } as Instruction,
        { name: ASSEMBLY.ASSIGNMENT, value: indexName } as Instruction,
        { name: ASSEMBLY.JUMP, value: loopStartLabel } as Instruction,
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
        { name: ASSEMBLY.JUMP_IF_FALSE, value: loopEndLabel } as Instruction,
        ...bodyCode,
        { name: ASSEMBLY.JUMP, value: loopStartLabel } as Instruction,
        loopEndLabel,
      ];
    }

    case "string_node": {
      const stringValue: string = node.unescaped;
      return [{ name: ASSEMBLY.STRING, value: stringValue } as Instruction];
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
      return [...returnValueCode, { name: ASSEMBLY.RETURN } as Instruction];
    }

    case "array_node": {
      const elementsCode: assemblyLine[] = node.elements.flatMap(
        (element: astNode) => generateAssembly(element),
      );
      return [
        ...elementsCode,
        {
          name: ASSEMBLY.ARRAY_DEFINITION,
          value: node.elements.length,
        } as Instruction,
      ];
    }
    default:
      throw new Error(`Unknown node type:${node.type}`);
  }
}
