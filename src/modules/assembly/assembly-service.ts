/* src/modules/assembly/assembly-service.ts */

/**
 * 関数周りに使用するラベルの作成用
 * @param name 関数名
 * @returns ラベル（関数名を平文で含む）
 */
export function getNewFuncLabel(name: string): string {
  return `LABEL_${name}`;
}