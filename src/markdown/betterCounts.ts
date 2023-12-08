import { getBetterCountPerms } from "../data/getBetterCounts.js";
import { BenchmarkType } from "../types.js";

function printBetterCount(
  cases: ReturnType<typeof getBetterCountPerms>,
  thisBetter?: BenchmarkType,
  than?: BenchmarkType
) {
  if (thisBetter && !than) {
    return "";
  }

  if (thisBetter && than) {
    const curr = cases[thisBetter]?.[than];
    if (!curr) return "";

    return `- ${thisBetter} is better than ${than} ${curr.leftBetter}/${
      curr.counted
    } times, or ${((curr.leftBetter / curr.counted) * 100).toFixed(2)}%\n`;
  }

  return Object.entries(cases)
    .flatMap(([thisBetter, value]) =>
      Object.entries(value!).flatMap(([than, value]) => {
        if (!value.counted) return [];
        return `- ${thisBetter} is better than ${than} ${value.leftBetter}/${
          value.counted
        } times, or ${((value.leftBetter / value.counted) * 100).toFixed(2)}%`;
      })
    )
    .join("\n");
}

export function mdBetterCounts(counts: ReturnType<typeof getBetterCountPerms>) {
  let markdown = "## Relevant Cases\n";
  markdown += printBetterCount(counts, "stock-cvc5", "stock-z3");
  markdown += printBetterCount(counts, "stock-z3", "stock-cvc5");
  markdown += printBetterCount(counts, "z3-lemmas-cvc5", "stock-cvc5");
  markdown += printBetterCount(counts, "cvc5-lemmas-cvc5", "stock-cvc5");
  markdown += printBetterCount(counts, "z3-lemmas-z3", "stock-z3");
  markdown += printBetterCount(counts, "cvc5-lemmas-z3", "stock-z3");

  return markdown;
}

export function mdAllBetterCounts(
  counts: ReturnType<typeof getBetterCountPerms>
) {
  let markdown = "## All Cases\n";
  markdown += printBetterCount(counts);
  return markdown;
}
