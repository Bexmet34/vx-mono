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
    }
  ]
};
