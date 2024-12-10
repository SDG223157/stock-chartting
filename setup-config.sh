# 1. Create vercel.json
cat << 'EOF' > vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "api/analyze": {
      "memory": 3008,
      "maxDuration": 60
    }
  },
  "env": {
    "NEXT_PUBLIC_APP_NAME": "Stock Chartting"
  }
}
EOF

# 2. Create next.config.js
cat << 'EOF' > next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
EOF

# 3. Create tsconfig.json
cat << 'EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# 4. Create .gitignore
cat << 'EOF' > .gitignore
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Python
venv/
__pycache__/
*.pyc

# IDE
.idea/
.vscode/

# Vercel
.vercel
EOF

# 5. Create empty .env.local
touch .env.local

# 6. Create tailwind.config.js
cat << 'EOF' > tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# 7. Create postcss.config.js
cat << 'EOF' > postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 8. Create pages/api/analyze.ts
mkdir -p pages/api
cat << 'EOF' > pages/api/analyze.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ticker, endDate, lookbackDays, crossoverDays } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker symbol is required' });
    }

    const pythonProcess = spawn('python', [
      'api/analyze.py',
      ticker,
      endDate || '',
      lookbackDays.toString(),
      crossoverDays.toString(),
    ]);

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}\n${errorData}`));
        } else {
          resolve(outputData);
        }
      });
    });

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(outputData);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze stock' });
  }
}
EOF

# 9. Create pages directory and index.tsx
mkdir -p pages
cat << 'EOF' > pages/index.tsx
import type { NextPage } from 'next';
import AnalysisForm from '@/components/AnalysisForm';

const Home: NextPage = () => {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <AnalysisForm />
    </main>
  );
};

export default Home;
EOF

# 10. Give execution confirmation
echo "Configuration files have been created successfully!"
ls -la
EOF