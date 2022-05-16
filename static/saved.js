const table = document.getElementById("save-tbody");

let data = [];

function addRow({ key, dateCreated, isURL, hits }) {
  const row = table.insertRow();
  row.insertCell().appendChild(document.createTextNode("-"));

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
}

function copyURL(path) {
  copy(window.location.host + path);
  showAlert(`Copied ${window.location.host + path}!`);
}

fetch("./api/save")
  .then((resp) => resp.json())
  .then((resp) => {
    data = resp;
    resp.forEach((item) => addRow(item));
  });
