import { createKeywordListItem } from "../src/utils/create.js";
import {
  addLocalKeyword,
  deleteLocalKeywordsAll,
  getLocalKeywordsAll,
} from "../src/utils/storage.js";

async function updateKeywordListView() {
  const keywords = await getLocalKeywordsAll();
  const $list = document.getElementById("keywordList");
  $list.innerHTML = "";

  keywords.forEach((item) => {
    const $li = createKeywordListItem(item);
    $list.appendChild($li);
  });
}

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === "local" && changes.keywords) {
    await updateKeywordListView();
  }
});

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}
document.getElementById("saveButton").addEventListener("click", async () => {
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

  await addLocalKeyword({
    name: name.value,
    keyword: keyword.value,
    url: url.value,
  });
});

document.getElementById("exportButton").addEventListener("click", async () => {
  const keywords = await getLocalKeywordsAll();
  const blob = new Blob([JSON.stringify(keywords, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "keyword_navigator_backup.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("importFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
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

        await chrome.storage.local.set({ keywords: importedData });
      } catch (error) {
        console.error(error);
      }
    };
    reader.readAsText(file);
  }
});
document.getElementById("importButton").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

function toggleAskPopup() {
  const $askBubble = document.querySelector(".askBubble");
  $askBubble.classList.toggle("show");
  $askBubble.setAttribute("aria-hidden", $askBubble.classList.contains("show"));

  document.querySelector("#backdrop").classList.toggle("show");
}
document.getElementById("deleteAllButton").addEventListener("click", () => {
  toggleAskPopup();
});
document.getElementById("yes").addEventListener("click", async () => {
  await deleteLocalKeywordsAll();
  toggleAskPopup();
});
document.getElementById("no").addEventListener("click", () => {
  toggleAskPopup();
});
document.getElementById("backdrop").addEventListener("click", () => {
  toggleAskPopup();
});

document.addEventListener("DOMContentLoaded", updateKeywordListView);
