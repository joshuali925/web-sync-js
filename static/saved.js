const table = document.getElementById("save-tbody");

function addRow({ key, dateCreated, value, isURL, hits }) {
  const row = table.insertRow();
  const targetURLElement = document.createElement("a");
  targetURLElement.setAttribute("href", value);
  targetURLElement.textContent = value;
  row.insertCell().appendChild(targetURLElement);

  const dateCell = row.insertCell();
  const date = moment.utc(dateCreated);
  dateCell.appendChild(document.createTextNode(date.fromNow()));
  dateCell.setAttribute("title", date.local().format("YYYY-MM-DD HH:mm:ss"));

  const urlElement = document.createElement("span");
  urlElement.innerHTML = `
    <a class="text-success" onclick="copyURL('/s/${key}')" href="#"><i class="fa fa-clipboard"></i></a>
    &nbsp;<a href="/s/${key}">/s/${key}</a>
  `;
  row.insertCell().appendChild(urlElement);
  row.insertCell().appendChild(document.createTextNode(hits));

  const actionElement = document.createElement("div");
  actionElement.innerHTML = `<a class="text-danger" data-toggle="modal" data-target="#deleteSavedModal" data-key="${key}" href="#">
    <i class="fa fa-trash-o"></i></a>`;
  row.insertCell().appendChild(actionElement);
}

function copyURL(path) {
  copy(window.location.host + path);
  showAlert(`Copied ${window.location.host + path}!`);
}

function deleteSaved() {
  const key = $("#modal-confirm-message").text().slice(26, -1);
  fetch("./api/save/" + key, { method: "delete" }).then(() => {
    $("#deleteSavedModal").modal("hide");
    refresh();
    showAlert(`Item deleted!`);
  });
}

function refresh() {
  fetch("./api/save")
    .then((resp) => resp.json())
    .then((resp) => {
      table.innerHTML = '';
      resp.forEach((item) => addRow(item));
    });
}

$(document).ready(function () {
  refresh();
  $("#deleteSavedModal").on("show.bs.modal", function (event) {
    const key = $(event.relatedTarget).data("key");
    $(this).find(".modal-body p").text(`Are you sure to delete /s/${key}?`);
  });
});
