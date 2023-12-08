export interface TakeSlice {
  start?: number;
  end?: number;
}

export function takeSliceLemmas(lemmas: string[], { start, end }: TakeSlice) {
  return lemmas.slice(start, end);
}
