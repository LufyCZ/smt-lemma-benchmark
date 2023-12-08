import {
  BenchmarkType,
  RelevantBenchmarks,
  lemmaBenchmarkTypes,
  stockBenchmarkTypes,
} from "../types.ts";
import { hasFinished } from "./hasFinished.ts";

type Result = { count: number; formulas: Map<string, Set<BenchmarkType>> };

type ResultAgg = Record<"lemma" | "stock", Result>;

export function addLemmaXStockCounts(base: ResultAgg, toAdd: ResultAgg) {
  for (const k in toAdd) {
    const key = k as keyof ResultAgg;

    base[key] = base[key] || {
      count: 0,
      formulas: new Map<string, Set<BenchmarkType>>(),
    };

    base[key].formulas.forEach((types, formula) => {
      const toAddTypes = toAdd[key].formulas.get(formula);
      if (!toAddTypes) return;

      base[key].formulas.set(formula, new Set([...types, ...toAddTypes]));
    });

    toAdd[key].formulas.forEach((types, formula) => {
      if (base[key].formulas.has(formula)) return;
      base[key].formulas.set(formula, types);
    });
  }

  const lemmaMap = base["lemma"].formulas;
  const stockMap = base["stock"].formulas;

  lemmaMap.forEach((_, formula) => {
    if (stockMap.has(formula)) {
      lemmaMap.delete(formula);
      stockMap.delete(formula);
    }
  });

  stockMap.forEach((_, formula) => {
    if (lemmaMap.has(formula)) {
      lemmaMap.delete(formula);
      stockMap.delete(formula);
    }
  });

  base["lemma"].count = lemmaMap.size;
  base["stock"].count = stockMap.size;

  return base;
}

export function getLemmaXStockCount(benchmarks: RelevantBenchmarks) {
  const results = {
    lemma: { count: 0, formulas: new Map<string, Set<BenchmarkType>>() },
    stock: { count: 0, formulas: new Map<string, Set<BenchmarkType>>() },
  };

  benchmarks.forEach((benchmarkTypes, formula) => {
    const lemmas = lemmaBenchmarkTypes.map((type) => ({
      type,
      run: benchmarkTypes.get(type),
    }));
    const stocks = stockBenchmarkTypes.map((type) => ({
      type,
      run: benchmarkTypes.get(type),
    }));

    const lemmaSolved = lemmas.filter(
      (lemma) => lemma.run && hasFinished(lemma.run.status)
    );
    const stockSolved = stocks.filter(
      (stock) => stock.run && hasFinished(stock.run.status)
    );

    if (lemmaSolved.length > 0 && stockSolved.length === 0) {
      results.lemma.count++;
      results.lemma.formulas.set(
        formula,
        new Set(lemmaSolved.map((l) => l.type))
      );
    }

    if (lemmaSolved.length === 0 && stockSolved.length > 0) {
      results.stock.count++;
      results.stock.formulas.set(
        formula,
        new Set(stockSolved.map((l) => l.type))
      );
    }
  });

  return results as ResultAgg;
}
