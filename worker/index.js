const redisClient = require("./queue/redisClient");
const runCodeInDocker = require("./dockerRunner");
const validateOutput = require("./utils/validateOutput");
const { jobsProcessed, jobFailures, jobDuration } = require("./metrics");

async function pollQueue() {
  console.log("Worker started, polling job queue...");

  while (true) {
    try {
      console.log("Waiting for jobs...");
      const res = await redisClient.brpop("jobQueue", 0);
      console.log("Got a job from queue:", res);

      if (!res) continue;

      const job = JSON.parse(res[1]);
      const { id, code, language, testCases } = job;

      const start = Date.now();
      let allPassed = true;

      for (let test of testCases) {
        const { input, expectedOutput } = test;

        try {
          const result = await runCodeInDocker(language, code, input);
          const isCorrect = validateOutput(result.output, expectedOutput);

          if (!isCorrect) allPassed = false;
        } catch (err) {
          allPassed = false;
          await redisClient.hset(
            "jobStatus",
            id,
            JSON.stringify({
              status: "failed",
              error: err.error || "Execution error",
              timestamp: Date.now(),
            })
          );
          jobFailures.inc();
          continue;
        }
      }

      const duration = (Date.now() - start) / 1000;

      await redisClient.hset(
        "jobStatus",
        id,
        JSON.stringify({
          status: allPassed ? "passed" : "failed",
          timestamp: Date.now(),
          duration,
        })
      );

      jobsProcessed.inc();
      jobDuration.observe(duration);
    } catch (err) {
      console.error("Worker error:", err);
    }
  }
}

pollQueue();
