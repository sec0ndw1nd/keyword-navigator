import { createKeywordListItem } from "./create.js";

export function appendKeywords() {
  chrome.storage.sync.get("keywords", (data) => {
    const list = document.getElementById("keywordList");
    list.innerHTML = "";

    (data.keywords || []).forEach((item) => {
      const $li = createKeywordListItem(item);
      list.appendChild($li);
    });
  });
}

export function addKeyword({ name, keyword, url }) {
  chrome.storage.sync.get("keywords", (data) => {
    const keywords = data.keywords || [];
    keywords.push({ keyword, name, url });
    chrome.storage.sync.set({ keywords }, () => {
      appendKeywords();
    });
  });
}
export function deleteKeyword(keyword) {
  chrome.storage.sync.get("keywords", (data) => {
    const keywords = (data.keywords || []).filter((k) => k.keyword !== keyword);
    chrome.storage.sync.set({ keywords }, () => {
      appendKeywords();
    });
  });
}

export function navigateToKeyword(
  openInNewTab = false,
  selectedKeyword = undefined
) {
  const keyword =
    selectedKeyword || document.getElementById("keywordInput").value;

  chrome.storage.sync.get("keywords", (data) => {
    const foundData = data?.keywords?.find((k) => k.keyword === keyword);
    if (foundData) {
      if (openInNewTab) {
        chrome.tabs.create({ url: foundData.url });
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.update(tabs[0].id, { url: foundData.url });
        });
      }
      // close popup
      window.close();
    }
  });
}
