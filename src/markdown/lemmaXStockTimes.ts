import { getLemmaXStockTimes } from "../data/getLemmaXStockTimes";

export function mdLemmaXStockTimes(
  time: ReturnType<typeof getLemmaXStockTimes>
) {
  let markdown = `# Lemma vs Stock times\n`;

  Object.entries(time).forEach(([name, times]) => {
    markdown += `- ${name}\n`;

    markdown += `-- Lemma: ${times.lemma.toFixed(2)}${
      times.lemma === Infinity ? "" : "s"
    }\n`;
    markdown += `-- Stock: ${times.stock.toFixed(2)}${
      times.stock === Infinity ? "" : "s"
    }\n`;
  });

  return markdown;
}
