import { addKeyword, appendKeywords } from "../src/utils/keyword.js";

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

document.getElementById("saveButton").addEventListener("click", () => {
  const name = document.getElementById("name");
  const keyword = document.getElementById("keyword");
  const url = document.getElementById("url");
  name.value = name.value.trim();
  keyword.value = keyword.value.trim();
  url.value = url.value.trim();

  if (!name?.value || !keyword?.value || !url?.value) {
    alert("Please fill all fields.");
    return;
  }
  if (!isValidURL(url.value)) {
    alert("Invalid URL.");
    return;
  }
  addKeyword({ name: name.value, keyword: keyword.value, url: url.value });
});

document.getElementById("exportButton").addEventListener("click", () => {
  chrome.storage.sync.get("keywords", (data) => {
    const blob = new Blob([JSON.stringify(data.keywords || [], null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keyword_navigator_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});

document.getElementById("importFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // check validation
        if (!Array.isArray(importedData)) {
          throw new Error("Invalid JSON file: not an array.");
        }
        for (const d of importedData) {
          if (!d?.keyword || !d?.name || !d?.url) {
            throw new Error(`keyword: ${d?.keyword} ${
              !d?.keyword ? "<-- missing" : " (ok)"
            }
          name: ${d?.name} ${!d?.name ? "<-- missing" : " (ok)"}
          url: ${d?.url} ${!d?.url ? "<-- missing" : " (ok)"}`);
          }
        }

        chrome.storage.sync.set({ keywords: importedData }, () => {
          appendKeywords();
        });
      } catch (error) {
        alert(error.message);
      }
    };
    reader.readAsText(file);
  }
});
document.getElementById("importButton").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.addEventListener("DOMContentLoaded", appendKeywords);
