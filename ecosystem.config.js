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
      script: '/root/vx-mono/node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/root/vx-mono/apps/web',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

