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
  socket.emit("sync text", "", focus_index);
  update_text_list("", focus_index);
  show_alert("Cleared!");
};

function show_alert(message) {
  $("#alert").html(message).slideDown(200);
  setTimeout(() => {
    $("#alert").slideUp(200);
  }, 1000);
}

function switch_focus(index) {
  return () => {
    focus_index = index;
    $("#textarea").val(text_list[index]);
  };
}

let text_list = ["", "", ""];
let focus_index = 0;

function change_toggle_styles(index, is_empty) {
  if (is_empty) {
    $("#label" + index).removeClass("btn-outline-primary");
    $("#label" + index).addClass("btn-outline-secondary");
    $("#label" + index).removeClass("font-weight-bold");
  } else {
    $("#label" + index).removeClass("btn-outline-secondary");
    $("#label" + index).addClass("btn-outline-primary");
    $("#label" + index).addClass("font-weight-bold");
  }
}

function update_text_list(text, index) {
  if (index == null) {
    text_list = text;
    text.forEach((t, i) => change_toggle_styles(i + 1, t.length === 0));
  } else {
    text_list[index] = text;
    change_toggle_styles(index + 1, text.length === 0);
  }
}

$(document).ready(function () {
  $("#textarea").focus();

  $("#focus1").on("change", switch_focus(0));
  $("#focus2").on("change", switch_focus(1));
  $("#focus3").on("change", switch_focus(2));

  socket.on("update textarea", function (text, index) {
    // console.log('update received ' + text);
    if (text.length === 0) {
      console.log(`clearing for textarea ${index}:`);
      console.log($("#textarea").val());
    }
    update_text_list(text, index);
    if (focus_index === index) $("#textarea").val(text);
  });

  socket.on("update all textarea", function (texts) {
    update_text_list(texts);
    $("#textarea").val(texts[focus_index]);
  });

  socket.on("qr ready", (length) => {
    $(".modal-body").empty();
    for (let i = length - 1; i >= 0; i--) {
      $(".modal-body").prepend(
        `<img id="qrcode-img-${i}" src="images/temp/temp_qr${i}.png?${new Date().getTime()}" width="500" height="500" />`
      );
    }
  });

  const sync_pad_nav_text = $("#syncpad-nav").text();

  const debounced_sync = debounce(() => {
    const text = $("#textarea").val();
    socket.emit("sync text", text, focus_index);
    update_text_list(text, focus_index);
    $("#syncpad-nav").text(sync_pad_nav_text);
  }, 500);

  $("#textarea").on("change keyup keypress touchend paste", () => {
    if ($("#textarea").val() !== text_list[focus_index]) {
      $("#syncpad-nav").text(sync_pad_nav_text + "*");
      debounced_sync();
    }
  });
});
