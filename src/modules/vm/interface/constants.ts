import { ASSEMBLY } from "../../constants";

export const OPCODES: Record<string, number> = {
  [ASSEMBLY.ADDITION]: 0x01,
  [ASSEMBLY.SUBTRACTION]: 0x02,
  [ASSEMBLY.MULTIPLICATION]: 0x03,
  [ASSEMBLY.DIVISION]: 0x04,
  [ASSEMBLY.REMAINDER]: 0x05,
  [ASSEMBLY.POWER]: 0x06,
  [ASSEMBLY.GREATER]: 0x07,
  [ASSEMBLY.LESS]: 0x08,
  [ASSEMBLY.GREATER_EQUAL]: 0x09,
  [ASSEMBLY.LESS_EQUAL]: 0x0a, // 10
  [ASSEMBLY.EQUAL]: 0x0b,
  [ASSEMBLY.NOT_EQUAL]: 0x0c,
  [ASSEMBLY.ASSIGNMENT]: 0x0d,
  [ASSEMBLY.REFERENCE]: 0x0e,
  [ASSEMBLY.JUMP]: 0x0f,
  [ASSEMBLY.JUMP_IF_FALSE]: 0x10,
  // 17
  [ASSEMBLY.RETURN]: 0x12,
  [ASSEMBLY.FUNCTION_CALL]: 0x13,
  [ASSEMBLY.NUMBER]: 0x14,
  [ASSEMBLY.STRING]: 0x15,
  [ASSEMBLY.OUTPUT]: 0x16,
  [ASSEMBLY.ARRAY_DEFINITION]: 0x17,
  [ASSEMBLY.ARRAY_ASSIGNMENT]: 0x18,
  [ASSEMBLY.ARRAY_REFERRENCE]: 0x19,
  [ASSEMBLY.SHUFFLE]: 0x1a, //26
  [ASSEMBLY.END]: 0xff,
} as const;

export const OPCODE_NAMES: Record<number, string> = Object.entries(
  OPCODES,
).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<number, string>,
);
