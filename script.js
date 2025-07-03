
let results = [];

async function fetchStatus(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return response.status || 200;
  } catch (e) {
    return 404;
  }
}

async function processURL(url) {
  const status = await fetchStatus(url.startsWith('http') ? url : 'http://' + url);
  results.push({ url, status });
  const row = document.createElement('tr');
  row.innerHTML = `<td>${url}</td><td>${status}</td>`;
  document.querySelector("#resultsTable tbody").appendChild(row);
}

function readExcel(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const urls = json.flat().filter(cell => typeof cell === 'string');
    if (urls.length === 0) return alert("No domains found in Excel!");

    document.getElementById("progress").textContent = `Progress: 0 / ${urls.length}`;

    let completed = 0;
    for (let url of urls) {
      await processURL(url);
      completed++;
      document.getElementById("progress").textContent = `Progress: ${completed} / ${urls.length}`;
    }

    alert("✅ Scan complete. You can now download the results.");
  };

  reader.readAsArrayBuffer(file);
}

function downloadResults() {
  const blob = new Blob([results.map(r => `${r.url}	${r.status}`).join("\n")], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'url_status_results.txt';
  a.click();
}
