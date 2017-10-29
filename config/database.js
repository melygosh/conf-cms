module.exports = {
    development: {
        driver: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'root',
        password: '',
        database: 'conf-cms_dev',
        debug: true
    },
    test: {
        driver: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'root',
        password: '',
        database: 'conf-cms_test'
    },
    production: {
        driver: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'root',
        password: '',
        database: 'conf-cms_production'
    }
};
