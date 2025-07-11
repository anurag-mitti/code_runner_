const client = require('./redisClient');

async function addJob(job) {
  try {
    const jobString = JSON.stringify(job);
    const jobId = job.id || 'unknown_id';

    await client.lpush('jobQueue', jobString);
    console.log('Job added to queue:', job);

    await client.hset('jobStatus', jobId, 'queued');
    console.log(`Job status set to 'queued' for job ID: ${jobId}`);
  } catch (err) {
    console.error('Error adding job to queue:', err);
  }
}


module.exports = addJob;
