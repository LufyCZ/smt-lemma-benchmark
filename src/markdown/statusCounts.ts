import { getStatusCounts } from "../data/getStatusCounts.js";

export function mdStatusCounts(counts: ReturnType<typeof getStatusCounts>) {
  return `- Number of errors: ${counts.errorCount}
- Number of timeouts: ${counts.timeoutCount}
- Number of sats: ${counts.satCount}
- Number of unsats: ${counts.unsatCount}
`;
}
