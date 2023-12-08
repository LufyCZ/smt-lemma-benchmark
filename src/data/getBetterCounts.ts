import {
  BenchmarkType,
  RelevantBenchmarks,
  allBenchmarkTypes,
} from "../types.js";
import { hasFinished } from "./hasFinished.js";

type Result = { counted: number; leftBetter: number };

type ResultAgg = Partial<
  Record<BenchmarkType, Partial<Record<BenchmarkType, Result>>>
>;

export function addBetterCounts(base: ResultAgg, toAdd: ResultAgg) {
  for (const addingA in toAdd) {
    const adding = addingA as BenchmarkType;
    base[adding] = base[adding] || {};
    for (const addedA in toAdd[adding]) {
      const added = addedA as BenchmarkType;
      base[adding]![added] = base[adding]![added] || {
        counted: 0,
        leftBetter: 0,
      };
      base[adding]![added]!.counted += toAdd[adding]![added]!.counted;
      base[adding]![added]!.leftBetter += toAdd[adding]![added]!.leftBetter;
    }
  }

  return base;
}

export function getBetterCountPerms(
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

      const { counted, thisBetter } = getBetterCount(
        benchmarks,
        thisOne,
        thatOne
      );

      results[thisOne]![thatOne] = {
        counted,
        leftBetter: thisBetter,
      };
    }
  }

  return results;
}

export function getBetterCount(
  benchmarks: RelevantBenchmarks,
  thisOne: BenchmarkType,
  thatOne: BenchmarkType
) {
  let thisBetter = 0;
  let counted = 0;

  benchmarks.forEach((types) => {
    const thisResult = types.get(thisOne);
    const thatResult = types.get(thatOne);

    if (
      thisResult &&
      hasFinished(thisResult.status) &&
      (!thatResult || !hasFinished(thatResult.status))
    ) {
      thisBetter++;
      counted++;
    }

    if (
      thisResult &&
      hasFinished(thisResult.status) &&
      thatResult &&
      hasFinished(thatResult.status)
    ) {
      counted++;
      if (thisResult.cputime < thatResult.cputime) {
        thisBetter++;
      }
    }
  });

  return {
    thisBetter,
    counted,
  };
}
