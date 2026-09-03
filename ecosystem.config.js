module.exports = {
  apps: [
    {
      name: 'partikur',
      script: 'src/sharding.js',
      cwd: './apps/bot',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'vxdestek',
      script: 'index.js',
      cwd: './apps/support',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'vxweb',
      script: 'pnpm',
      args: 'start -p 3000',
      cwd: './apps/web',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'vxdocs',
      script: 'pnpm',
      args: 'start -p 3001',
      cwd: './apps/docs',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

