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
