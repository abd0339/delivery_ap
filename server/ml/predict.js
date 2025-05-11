
const { spawn } = require('child_process');

function predictPrice({ type, length, weight, distance }) {
  return new Promise((resolve, reject) => {
    const process = spawn('python3', ['server/ml/run_prediction.py', type, length, weight, distance]);

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
