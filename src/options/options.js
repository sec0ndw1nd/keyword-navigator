import { createKeywordListItem } from "../utils/create.js";
import {
  addLocalKeyword,
  deleteLocalKeywordsAll,
  getLocalKeywordsAll,
  updateLocalKeywords,
} from "../utils/storage.js";

function switchListTo(listId) {
  if (!["keywordList", "searchResultList"].includes(listId)) {
    console.error("invalid element id", listId);
    return;
  }
  let hiddenTarget = "keywordList";
  if (listId === "keywordList") hiddenTarget = "searchResultList";

  document.querySelectorAll(".listHidden").forEach(($) => {
    $.classList.remove("listHidden");
  });
  document.getElementById(hiddenTarget).classList.add("listHidden");
}

async function updateKeywordListView(shouldScrollDown = false) {
  const keywords = await getLocalKeywordsAll();
  const $list = document.getElementById("keywordList");
  $list.innerHTML = "";

  keywords.forEach((item) => {
    const $li = createKeywordListItem(item);
    $list.appendChild($li);
  });

  if (shouldScrollDown) {
    $list.lastElementChild.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }
}

async function updateSearchResultListView() {
  const $resultList = document.getElementById("searchResultList");
  $resultList.innerHTML = "";

  const $input = document.getElementById("search");
  $input.focus();
  const inputValue = $input.value.toLowerCase().trim();
  if (!inputValue) {
    switchListTo("keywordList");
    return;
  }

  const keywords = await getLocalKeywordsAll();
  const filtered = keywords.filter((d) =>
    d.keyword.toLowerCase().includes(inputValue)
  );

  filtered.forEach((item) => {
    const $li = createKeywordListItem(item);
    $resultList.appendChild($li);
  });
  switchListTo("searchResultList");
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

function toggleAskPopup() {
  const $askBubble = document.querySelector(".askBubble");
  $askBubble.classList.toggle("show");
  $askBubble.setAttribute("aria-hidden", $askBubble.classList.contains("show"));

  document.querySelector("#backdrop").classList.toggle("show");
}

/* ------------------------------- Event Handlers */

document.addEventListener("DOMContentLoaded", async () => {
  await updateKeywordListView(); // init update

  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === "local" && changes.keywords) {
      const prevLength = changes.keywords.oldValue.length;
      const currLength = changes.keywords.newValue.length;
      await updateKeywordListView(currLength > prevLength);

      const $searchResultList = document.getElementById("searchResultList");
      const hasSearchResult =
        !$searchResultList.classList.contains("listHidden");
      if (hasSearchResult) {
        await updateSearchResultListView();
      }
    }
  });

  const $form = document.getElementById("form");
  const $saveButton = document.getElementById("saveButton");
  const $exportButton = document.getElementById("exportButton");
  const $importFile = document.getElementById("importFile");
  const $importButton = document.getElementById("importButton");
  const $deleteAllButton = document.getElementById("deleteAllButton");
  const $searchInput = document.getElementById("search");
  const $searchButton = document.getElementById("searchButton");
  const $clearInputButton = document.getElementById("searchClearButton");

  $form.addEventListener("submit", handleSubmitForm);
  $saveButton.addEventListener("click", handleClickSave);
  $exportButton.addEventListener("click", handleClickExport);
  $importFile.addEventListener("change", handleImportFile);
  $importButton.addEventListener("click", handleClickImport.bind($importFile));

  $deleteAllButton.addEventListener("click", toggleAskPopup);
  document.getElementById("no").addEventListener("click", toggleAskPopup);
  document.getElementById("backdrop").addEventListener("click", toggleAskPopup);

  document.getElementById("yes").addEventListener("click", handleClickYes);

  $searchInput.addEventListener("keypress", handleSearchEnter);
  $searchInput.addEventListener("input", handleChangeInput);
  $searchButton.addEventListener("click", handleClickSearch);
  $clearInputButton.addEventListener("click", handleClickClearInput);
});

function handleChangeInput(event) {
  event.target.value
    ? event.target.classList.add("changed")
    : event.target.classList.remove("changed");
}

async function handleClickSave() {
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

  name.value = "";
  keyword.value = "";
  url.value = "";

  url.focus();
}

async function handleSubmitForm(event) {
  event.preventDefault();
  await handleClickSave();
}

async function handleClickExport() {
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
}

async function handleImportFile(event) {
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

        await updateLocalKeywords(importedData);
      } catch (error) {
        alert(error);
        console.error(error);
      }
    };
    reader.readAsText(file);
  }
}
function handleClickImport() {
  this.click(); // this = getElementById("importFile")
}

async function handleClickYes() {
  await deleteLocalKeywordsAll();
  toggleAskPopup();
}

async function handleSearchEnter(event) {
  if (event.key !== "Enter") return;
  await handleClickSearch();
}

async function handleClickSearch() {
  await updateSearchResultListView();
}

async function handleClickClearInput() {
  const $input = document.getElementById("search");
  $input.value = "";
  $input.dispatchEvent(new Event("input", { bubbles: true }));
  await updateSearchResultListView();
}
