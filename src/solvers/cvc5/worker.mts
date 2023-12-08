import { RunCVC5, runCVC5Worker } from "./run.js";

process.on("message", (job: RunCVC5) => {
  runCVC5Worker(job).then((res) => {
    if (!process.send) {
      process.exit(1);
    }
    process.send(JSON.stringify(res));
    process.exit(0);
  });
});
