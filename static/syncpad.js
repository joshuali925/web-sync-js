const socket = io();

let textList = ["", "", ""];
let focusIndex = 0;

function copySyncPadContent() {
  const input = document.getElementById("textarea");
  copy(input);
  $("#copybutton").focus();
  showAlert("All copied!");
}

function generateQR() {
  socket.emit("generate qr", focusIndex);
}

function clearSyncPadContent() {
  console.log("clearing text:");
  console.log($("#textarea").val());
  $("#textarea").val("");
  socket.emit("sync text", "", focusIndex);
  updateTextList("", focusIndex);
  showAlert("Cleared!");
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
    $("#qrcode-modal-body").empty();
    for (let i = length - 1; i >= 0; i--) {
      $("#qrcode-modal-body").prepend(
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

  $("#form-save-button").click(function (e) {
    e.preventDefault();
    fetch("./api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: focusIndex,
        key: $("#form-key-input").val(),
        isURL: document.getElementById("form-isURL").checked,
        isVisible: document.getElementById("form-isVisible").checked,
      }),
    })
      .then((resp) => resp.json())
      .then((json) => {
        $("#saveModalContainer").modal("hide");
        $("#form-key-input").val("");
        if (json.error) {
          console.error(json);
          showAlert(`Error: ${JSON.stringify(json.error)}`, 3000, "danger");
        } else {
          showAlert(`Saved to /s/${json.key}`, 3000);
        }
      });
  });

  $("#saveModalContainer").on("shown.bs.modal", function () {
    $("#form-key-input").focus();
  });
});
