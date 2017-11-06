load('application');

before(loadRegistration, {
    only: ['show', 'edit', 'update', 'destroy']
    });

action('new', function () {
    this.title = 'New registration';
    this.registration = new Registration;
    render();
});

action(function create() {
    Registration.create(req.body.Registration, function (err, registration) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: registration && registration.errors || err});
                } else {
                    send({code: 200, data: registration.toObject()});
                }
            });
            format.html(function () {
                if (err) {
                    flash('error', 'Registration can not be created');
                    render('new', {
                        registration: registration,
                        title: 'New registration'
                    });
                } else {
                    flash('info', 'Registration created');
                    redirect(path_to.registrations);
                }
            });
        });
    });
});

action(function index() {
    this.title = 'Registrations index';
    Registration.all(function (err, registrations) {
        console.log(err);
        
        switch (params.format) {
            case "json":
                send({code: 200, data: registrations});
                break;
            default:
                render({
                    registrations: registrations
                });
        }
    });
});

action(function show() {
    this.title = 'Registration show';
    switch(params.format) {
        case "json":
            send({code: 200, data: this.registration});
            break;
        default:
            render();
    }
});

action(function edit() {
    this.title = 'Registration edit';
    switch(params.format) {
        case "json":
            send(this.registration);
            break;
        default:
            render();
    }
});

action(function update() {
    var registration = this.registration;
    this.title = 'Edit registration details';
    this.registration.updateAttributes(body.Registration, function (err) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: registration && registration.errors || err});
                } else {
                    send({code: 200, data: registration});
                }
            });
            format.html(function () {
                if (!err) {
                    flash('info', 'Registration updated');
                    redirect(path_to.registration(registration));
                } else {
                    flash('error', 'Registration can not be updated');
                    render('edit');
                }
            });
        });
    });
});

action(function destroy() {
    this.registration.destroy(function (error) {
        respondTo(function (format) {
            format.json(function () {
                if (error) {
                    send({code: 500, error: error});
                } else {
                    send({code: 200});
                }
            });
            format.html(function () {
                if (error) {
                    flash('error', 'Can not destroy registration');
                } else {
                    flash('info', 'Registration successfully removed');
                }
                send("'" + path_to.registrations + "'");
            });
        });
    });
});

function loadRegistration() {
    Registration.find(params.id, function (err, registration) {
        if (err || !registration) {
            if (!err && !registration && params.format === 'json') {
                return send({code: 404, error: 'Not found'});
            }
            redirect(path_to.registrations);
        } else {
            this.registration = registration;
            next();
        }
    }.bind(this));
}
