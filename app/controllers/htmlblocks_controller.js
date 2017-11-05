load('application');

before(loadHtmlblock, {
    only: ['show', 'edit', 'update', 'destroy']
    });

action('new', function () {
    this.title = 'New htmlblock';
    this.htmlblock = new Htmlblock;
    render();
});

action(function create() {
    Htmlblock.create(req.body.Htmlblock, function (err, htmlblock) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: htmlblock && htmlblock.errors || err});
                } else {
                    send({code: 200, data: htmlblock.toObject()});
                }
            });
            format.html(function () {
                if (err) {
                    console.log(err);
                    flash('error', 'Htmlblock can not be created');
                    render('new', {
                        htmlblock: htmlblock,
                        title: 'New htmlblock'
                    });
                } else {
                    flash('info', 'Htmlblock created');
                    redirect(path_to.htmlblocks);
                }
            });
        });
    });
});

action(function index() {
    this.title = 'Htmlblocks index';
    Htmlblock.all(function (err, htmlblocks) {
        console.log(err);
        
        switch (params.format) {
            case "json":
                send({code: 200, data: htmlblocks});
                break;
            default:
                render({
                    htmlblocks: htmlblocks
                });
        }
    });
});

action(function show() {
    this.title = 'Htmlblock show';
    switch(params.format) {
        case "json":
            send({code: 200, data: this.htmlblock});
            break;
        default:
            render();
    }
});

action(function edit() {
    this.title = 'Htmlblock edit';
    switch(params.format) {
        case "json":
            send(this.htmlblock);
            break;
        default:
            render();
    }
});

action(function update() {
    var htmlblock = this.htmlblock;
    this.title = 'Edit htmlblock details';
    this.htmlblock.updateAttributes(body.Htmlblock, function (err) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: htmlblock && htmlblock.errors || err});
                } else {
                    send({code: 200, data: htmlblock});
                }
            });
            format.html(function () {
                if (!err) {
                    flash('info', 'Htmlblock updated');
                    redirect(path_to.htmlblock(htmlblock));
                } else {
                    flash('error', 'Htmlblock can not be updated');
                    render('edit');
                }
            });
        });
    });
});

action(function destroy() {
    this.htmlblock.destroy(function (error) {
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
                    flash('error', 'Can not destroy htmlblock');
                } else {
                    flash('info', 'Htmlblock successfully removed');
                }
                send("'" + path_to.htmlblocks + "'");
            });
        });
    });
});

function loadHtmlblock() {
    Htmlblock.find(params.id, function (err, htmlblock) {
        if (err || !htmlblock) {
            if (!err && !htmlblock && params.format === 'json') {
                return send({code: 404, error: 'Not found'});
            }
            redirect(path_to.htmlblocks);
        } else {
            this.htmlblock = htmlblock;
            next();
        }
    }.bind(this));
}
