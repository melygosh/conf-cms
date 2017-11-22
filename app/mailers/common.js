exports.registration = function(user) {
    this.locals.user = user;
    this.send({
        to: user.email,
        generateTextFromHTML: true,        
        subject: 'Imconf Registration'
    });
};
exports.notification = function(user) {
    this.locals.user = user;
    this.send({
        to: process.env.EMAIL_ADDRESS,
        generateTextFromHTML: true,
        subject: 'New Imconf Registration'
    });
};