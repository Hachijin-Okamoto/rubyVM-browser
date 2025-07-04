declare module "https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@latest/+esm" {
  const Ruby: () => Promise<{
    eval(code: string): Promise<string>;
  }>;
  export default Ruby;
}
