/*
 db/schema.js contains database schema description for application models
 by default (when using jugglingdb as ORM) this file uses database connection
 described in config/database.json. But it's possible to use another database
 connections and multiple different schemas, docs available at

 http://railwayjs.com/orm.html

 Example of model definition:

 define('User', function () {
     property('email', String, { index: true });
     property('password', String);
     property('activated', Boolean, {default: false});
 });

 Example of schema configured without config/database.json (heroku redistogo addon):
 schema('redis', {url: process.env.REDISTOGO_URL}, function () {
     // model definitions here
 });

*/
if (process.env.DATABASE_URL)
    schema('postgres', { url: process.env.DATABASE_URL }, defineAll);
else
    defineAll();

function defineAll() {
    var Htmlblock = describe('Htmlblock', function () {
        property('name', String);
        property('body', String);
        set('restPath', pathTo.htmlblocks);
    });

    var Registration = describe('Registration', () => {
        property('name', String);
        property('last_name', String);
        property('middle_name', String);
        property('country', String);
        property('city', String);
        property('organization', String);
        property('position', String);
        property('degree', String);
        property('academic_title', String);
        property('phone', String);
        property('email', String);
        property('speach_title', String);
        property('co_author', String);
        property('lang', String);
        set('restPath', pathTo.registrations);
    });
}

