/* src/modules/counter-map.ts */

import { assemblyLine } from "./assembly/interface/assemblyLine";

// バイトコードの何番目か：アセンブリ（ラベル含む）の何番目か
export const pcToAC: Map<number, number> = new Map();
export const labelToAc: Map<assemblyLine, number> = new Map();
