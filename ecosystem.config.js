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
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: './apps/web',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

