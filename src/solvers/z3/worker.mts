import { RunZ3, runZ3Worker } from "./run.js";

process.on("message", (job: RunZ3) => {
  runZ3Worker(job).then((res) => {
    if (!process.send) {
      process.exit(1);
    }
    process.send(JSON.stringify(res));
  });
});
