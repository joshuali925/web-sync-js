function debounce(fn, ms) {
  let timer = 0;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(fn.bind(this, ...args), ms || 0);
  };
}

function showAlert(message, lifeTime = 1000, status = "success") {
  $("#alert").removeClass();
  $("#alert").addClass(`alert alert-${status}`);
  $("#alert").html(message).slideDown(200);
  setTimeout(() => {
    $("#alert").slideUp(200);
  }, lifeTime);
}

function baseURL() {
  return window.location.protocol + "//" + window.location.host + "/";
}

function copy(target) {
  let shouldRemoveElement = false;
  if (typeof target === "string") {
    const text = target;
    target = document.createElement("textarea");
    target.value = text;
    document.body.appendChild(target);
    shouldRemoveElement = true;
  }
  if (navigator.userAgent.match(/ipad|iphone/i)) {
    // for iOS
    const range = document.createRange();
    range.selectNodeContents(target);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    target.setSelectionRange(0, 999999);
  } else {
    target.select();
  }
  document.execCommand("Copy");
  if (shouldRemoveElement) target.remove();
}

$(document).ready(function () {
  $("li.active").removeClass("active");
  $('a[href="' + location.pathname + '"]')
    .closest("li")
    .addClass("active");
  $("#qrcodetext").hover(() => {
    $("#qrcodeimg").fadeIn("fast");
  });
  $("#qrcodeimg").hover(
    () => {},
    () => {
      $("#qrcodeimg").fadeOut("slow");
    }
  );
  $("#qrcodeimg").click(
    () => {},
    () => {
      $("#qrcodeimg").fadeOut("slow");
    }
  );
  $("#toggle-theme").click(
    () => {},
    () => {
      $("body")[0].className =
        $("body")[0].className === "bootstrap" ? "bootstrap-dark" : "bootstrap";
    }
  );
});
