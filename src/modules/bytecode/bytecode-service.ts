/* src/modules/bytecode/bytecode-service.ts */

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
