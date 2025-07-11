const { exec } = require('child_process');

function listWorkers() {
  return new Promise((resolve, reject) => {
    exec(`docker ps -a --filter "name=worker_" --format "{{.Names}}"`, (err, stdout, stderr) => {
      if (err) return reject(err);
      const containers = stdout.trim().split('\n').filter(Boolean);
      resolve(containers);
    });
  });
}

function startWorker(id, image) {
  return new Promise((resolve, reject) => {
    const containerName = `worker_${id}`;
    exec(`docker run -d --name ${containerName} ${image}`, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve(stdout.trim());
    });
  });
}

function stopWorker(containerName) {
  return new Promise((resolve, reject) => {
    
    exec(`docker inspect -f '{{.State.Status}}' ${containerName}`, (inspectErr, statusStdout) => {
      if (inspectErr) {
       
        if (inspectErr.message.includes('No such object')) {
          console.log(`Container ${containerName} does not exist, skipping stop.`);
          return resolve();
        }
        return reject(inspectErr);
      }

      const status = statusStdout.trim();

      if (status === 'exited' || status === 'removing') {
        console.log(`Container ${containerName} already stopped or removing.`);
        return resolve();
      }

      
      exec(`docker rm -f ${containerName}`, (rmErr, rmStdout, rmStderr) => {
        if (rmErr) return reject(rmErr);
        resolve(rmStdout.trim());
      });
    });
  });
}

module.exports = {
  listWorkers,
  startWorker,
  stopWorker,
};
