let socket = io();

function wait(fn, ms) {
    let timer = 0;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(fn.bind(this, ...args), ms || 0);
    }
}

let copy_all = function () {
    let elementId = 'textarea';
    let input = document.getElementById(elementId);
    if (navigator.userAgent.match(/ipad|iphone/i)) {  // for iOS
        let range = document.createRange();
        range.selectNodeContents(input);
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        input.setSelectionRange(0, 999999);
    } else {
        input.select();
    }
    document.execCommand('copy');
    $('#copybutton').focus();
    show_alert('All copied!');
};

const generate_qr = () => {
    socket.emit('generate qr');
};

let clear_all = () => {
    $('#textarea').val('');
    show_alert('Cleared!');
};

function show_alert(message) {
    $('#alert').html(message).slideDown(200);
    setTimeout(() => {
        $('#alert').slideUp(200);
    }, 1000);
}

$(document).ready(function () {
    $('#textarea').focus();

    socket.on('update textarea', function (text) {
        // console.log('update received ' + text);
        $('#textarea').val(text);
    })

    socket.on('qr ready', (length) => {
        $('.modal-body').empty();
        for (var i = length - 1; i >= 0; i--) {
            $('.modal-body').prepend(`<img id="qrcode-img-${i}" src="images/temp/temp_qr${i}.png?${new Date().getTime()}" width="500" height="500" />`)
        }
    })

    $('#textarea').on('change keyup keypress touchend', wait(function () {
        let text = $('#textarea').val();
        socket.emit('sync text', text)
    }, 500));
});
