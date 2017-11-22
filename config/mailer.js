// https://github.com/andris9/Nodemailer#setting-up-sendmail
exports.development = {
    baseURL: 'http://localhost:3000',
    driver: 'SMTP',
    transport: {
        service: 'Gmail',
        // authentication object as {user:"...", pass:"..."} or {XOAuth2: {xoauth2_options}} or {XOAuthToken: "base64data"}
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PWD
        },
        debug: true
    }
};

// https://github.com/andris9/Nodemailer#setting-up-smtp
exports.production = {
    baseURL: 'http://www.imconf.com.ua',
    driver: 'SMTP',
    transport: {
        host: 'smtp.gmail.com', // default 'localhost'
        secureConnection: true, // use SSL, default false
        port: 465, // port for secure SMTP, default 25
        // authentication object as {user:"...", pass:"..."} or {XOAuth2: {xoauth2_options}} or {XOAuthToken: "base64data"}
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PWD
        },
        debug: true
        /*,
        // an optional well known service identifier ("Gmail", "Hotmail" etc.,
        // see Well known Services for a list of supported services) to
        // auto-configure host, port and secure connection settings
        service: 'Gmail',
        // the name of the client server (defaults to machine name)
        name: 'anatoliy-laptop',
        // ignore server support for STARTTLS (defaults to false)
        ignoreTLS: true,
        // output client and server messages to console
        // how many connections to keep in the pool (defaults to 5)
        maxConnections: 100
        */
    }
};

exports.test = {
    driver: 'Stub'
};