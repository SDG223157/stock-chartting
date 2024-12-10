import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('CWD:', process.cwd());
    console.log('Python path:', process.env.PATH);

    const { ticker, endDate, lookbackDays, crossoverDays } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker symbol is required' });
    }

    let outputData = '';
    let errorData = '';

    const pythonProcess = spawn('python3', [
      path.join(process.cwd(), 'api', 'analyze.py'),
      ticker,
      endDate || '',
      lookbackDays.toString(),
      crossoverDays.toString(),
    ]);

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
      console.log('Python stdout:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error('Python stderr:', data.toString());
    });

    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python process exited with code:', code);
          reject(new Error(`Python process exited with code ${code}\n${errorData}`));
        } else {
          resolve(outputData);
        }
      });
    });

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(outputData);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze stock',
      details: error.message,
      code: error.code,
      syscall: error.syscall
    });
  }
}
