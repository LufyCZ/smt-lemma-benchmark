import {
  BenchmarkType,
  RelevantBenchmarks,
  allBenchmarkTypes,
} from "../types.js";
import { hasFinished } from "./hasFinished.js";

type Result = { count: number };

type ResultAgg = Partial<
  Record<BenchmarkType, Partial<Record<BenchmarkType, Result>>>
>;

export function addSolvedCounts(base: ResultAgg, toAdd: ResultAgg) {
  for (const addingA in toAdd) {
    const adding = addingA as BenchmarkType;
    base[adding] = base[adding] || {};
    for (const addedA in toAdd[adding]) {
      const added = addedA as BenchmarkType;
      base[adding]![added] = base[adding]![added] || {
        count: 0,
      };
      base[adding]![added]!.count += toAdd[adding]![added]!.count;
    }
  }

  return base;
}

export function getSolvedCountsPerms(
  benchmarks: RelevantBenchmarks,
  types: Readonly<BenchmarkType[]> = allBenchmarkTypes
) {
  const results: ResultAgg = {};

  for (let i = 0; i < types.length; i++) {
    for (let j = 0; j < types.length; j++) {
      if (i === j) {
        continue;
      }
      const thisOne = types[i];
      const thatOne = types[j];

      results[thisOne] = results[thisOne] || {};

      const { count } = getSolvedCount(benchmarks, thisOne, thatOne);

      results[thisOne]![thatOne] = {
        count,
      };
    }
  }

  return results;
}

export function getSolvedCount(
  benchmarks: RelevantBenchmarks,
  solvedType: BenchmarkType,
  unsolvedType: BenchmarkType
) {
  let thisSolved = 0;

  benchmarks.forEach((types) => {
    const thisResult = types.get(solvedType);
    const thatResult = types.get(unsolvedType);

    if (thisResult && hasFinished(thisResult.status)) {
      thisSolved++;
    } else {
      return;
    }

    if (thatResult && hasFinished(thatResult.status)) {
      thisSolved--;
    }
  });

  return {
    count: thisSolved,
  };
}
