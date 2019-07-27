let socket = io();

function wait(fn, ms) {
    let timer = 0;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(fn.bind(this, ...args), ms || 0);
    }
}

function copy_all() {
    $('#textarea').select();
    document.execCommand('copy');
    show_alert('Copied!');
}

function show_alert(message) {
    $("#alert").html(message).slideDown(200, () => $(this).show()).delay(1000).slideUp(200, () => $(this).hide());
}

$(document).ready(function () {
    socket.on('update textarea', function (text) {
        console.log('update received ' + text)
        $('#textarea').val(text);
    })

    $('#textarea').on('change keyup keypress', wait(function () {
        let text = $('#textarea').val();
        socket.emit('sync text', text)
        console.log(text);
    }, 500));

    $('#qrcodetext').hover(() => {
        $('#qrcodeimg').fadeIn('fast');
    });
    $('#qrcodeimg').hover(() => {}, () => {
        $('#qrcodeimg').fadeOut('slow');
    });
    $('#qrcodeimg').click(() => {}, () => {
        $('#qrcodeimg').fadeOut('slow');
    });
});