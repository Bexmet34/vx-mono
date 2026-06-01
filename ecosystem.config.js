module.exports = {
  apps: [
    {
      name: 'partikur',
      script: 'src/index.js',
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
