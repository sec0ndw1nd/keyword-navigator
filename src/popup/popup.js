import { getLocalKeyword, getLocalKeywordsAll } from "../utils/storage.js";

let LOADED_KEYWORDS = [];

async function navigateToKeyword(openInNewTab = false) {
  const keyword = document.querySelector(".selected")?.dataset?.keyword;
  if (!keyword) return;
  try {
    const data = await getLocalKeyword(keyword);
    if (!data) return;

    if (openInNewTab) chrome.tabs.create({ url: data.url });
    else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url: data.url });
      });
    }
    window.close();
  } catch (error) {
    console.error("Error navigating to keyword:", error);
  }
}
function clearSelection($preSelectedSuggestions) {
  const $suggestionList =
    $preSelectedSuggestions || document.getElementById("suggestions");
  $suggestionList.querySelectorAll(".selected").forEach(($li) => {
    $li.classList.remove("selected");
  });
}

/* ------------------------------- Event Handlers */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    LOADED_KEYWORDS = await getLocalKeywordsAll();
  } catch (error) {
    console.error("Error loading keywords:", error);
  }

  const $suggestion = document.getElementById("suggestions");
  const $goButton = document.getElementById("goButton");
  const $keywordInput = document.getElementById("keywordInput");

  $suggestion.addEventListener("mouseover", handleMouseOverListItem);
  $suggestion.addEventListener("click", handleClickListItem);
  $goButton.addEventListener("click", handleClickGo);
  $keywordInput.addEventListener("keypress", handlePressEnter);
  $keywordInput.addEventListener("keydown", handleKeyDown.bind($suggestion));
  $keywordInput.addEventListener("input", handleInput.bind($suggestion));
});

function handleClickGo(event) {
  navigateToKeyword(event.shiftKey);
}

function handlePressEnter(event) {
  if (event.key !== "Enter") return;
  navigateToKeyword(event.shiftKey);
}

function handleKeyDown(event) {
  if (["ArrowUp", "ArrowDown"].includes(event.key)) {
    event.preventDefault();
    const $suggestionList = this; // this = document.getElementById("suggestions");
    if ($suggestionList.children.length === 0) return;

    const $selected = $suggestionList.querySelector(".selected");
    if (!$selected) {
      $suggestionList.firstElementChild.classList.add("selected");
      return;
    }

    const isArrowUp = event.key === "ArrowUp";
    const $sibling = isArrowUp
      ? $selected.previousElementSibling
      : $selected.nextElementSibling;
    if (!$sibling) return;

    clearSelection($suggestionList);
    $sibling.classList.add("selected");
    $sibling.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

function handleInput(event) {
  const inputValue = event.target.value.toLowerCase().trim();
  const filtered = LOADED_KEYWORDS.filter((d) =>
    d.keyword.toLowerCase().includes(inputValue)
  );

  // update #suggestion
  const $suggestionList = this; // this = document.getElementById("suggestions");
  $suggestionList.innerHTML = "";
  if (filtered.length > 0 && inputValue) {
    $suggestionList.style.display = "block";

    filtered.forEach((d) => {
      const $li = document.createElement("li");
      $li.textContent = `${d.keyword} = ${d.name}`;
      $li.dataset.keyword = d.keyword;
      $suggestionList.appendChild($li);
    });
    $suggestionList.children[0].classList.add("selected");
  } else {
    $suggestionList.style.display = "none";
  }
}

function handleMouseOverListItem(event) {
  if (event.target.tagName !== "LI") return;
  clearSelection();
  event.target.classList.add("selected");
}

function handleClickListItem(event) {
  if (event.target.tagName !== "LI") return;
  navigateToKeyword(event.shiftKey);
}
