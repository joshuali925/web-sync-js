const socket = io();

let textList = ["", "", ""];
let focusIndex = 0;

function debounce(fn, ms) {
  let timer = 0;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(fn.bind(this, ...args), ms || 0);
  };
}

function copyAll() {
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
  showAlert("All copied!");
}

function generateQR() {
  socket.emit("generate qr", focusIndex);
}

function clearAll() {
  console.log("clearing text:");
  console.log($("#textarea").val());
  $("#textarea").val("");
  socket.emit("sync text", "", focusIndex);
  updateTextList("", focusIndex);
  showAlert("Cleared!");
}

function showAlert(message) {
  $("#alert").html(message).slideDown(200);
  setTimeout(() => {
    $("#alert").slideUp(200);
  }, 1000);
}

function switchFocus(index) {
  return () => {
    focusIndex = index;
    $("#textarea").val(textList[index]);
  };
}

function changeToggleStyles(index, isEmpty) {
  if (isEmpty) {
    $("#label" + index).removeClass("btn-outline-primary");
    $("#label" + index).addClass("btn-outline-secondary");
    $("#label" + index).removeClass("font-weight-bold");
  } else {
    $("#label" + index).removeClass("btn-outline-secondary");
    $("#label" + index).addClass("btn-outline-primary");
    $("#label" + index).addClass("font-weight-bold");
  }
}

function updateTextList(text, index) {
  if (index == null) {
    textList = text;
    text.forEach((t, i) => changeToggleStyles(i + 1, t.length === 0));
  } else {
    textList[index] = text;
    changeToggleStyles(index + 1, text.length === 0);
  }
}

$(document).ready(function () {
  $("#textarea").focus();

  $("#focus1").on("change", switchFocus(0));
  $("#focus2").on("change", switchFocus(1));
  $("#focus3").on("change", switchFocus(2));

  socket.on("update textarea", function (text, index) {
    // console.log('update received ' + text);
    if (text.length === 0) {
      console.log(`clearing for textarea ${index}:`);
      console.log($("#textarea").val());
    }
    updateTextList(text, index);
    if (focusIndex === index) $("#textarea").val(text);
  });

  socket.on("update all textarea", function (texts) {
    updateTextList(texts);
    $("#textarea").val(texts[focusIndex]);
  });

  socket.on("qr ready", (length) => {
    $(".modal-body").empty();
    for (let i = length - 1; i >= 0; i--) {
      $(".modal-body").prepend(
        `<img id="qrcode-img-${i}" src="images/temp/temp_qr${i}.png?${new Date().getTime()}" width="500" height="500" />`
      );
    }
  });

  const syncpadNavText = $("#syncpad-nav").text();

  const debouncedSync = debounce(() => {
    const text = $("#textarea").val();
    socket.emit("sync text", text, focusIndex);
    updateTextList(text, focusIndex);
    $("#syncpad-nav").text(syncpadNavText);
  }, 500);

  $("#textarea").on("change keyup keypress touchend paste", () => {
    if ($("#textarea").val() !== textList[focusIndex]) {
      $("#syncpad-nav").text(syncpadNavText + "*");
      debouncedSync();
    }
  });
});
