const canvas = document.getElementById("matrixRain");
const ctx = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
const font_size = 14;
const columns = canvas.width / font_size;
const drops = Array(Math.floor(columns)).fill(1);

// effetto pioggia matrix
function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#003300";
  ctx.font = font_size + "px monospace";
  for (let i = 0; i < drops.length; i++) {
    const text = matrix.charAt(Math.floor(Math.random() * matrix.length));
    ctx.fillText(text, i * font_size, drops[i] * font_size);
    if (drops[i] * font_size > canvas.height && Math.random() > 0.975)
      drops[i] = 0;
    drops[i]++;
  }
}
setInterval(drawMatrix, 35);

let linksData = [];
const tableContainer = document.getElementById("tableContainer");
const searchInput = document.getElementById("searchInput");
const buttons = document.querySelectorAll(".tab-button");

async function loadLinks() {
  const res = await fetch("../data/links.json");
  linksData = await res.json();
  showTab("INTERNET");
}
loadLinks();

function showTab(tab) {
  buttons.forEach((btn) => btn.classList.remove("active"));
  document
    .querySelector(`[data-tab="${tab}"]`)
    .classList.add("active");

  const filtered = linksData.filter((l) => l.LOCATION === tab);
  renderTable(filtered);
}

function renderTable(data) {
  let html = "<table><tr>";
  const headers = Object.keys(data[0] || {});
  headers.forEach((h) => (html += `<th>${h}</th>`));
  html += "</tr>";

  data.forEach((row) => {
    html += "<tr>";
    headers.forEach((h) => {
      const val = row[h];
      if (val && val.startsWith("http"))
        html += `<td><a href="${val}" target="_blank">${val}</a></td>`;
      else html += `<td>${val || ""}</td>`;
    });
    html += "</tr>";
  });

  html += "</table>";
  tableContainer.innerHTML = html;
}

buttons.forEach((btn) =>
  btn.addEventListener("click", () => showTab(btn.dataset.tab))
);

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = linksData.filter((link) =>
    Object.values(link).some((v) =>
      String(v).toLowerCase().includes(q)
    )
  );
  renderTable(filtered);
});
