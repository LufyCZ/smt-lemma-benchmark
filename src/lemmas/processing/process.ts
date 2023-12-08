export function processLemmas(
  lemmas: string[],
  ops: {
    fn: (lemmas: string[], opts: any) => string[];
    opts: any;
  }[]
) {
  return ops.reduce((acc, { fn, opts }) => fn(acc, opts), lemmas);
}
