/* src/main.ts */ 

import { generateAssembly } from "./modules/assembly/generateAssembly";

const jsonInput: HTMLTextAreaElement = document.getElementById("jsonInput") as HTMLTextAreaElement;
const runButton: HTMLButtonElement = document.getElementById("runButton") as HTMLButtonElement;

const assemblyOutput: HTMLElement = document.getElementById("assemblyOutput")!;
const bytecodeOutput: HTMLElement = document.getElementById("bytecodeOutput")!;
const resultOutput: HTMLElement = document.getElementById("resultOutput")!;

runButton.addEventListener("click", () => {

    const ast_data = JSON.parse(jsonInput.value);

    assemblyOutput.textContent = generateAssembly(ast_data).join("\n");
})