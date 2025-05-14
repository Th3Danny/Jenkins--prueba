module.exports = {
    apps: [
        {
            name: "health-api-dev",
            script: "server.js",
            env: {
                NODE_ENV: "development",
                PORT: 3000
            }
        },
        {
            name: "health-api-qa",
            script: "server.js",
            env: {
                NODE_ENV: "qa",
                PORT: 3001
            }
        },
        {
            name: "health-api-prod",
            script: "server.js",
            env: {
                NODE_ENV: "production",
                PORT: 3002
            }
        }
    ]
};
