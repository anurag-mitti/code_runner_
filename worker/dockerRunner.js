const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function runCodeInDocker(language, code, testInput) {
  if (language !== 'cpp') {
    throw new Error('Unsupported language. Only C++ is supported in this runner.');
  }

  const jobId = uuidv4();
  const tempDir = path.join(__dirname, 'tmp', jobId);
  fs.mkdirSync(tempDir, { recursive: true });

  const codeFile = path.join(tempDir, 'main.cpp');
  const inputFile = path.join(tempDir, 'input.txt');
  fs.writeFileSync(codeFile, code);
  fs.writeFileSync(inputFile, testInput);

  const dockerImage = 'gcc';

  const container = spawn('docker', [
    'run', '--rm',
    '-m', '100m', '--cpus', '0.5',
    '-v', `${tempDir}:/app`,
    '-w', '/app',
    dockerImage,
    'bash', '-c',
    'g++ main.cpp -o main && ./main < input.txt'
  ]);

  return new Promise((resolve, reject) => {
    let output = '';
    let error = '';

    container.stdout.on('data', (data) => output += data.toString());
    container.stderr.on('data', (data) => error += data.toString());

    container.on('close', (code) => {
      fs.rmSync(tempDir, { recursive: true, force: true });

      if (code === 0) resolve({ output, error: null });
      else reject({ output, error });
    });
  });
}

module.exports = runCodeInDocker;
