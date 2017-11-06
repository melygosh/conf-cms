/*
 * Change Navbar color while scrolling
*/

$(window).scroll(function () {
    handleTopNavAnimation();
});

$(window).on("load", function () {
    handleTopNavAnimation();
});

function handleTopNavAnimation() {
    var top = $(window).scrollTop();

    if (top > 10) {
        $('#site-nav').addClass('navbar-solid');
    }
    else {
        $('#site-nav').removeClass('navbar-solid');
    }
}

/*
 * Registration Form
*/

$('#registration-form').submit(function (e) {
    e.preventDefault();
    var postFormCommon = { //Fetch form data
        'country': $('#registration-form #country option:selected').text(),
        'phone': $('#registration-form #phone').val(),
        'email': $('#registration-form #email').val(),
        'degree': $('#registration-form #degree').val(),
        'academic_title': $('#registration-form #academic_title').val(),
    };

    Promise.all(['_ua', '_ru', '_en'].map((lang) => {
        var postForm = { //Fetch form data
            'lang' : lang.slice(1),
            'name': $('#registration-form #fname' + lang).val(),
            'last_name': $('#registration-form #lname' + lang).val(),
            'middle_name': $('#registration-form #pname' + lang).val(),
            'city': $('#registration-form #city' + lang).val(),
            'organization': $('#registration-form #organization' + lang).val(),
            'position': $('#registration-form #position' + lang).val(),
            'speach_title': $('#registration-form #speach_title' + lang).val(),
            'co_author': $('#registration-form #co_author' + lang).val()
        };
        Object.assign(postForm, postFormCommon);
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: 'POST',
                url: './registrations.json',
                data: { "Registration": postForm },
                dataType: 'json',
                success: function (data, statusText) {
                    if (!data.error) {
                        resolve(statusText)
                    }
                    else {
                        reject(data.error ? data.error : statusText);
                    }
                },
                error: (xhr, statusText) => reject(statusText)
            });
        });
    }))
    .then((statusText)=>{
        console.log("Success: " + statusText);
        $('#registration-msg .alert').html("Реєстрація прошла успiшно / Registration successful");
        $('#registration-msg .alert').removeClass("alert-danger");
        $('#registration-msg .alert').addClass("alert-success");
        $('#registration-msg').show();
        $('#registration')[0].scrollIntoView();
    },
    (statusText)=>{
        console.log("Error: " + statusText);
        $('#registration-msg .alert').html("Помилка реєстрації / Registration failed");
        $('#registration-msg .alert').removeClass("alert-success");
        $('#registration-msg .alert').addClass("alert-danger");
        $('#registration-msg').show();
        $('#registration')[0].scrollIntoView();
    });
});

/**
 * Set date counters
 */
$(".date-counter").each(function () {
    $(this).text(
        parseInt((new Date($(this).text()) - new Date()) / (3600 * 24000)));
});

/*
 * SmoothScroll
*/
var smoothScroll = new SmoothScroll('[data-scroll]');
