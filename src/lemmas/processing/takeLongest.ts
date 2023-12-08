interface TakeLongestNumber {
  count: number;
  percentage: never;
}

interface TakeLongestPercentage {
  percentage: number;
  count: never;
}

export type TakeLongest = TakeLongestNumber | TakeLongestPercentage;

export function takeLongestLemmas(
  lemmas: string[],
  { count, percentage }: TakeLongest
) {
  const sorted = lemmas.sort((a, b) => a.length - b.length);

  if (count) {
    return sorted.slice(-count);
  } else if (percentage) {
    const index = Math.floor((sorted.length / 100) * percentage);
    return sorted.slice(-index);
  } else {
    throw new Error("Invalid arguments");
  }
}
