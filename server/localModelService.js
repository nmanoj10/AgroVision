const { spawn } = require('child_process');
const path = require('path');

function runHybridPrediction(imagePath) {
  return new Promise((resolve, reject) => {
    const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python';
    const scriptPath = path.join(__dirname, 'predict.py');
    const child = spawn(pythonExecutable, [scriptPath, imagePath], {
      cwd: path.join(__dirname, '..'),
      env: process.env,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to start Python detection process: ${error.message}`));
    });

    child.on('close', (code) => {
      const output = stdout.trim();

      if (output) {
        try {
          resolve(JSON.parse(output));
          return;
        } catch (error) {
          reject(
            new Error(
              `Python detector returned invalid JSON${stderr ? `: ${stderr.trim()}` : ''}`
            )
          );
          return;
        }
      }

      const message = stderr.trim() || `Python detector exited with code ${code}`;
      reject(new Error(message));
    });
  });
}

module.exports = { runHybridPrediction };
