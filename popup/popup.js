import { getLocalKeyword, getLocalKeywordsAll } from "../src/utils/storage.js";

const LOADED_KEYWORDS = await getLocalKeywordsAll();

async function navigateToKeyword(
  openInNewTab = false,
  selectedKeyword = undefined
) {
  const keyword =
    selectedKeyword || document.getElementById("keywordInput").value;

  const data = await getLocalKeyword(keyword);
  if (data) {
    if (openInNewTab) {
      chrome.tabs.create({ url: data.url });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url: data.url });
      });
    }
    // close popup
    window.close();
  }
}

document
  .getElementById("searchButton")
  .addEventListener("click", navigateToKeyword);
document
  .getElementById("keywordInput")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const selectedKeyword =
        document.querySelector(".selected")?.dataset?.keyword;
      navigateToKeyword(event.shiftKey, selectedKeyword);
    }
  });
document.getElementById("keywordInput").addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();

    const $suggestionList = document.getElementById("suggestions");
    if ($suggestionList.children.length === 0) return;

    const $selected = $suggestionList.querySelector(".selected");
    if (!$selected) {
      $suggestionList.firstElementChild.classList.add("selected");
      return;
    }

    const isArrowUp = event.key === "ArrowUp";
    const $slibing = isArrowUp
      ? $selected.previousElementSibling
      : $selected.nextElementSibling;
    if ($slibing) {
      $selected.classList.remove("selected");
      $slibing.classList.add("selected");
      $slibing.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }
});
document.getElementById("keywordInput").addEventListener("input", (event) => {
  const inputValue = event.target.value.toLowerCase();
  const $suggestionList = document.getElementById("suggestions");

  const filtered = LOADED_KEYWORDS.filter((d) =>
    d.keyword.toLowerCase().includes(inputValue)
  );

  $suggestionList.innerHTML = "";
  if (filtered && filtered.length > 0 && inputValue) {
    $suggestionList.style.display = "block";
    filtered.forEach((d, i) => {
      const li = document.createElement("li");
      if (i === 0) li.classList.add("selected");

      li.textContent = `${d.keyword} -     ${d.name}`;
      li.dataset.keyword = d.keyword;
      li.addEventListener("click", () => {
        document.getElementById("keywordInput").value = d.keyword;
        navigateToKeyword(false);
      });
      $suggestionList.appendChild(li);
    });
  } else {
    $suggestionList.style.display = "none";
  }
});

document.getElementById("suggestions").addEventListener("mouseenter", () => {
  document.querySelectorAll(".selected").forEach((elem) => {
    elem.classList.remove("selected");
  });
});
