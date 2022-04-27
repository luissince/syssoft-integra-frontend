module.exports = {
    apps: [
        {
            name: "inmobilaria",
            script: "./index.js",
            watch: true,
            env: {
                "PORT": 5000,
                "NODE_ENV": "development"
            },
            env_production: {
                "PORT": 8000,
                "HOST_DB": "127.0.0.1",
                "USER_DB": "root",
                "PASSWORD_DB": "",
                "DATABASE_DB": "",
                "PORT_DB": 3306,
                "TZ": "America/Lima",
                "NODE_ENV": "production",
            }
        }
    ]
}