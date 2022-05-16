const table = document.getElementById("save-tbody");

function addRow({ key, dateCreated, value, description, isURL, hits }) {
  const row = table.insertRow();
  const contentCell = row.insertCell();
  let targetElement;
  if (isURL) {
    targetElement = document.createElement("a");
    targetElement.setAttribute("href", value);
    targetElement.textContent = value;
  } else {
    targetElement = document.createElement("div");
    targetElement.textContent = value;
  }
  contentCell.appendChild(targetElement);
  if (description) {
    const descriptionElement = document.createElement("div");
    descriptionElement.textContent = description;
    descriptionElement.classList.add("small");
    descriptionElement.classList.add("text-muted");
    contentCell.appendChild(descriptionElement);
  }

  const dateCell = row.insertCell();
  const date = moment.utc(dateCreated);
  dateCell.appendChild(document.createTextNode(date.fromNow()));
  dateCell.setAttribute("title", date.local().format("YYYY-MM-DD HH:mm:ss"));

  const urlElement = document.createElement("span");
  const copyAnchor = document.createElement("a");
  copyAnchor.innerHTML = `<i class="fa fa-clipboard"></i>`;
  copyAnchor.onclick = () => copyURL(key);
  copyAnchor.classList.add("text-success");
  const urlAnchor = document.createElement("a");
  urlAnchor.href = `/s/${key}`;
  urlAnchor.textContent = `/${key}`;
  urlElement.appendChild(copyAnchor);
  urlElement.appendChild(document.createTextNode("\u00A0 "));
  urlElement.appendChild(urlAnchor);
  row.insertCell().appendChild(urlElement);
  row.insertCell().appendChild(document.createTextNode(hits));

  const actionAnchor = document.createElement("a");
  actionAnchor.classList.add("text-danger");
  actionAnchor.setAttribute("data-toggle", "modal");
  actionAnchor.setAttribute("data-target", "#deleteSavedModal");
  actionAnchor.setAttribute("data-key", key);
  actionAnchor.innerHTML = `<i class="fa fa-trash-o"></i>`;
  row.insertCell().appendChild(actionAnchor);
}

function copyURL(path) {
  const url = baseURL() + "s/" + path;
  copy(url);
  showAlert(`Copied ${url}!`);
}

function deleteSaved() {
  const key = $("#modal-confirm-message").text().slice(24, -1);
  fetch("/api/save/" + key, { method: "delete" }).then(() => {
    $("#deleteSavedModal").modal("hide");
    refresh();
    showAlert(`Item deleted!`);
  });
}

function refresh() {
  fetch("/api/save")
    .then((resp) => resp.json())
    .then((resp) => {
      table.innerHTML = "";
      $("h3").text(`Saved Contents (${resp.length})`);
      resp.forEach((item) => addRow(item));
    });
}

$(document).ready(function () {
  refresh();
  $("#deleteSavedModal").on("show.bs.modal", function (event) {
    const key = $(event.relatedTarget).data("key");
    $("#modal-confirm-message").text(`Are you sure to delete /${key}?`);
  });
});
