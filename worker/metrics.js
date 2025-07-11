const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const jobsProcessed = new client.Counter({
  name: 'jobs_processed_total',
  help: 'Total number of jobs processed',
});
const jobFailures = new client.Counter({
  name: 'job_failures_total',
  help: 'Total number of job failures',
});
const jobDuration = new client.Histogram({
  name: 'job_duration_seconds',
  help: 'Job execution time in seconds',
  buckets: [0.5, 1, 2, 5, 10]
});

register.registerMetric(jobsProcessed);
register.registerMetric(jobFailures);
register.registerMetric(jobDuration);

module.exports = {
  register,
  jobsProcessed,
  jobFailures,
  jobDuration
};
