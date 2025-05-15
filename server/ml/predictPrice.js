const path = require('path');
const { spawn } = require('child_process');
const python = spawn('python', ['path/to/script.py']);

function predictPrice({ type, length, weight, distance }) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'run_prediction.py');
    const modelArgs = [type, length, weight, distance];

    const process = spawn('python', [scriptPath, ...modelArgs]);

    let output = '';
    process.stdout.on('data', data => output += data.toString());
    process.stderr.on('data', err => console.error('Prediction error:', err.toString()));

    process.on('close', code => {
      if (code === 0) {
        resolve(parseFloat(output.trim()));
      } else {
        reject(new Error('Prediction failed'));
      }
    });
  });
}

module.exports = predictPrice;
