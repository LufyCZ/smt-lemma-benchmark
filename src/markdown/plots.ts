import { readdirSync } from "fs";

export function mdPlots(finalDir: string, config: string) {
  let markdown = `## Plots\n`;

  readdirSync(`${finalDir}/${config}`).forEach((entry) => {
    if (!entry.endsWith(".png")) {
      return;
    }

    if (entry.includes("---")) {
      const [one, two] = entry.split("---");
      markdown += `### ${one} vs ${two}\n`;
    } else {
      markdown += `### ${entry}\n`;
    }

    markdown += `
![plot](./${config}/${entry} "plot")\n`;
  });

  return markdown;
}
