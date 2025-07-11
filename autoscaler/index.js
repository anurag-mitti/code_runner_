require('dotenv').config();
const Redis = require('ioredis');
const {
  listWorkers,
  startWorker,
  stopWorker,
} = require('./dockerManager');

const redis = new Redis(process.env.REDIS_URL);

const minWorkers = parseInt(process.env.MIN_WORKERS, 10) || 0;
const maxWorkers = parseInt(process.env.MAX_WORKERS, 10) || 5;
const highThreshold = parseInt(process.env.HIGH_THRESHOLD, 10) || 10;
const lowThreshold = parseInt(process.env.LOW_THRESHOLD, 10) || 2;
const autoscaleInterval = parseInt(process.env.AUTOSCALE_INTERVAL_MS, 10) || 5000;

let currentWorkers = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scaleUp(currentCount, queueLength) {
  if (currentCount >= maxWorkers) return;

  const newWorkerId = currentCount + 1;
  try {
    console.log(`Scaling UP: Starting worker_${newWorkerId}`);
    await startWorker(newWorkerId, process.env.WORKER_IMAGE);
    currentWorkers++;
  } catch (err) {
    console.error('Error starting worker:', err);
  }
}

async function scaleDown() {
  let workers = await listWorkers();

  if (workers.length <= minWorkers) return;

  const workerToStop = workers[workers.length - 1];
  try {
    console.log(`Scaling DOWN: Stopping ${workerToStop}`);
    await stopWorker(workerToStop);

   
    workers = await listWorkers();
    currentWorkers = workers.length;
  } catch (err) {
    console.error('Error stopping worker:', err);
  }
}

async function autoscale() {
  try {
    const queueLength = await redis.llen('jobQueue');
    let workers = await listWorkers();

    currentWorkers = workers.length;

    console.log(`Queue Length: ${queueLength}, Workers Running: ${currentWorkers}`);

    if (queueLength === 0 && currentWorkers > 0) {
      
      for (const worker of workers) {
        try {
          console.log(`Queue empty: Stopping all workers, stopping ${worker}`);
          await stopWorker(worker);
          await sleep(500); 
        } catch (err) {
          console.error('Error stopping worker:', err);
        }
      }
      currentWorkers = 0;
    } else if (queueLength > currentWorkers * highThreshold && currentWorkers < maxWorkers) {
      await scaleUp(currentWorkers, queueLength);
    } else if (queueLength < currentWorkers * lowThreshold && currentWorkers > minWorkers) {
      await scaleDown();
    }
  } catch (err) {
    console.error('Autoscaler error:', err);
  }
}

async function ensureMinWorkers() {
  const workers = await listWorkers();
  let toStart = minWorkers - workers.length;
  for (let i = 0; i < toStart; i++) {
    await startWorker(workers.length + i + 1, process.env.WORKER_IMAGE);
  }
  currentWorkers = minWorkers;
}

async function main() {
  await ensureMinWorkers();
  setInterval(autoscale, autoscaleInterval);
}

main();
