import { Status } from "../types";

export function parseStatus(status: string) {
  let res: Status;

  if (status === "true") {
    res = "sat";
  } else if (status === "false") {
    res = "unsat";
  } else if (status.toLowerCase().includes("timeout")) {
    res = "timeout";
  } else if (
    status.toLowerCase().includes("error") ||
    status.toLocaleLowerCase().includes("memory")
  ) {
    res = "error";
  } else {
    throw new Error(status);
  }

  return res;
}
