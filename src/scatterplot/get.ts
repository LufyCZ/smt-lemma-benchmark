import { writeFileSync, renameSync, mkdirSync } from "fs";
import {
  BenchmarkType,
  Benchmarks,
  RelevantBenchmarks,
  lemmaBenchmarkTypes,
  stockBenchmarkTypes,
} from "../types.js";
import { runScatterplot } from "./run.js";
import { hasFinished } from "../data/hasFinished.js";

interface GetScatterPlotPerms {
  benchmarks: RelevantBenchmarks;
  resultDir: string;
}

export async function getScatterPlotPerms({
  benchmarks,
  resultDir,
}: GetScatterPlotPerms) {
  const benchmarkTypes = Array.from(
    Array.from(benchmarks.values()).reduce((acc, val) => {
      Array.from(val.keys()).forEach((k) => acc.add(k));
      return acc;
    }, new Set<BenchmarkType>())
  );

  for (let i = 0; i < benchmarkTypes.length; i++) {
    for (let j = 0; j < benchmarkTypes.length; j++) {
      if (i === j) continue;

      const one = benchmarkTypes[i];
      const two = benchmarkTypes[j];

      const oneResults = Array.from(benchmarks.values()).map(
        (v) => v.get(one) || null
      );
      const twoResults = Array.from(benchmarks.values()).map(
        (v) => v.get(two) || null
      );

      const plot: Partial<Record<BenchmarkType, number[]>> = {};

      for (let k = 0; k < oneResults.length; k++) {
        const oneResult = oneResults[k];
        const twoResult = twoResults[k];

        if (!oneResult || !twoResult) continue;

        plot[one] = plot[one] || [];
        plot[two] = plot[two] || [];

        plot[one]!.push(oneResult.cputime);
        plot[two]!.push(twoResult.cputime);
      }

      writeFileSync("./plot.json", JSON.stringify(plot, null, 2));
      await runScatterplot({});
      mkdirSync(`${resultDir}`, { recursive: true });
      renameSync("./plot.png", `${resultDir}/${one}---${two}.png`);
    }
  }
}

interface GetLemmaXStockScatterPlots {
  benchmarks: RelevantBenchmarks;
  resultDir: string;
}

export async function getLemmaXStockScatterPlot({
  benchmarks,
  resultDir,
}: GetLemmaXStockScatterPlots) {
  const result: { fastestLemmaTime: number; fastestStockTime: number }[] = [];

  benchmarks.forEach((benchmarkTypes) => {
    const lemmas = lemmaBenchmarkTypes.map((lemma) =>
      benchmarkTypes.get(lemma)
    );
    const stocks = stockBenchmarkTypes.map((stock) =>
      benchmarkTypes.get(stock)
    );

    const lemmaSolved = lemmas.filter((lemma) => lemma) as NonNullable<
      (typeof lemmas)[number]
    >[];
    const stockSolved = stocks.filter((stock) => stock) as NonNullable<
      (typeof stocks)[number]
    >[];

    const lemmaSorted = lemmaSolved.sort((a, b) => a.cputime - b.cputime);
    const stockSorted = stockSolved.sort((a, b) => a.cputime - b.cputime);

    const fastestLemmaTime = lemmaSorted[0]?.cputime ?? null;
    const fastestStockTime = stockSorted[0]?.cputime ?? null;

    if (fastestLemmaTime && fastestStockTime) {
      result.push({ fastestLemmaTime, fastestStockTime });
    }
  });

  writeFileSync(
    "./plot.json",
    JSON.stringify(
      result.reduce(
        (acc, cur) => {
          acc.lemma.push(cur.fastestLemmaTime);
          acc.stock.push(cur.fastestStockTime);
          return acc;
        },
        { lemma: [] as number[], stock: [] as number[] }
      ),
      null,
      2
    )
  );
  await runScatterplot({});
  mkdirSync(`${resultDir}`, { recursive: true });
  renameSync("./plot.png", `${resultDir}/lemmaXstock.png`);
}

interface GetAllLemmaXStockScatterPlots {
  benchmarks: Benchmarks;
  resultDir: string;
}

export async function getAllLemmaXStockScatterPlot({
  benchmarks,
  resultDir,
}: GetAllLemmaXStockScatterPlots) {
  const result: { fastestLemmaTime: number; fastestStockTime: number }[] = [];

  const bestLemmaTimes = new Map<string, number>();
  const bestStockTimes = new Map<string, number>();

  let longestTime = 0;

  benchmarks.forEach((config, formulaName) => {
    bestLemmaTimes.set(formulaName, Infinity);
    bestStockTimes.set(formulaName, Infinity);

    config.forEach((formula) => {
      for (const benchmarkType of lemmaBenchmarkTypes) {
        const benchmark = formula.get(benchmarkType);
        if (!benchmark) continue;

        const bestTime = bestLemmaTimes.get(benchmarkType) ?? Infinity;
        if (benchmark.cputime < bestTime) {
          bestLemmaTimes.set(formulaName, benchmark.cputime);
        }

        if (benchmark.cputime > longestTime) {
          longestTime = benchmark.cputime;
        }
      }

      for (const benchmarkType of stockBenchmarkTypes) {
        const benchmark = formula.get(benchmarkType);
        if (!benchmark) continue;

        const bestTime = bestStockTimes.get(benchmarkType) ?? Infinity;
        if (benchmark.cputime < bestTime) {
          bestStockTimes.set(formulaName, benchmark.cputime);
        }

        if (benchmark.cputime > longestTime) {
          longestTime = benchmark.cputime;
        }
      }
    });
  });

  bestLemmaTimes.forEach((lemmaTime, formulaName) => {
    let stockTime = bestStockTimes.get(formulaName);
    if (!stockTime) return;

    if (lemmaTime === Infinity) {
      lemmaTime = longestTime;
    }

    if (stockTime === Infinity) {
      stockTime = longestTime;
    }

    result.push({ fastestLemmaTime: lemmaTime, fastestStockTime: stockTime });
  });

  writeFileSync(
    "./plot.json",
    JSON.stringify(
      result.reduce(
        (acc, cur) => {
          acc.lemma.push(cur.fastestLemmaTime);
          acc.stock.push(cur.fastestStockTime);
          return acc;
        },
        { lemma: [] as number[], stock: [] as number[] }
      ),
      null,
      2
    )
  );
  await runScatterplot({});
  mkdirSync(`${resultDir}`, { recursive: true });
  renameSync("./plot.png", `${resultDir}/allLemmaXstock.png`);
}
