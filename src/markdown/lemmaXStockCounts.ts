import { getLemmaXStockCount } from "../data/getLemmaXStockCounts";

export function mdLemmaXStockCounts(
  counts: ReturnType<typeof getLemmaXStockCount>
) {
  let markdown = "## Lemma X Stock Counts\n";
  markdown += `- Times when a formula was solved with lemmas but not without them: ${counts.lemma.count}\n`;
  markdown += Array.from(counts.lemma.formulas.keys())
    .map(
      (f) =>
        `- - ${f} (${Array.from(counts.lemma.formulas.get(f)!).join(", ")})`
    )
    .join("\n");

  markdown += "\n";

  markdown += `- Times when a formula was solved without lemmas but not with them: ${counts.stock.count}\n`;
  markdown += Array.from(counts.stock.formulas.keys())
    .map(
      (f) =>
        `- - ${f} (${Array.from(counts.stock.formulas.get(f)!).join(", ")})`
    )
    .join("\n");

  markdown += "\n";

  return markdown;
}
