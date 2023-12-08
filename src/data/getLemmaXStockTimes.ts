import {
  BenchmarkType,
  Benchmarks,
  RelevantBenchmarks,
  allBenchmarkTypes,
  lemmaBenchmarkTypes,
  stockBenchmarkTypes,
} from "../types.js";
import { hasFinished } from "./hasFinished.js";

type Result = Record<string, { lemma: number; stock: number }>;

export function getLemmaXStockTimes(benchmarks: RelevantBenchmarks) {
  const result: Result = {};

  benchmarks.forEach((types, name) => {
    let bestLemmaTime = Infinity;

    for (const benchmarkType of lemmaBenchmarkTypes) {
      const res = types.get(benchmarkType);
      if (!res) continue;

      if (res.cputime < bestLemmaTime && hasFinished(res.status)) {
        bestLemmaTime = res.cputime;
      }
    }

    let bestStockTime = Infinity;

    for (const benchmarkType of stockBenchmarkTypes) {
      const res = types.get(benchmarkType);
      if (!res) continue;

      if (res.cputime < bestStockTime && hasFinished(res.status)) {
        bestStockTime = res.cputime;
      }
    }

    result[name] = {
      lemma: bestLemmaTime,
      stock: bestStockTime,
    };
  });

  return result;
}

export function getAllLemmaXStockTimes(benchmarks: Benchmarks) {
  const result: Result = {};

  benchmarks.forEach((types, name) => {
    let bestLemmaTime = Infinity;

    for (const config of types.keys()) {
      for (const benchmarkType of lemmaBenchmarkTypes) {
        const res = types.get(config)!.get(benchmarkType);
        if (!res) continue;

        if (res.cputime < bestLemmaTime && hasFinished(res.status)) {
          bestLemmaTime = res.cputime;
        }
      }
    }

    let bestStockTime = Infinity;

    for (const config of types.keys()) {
      for (const benchmarkType of stockBenchmarkTypes) {
        const res = types.get(config)!.get(benchmarkType);
        if (!res) continue;

        if (res.cputime < bestStockTime && hasFinished(res.status)) {
          bestStockTime = res.cputime;
        }
      }
    }

    result[name] = {
      lemma: bestLemmaTime,
      stock: bestStockTime,
    };
  });

  return result;
}
