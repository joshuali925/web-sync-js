const socket = io();

function debounce(fn, ms) {
  let timer = 0;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(fn.bind(this, ...args), ms || 0);
  };
}

const copy_all = function () {
  const input = document.getElementById("textarea");
  if (navigator.userAgent.match(/ipad|iphone/i)) {
    // for iOS
    const range = document.createRange();
    range.selectNodeContents(input);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    input.setSelectionRange(0, 999999);
  } else {
    input.select();
  }
  document.execCommand("copy");
  $("#copybutton").focus();
  show_alert("All copied!");
};

const generate_qr = () => {
  socket.emit("generate qr");
};

const clear_all = () => {
  console.log("clearing text:");
  console.log($("#textarea").val());
  $("#textarea").val("");
  socket.emit("sync text", "");
  show_alert("Cleared!");
};

function show_alert(message) {
  $("#alert").html(message).slideDown(200);
  setTimeout(() => {
    $("#alert").slideUp(200);
  }, 1000);
}

$(document).ready(function () {
  $("#textarea").focus();

  socket.on("update textarea", function (text) {
    // console.log('update received ' + text);
    if (text.length === 0) {
      console.log("clearing text:");
      console.log($("#textarea").val());
    }
    $("#textarea").val(text);
  });

  socket.on("qr ready", (length) => {
    $(".modal-body").empty();
    for (let i = length - 1; i >= 0; i--) {
      $(".modal-body").prepend(
        `<img id="qrcode-img-${i}" src="images/temp/temp_qr${i}.png?${new Date().getTime()}" width="500" height="500" />`
      );
    }
  });

  const syncPadNadText = $("#syncpad-nav").text();
  let prevText = "";

  const debouncedSync = debounce(() => {
    const text = $("#textarea").val();
    console.log("❗text:", text);
    prevText = text;
    socket.emit("sync text", text);
    $("#syncpad-nav").text(syncPadNadText);
  }, 500);

  $("#textarea").on("change keyup keypress touchend paste", () => {
    if ($("#textarea").val() !== prevText) {
      $("#syncpad-nav").text(syncPadNadText + "*");
      debouncedSync();
    }
  });
});
