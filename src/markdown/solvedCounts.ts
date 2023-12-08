import { getSolvedCountsPerms } from "../data/getSolvedCounts.js";
import { BenchmarkType } from "../types.js";

function printSolvedCount(
  counts: ReturnType<typeof getSolvedCountsPerms>,
  thisSolved?: BenchmarkType,
  than?: BenchmarkType
) {
  if (thisSolved && !than) {
    return "";
  }

  if (thisSolved && than) {
    const curr = counts[thisSolved]?.[than];
    if (!curr) return "";

    return `- ${thisSolved} solved something ${than} didn't solve ${curr.count} times.\n`;
  }

  return Object.entries(counts)
    .flatMap(([thisSolved, value]) =>
      Object.entries(value!).flatMap(([than, value]) => {
        if (!value.count) return [];
        return `- ${thisSolved} solved something ${than} didn't solve ${value.count} times.\n`;
      })
    )
    .join("\n");
}

export function mdSolvedCounts(
  counts: ReturnType<typeof getSolvedCountsPerms>
) {
  let markdown = "## Relevant Solved Counts\n";
  markdown += printSolvedCount(counts, "stock-cvc5", "stock-z3");
  markdown += printSolvedCount(counts, "stock-z3", "stock-cvc5");
  markdown += printSolvedCount(counts, "z3-lemmas-cvc5", "stock-cvc5");
  markdown += printSolvedCount(counts, "cvc5-lemmas-cvc5", "stock-cvc5");
  markdown += printSolvedCount(counts, "z3-lemmas-z3", "stock-z3");
  markdown += printSolvedCount(counts, "cvc5-lemmas-z3", "stock-z3");

  return markdown;
}

export function mdAllSolvedCounts(
  counts: ReturnType<typeof getSolvedCountsPerms>
) {
  let markdown = "## All Solved Counts\n";
  markdown += printSolvedCount(counts);
  return markdown;
}
