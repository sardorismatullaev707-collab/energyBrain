// Structured logging utilities

export function logHeader(text: string): void {
  console.log("\n" + "=".repeat(60));
  console.log(text);
  console.log("=".repeat(60));
}

export function logSection(text: string): void {
  console.log("\n" + "-".repeat(60));
  console.log(text);
  console.log("-".repeat(60));
}

export function logKeyValue(key: string, value: string | number): void {
  console.log(`  ${key.padEnd(20)}: ${value}`);
}

export function logJson(label: string, obj: unknown): void {
  console.log(`${label}:`, JSON.stringify(obj, null, 2));
}
