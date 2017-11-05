module.exports = {
    development: {
        driver: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: '',
        database: 'conf-cms_dev',
        debug: true,
        ssl:false
    },
    test: {
        driver: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: '',
        database: 'conf-cms_test'
    },
    production: {
        driver: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: '',
        database: 'conf-cms_prod'
    }
};
