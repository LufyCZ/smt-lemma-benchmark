import { getRuntimes } from "../data/getRuntime";

export function mdRuntimes(runtimes: ReturnType<typeof getRuntimes>) {
  let markdown = `## Runtimes\n`;
  Object.entries(runtimes).forEach(([type, runtime]) => {
    markdown += `- ${type}: ${runtime.toFixed(2)}\n`;
  });

  return markdown;
}
