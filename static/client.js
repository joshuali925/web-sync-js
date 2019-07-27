let socket = io();


function delay(fn, ms) {
    let timer = 0
    return function (...args) {
        clearTimeout(timer)
        timer = setTimeout(fn.bind(this, ...args), ms || 0)
    }
}

$(document).ready(function () {
    socket.on('update textarea', function (text) {
        console.log('update received ' + text)
        $('#textarea').val(text);
    })
    
    $('#textarea').keyup(delay(function () {
        let text = $('#textarea').val();
        socket.emit('sync text', text)
        console.log(text);
    }, 500));
    
    $('#qrcodetext').hover(() => {
        $('#qrcodeimg').show('fast');
    });
    $('#qrcodeimg').hover(() => { }, () => {
        $('#qrcodeimg').fadeOut('slow');
    });
    $('#qrcodeimg').click(() => { }, () => {
        $('#qrcodeimg').fadeOut('slow');
    });
    
});


