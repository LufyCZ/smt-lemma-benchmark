import { Status } from "../types";

export function hasFinished(status: Status) {
  return status === "sat" || status === "unsat";
}
