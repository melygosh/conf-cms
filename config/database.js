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
        host: process.env.DBHOST || 'localhost',
        port: process.env.DBPORT || 5432,
        username: process.env.DBUSER || 'postgres',
        password: process.env.DBPASSWORD || '',
        database: process.env.DBNAME || 'conf-cms_prod'
    }
};
