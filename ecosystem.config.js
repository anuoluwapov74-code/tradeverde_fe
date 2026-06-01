module.exports = {
  apps: [
    {
      name: "verdetrades-frontend",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/verdetrades/frontend_next",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
