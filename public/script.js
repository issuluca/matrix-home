// === Matrix Rain Effect ===
const canvas = document.getElementById('matrixRain');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%';
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = Array.from({ length: columns }).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ff99';
  ctx.font = fontSize + 'px monospace';

  drops.forEach((y, i) => {
    const text = letters.charAt(Math.floor(Math.random() * letters.length));
    ctx.fillText(text, i * fontSize, y * fontSize);
    if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  });
}

setInterval(drawMatrix, 50);

// === Gestione Tabelle ===
let allLinks = [];
let currentTab = 'INTERNET';

async function loadData() {
  const res = await fetch('data/links.json');
  allLinks = await res.json();
  renderTable();
}

function renderTable(filter = '') {
  const tableBody = document.getElementById('tableBody');
  const tableHeader = document.getElementById('tableHeader');
  tableBody.innerHTML = '';
  tableHeader.innerHTML = '';

  const filteredLinks = allLinks.filter(item => {
    const matchTab = currentTab ? item.LOCATION === currentTab : true;
    const matchSearch = item.SITO.toLowerCase().includes(filter) ||
                        (item.LOCAL || '').toLowerCase().includes(filter) ||
                        (item.CLOUD || '').toLowerCase().includes(filter);
    return matchTab && matchSearch;
  });

  const hasLocal = filteredLinks.some(item => item.LOCAL);
  const hasCloud = filteredLinks.some(item => item.CLOUD);

  let headers = ['Titolo'];
  if (currentTab === 'INTERNET') headers.push('Link');
  else {
    if (hasLocal) headers.push('Locale');
    if (hasCloud) headers.push('Cloud');
  }

  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    tableHeader.appendChild(th);
  });

  filteredLinks.forEach(item => {
    const tr = document.createElement('tr');
    const tdTitle = document.createElement('td');
    tdTitle.textContent = item.SITO;
    tr.appendChild(tdTitle);

    if (currentTab === 'INTERNET') {
      const tdLink = document.createElement('td');
      tdLink.innerHTML = `<a href="${item.CLOUD}" target="_blank">${item.CLOUD}</a>`;
      tr.appendChild(tdLink);
    } else {
      if (item.LOCAL) {
        const tdLocal = document.createElement('td');
        tdLocal.innerHTML = `<a href="${item.LOCAL}" target="_blank">${item.LOCAL}</a>`;
        tr.appendChild(tdLocal);
      }
      if (item.CLOUD) {
        const tdCloud = document.createElement('td');
        tdCloud.innerHTML = `<a href="${item.CLOUD}" target="_blank">${item.CLOUD}</a>`;
        tr.appendChild(tdCloud);
      }
    }
    tableBody.appendChild(tr);
  });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    renderTable(document.getElementById('search').value.toLowerCase());
  });
});

document.getElementById('search').addEventListener('input', e => {
  const value = e.target.value.toLowerCase();
  renderTable(value);
});

loadData();
