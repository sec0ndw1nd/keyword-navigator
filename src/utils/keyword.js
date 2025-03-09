import { createKeywordListItem } from "./create.js";

export function appendKeywords() {
  chrome.storage.sync.get("keywords", (data) => {
    const list = document.getElementById("keywordList");
    list.innerHTML = "";
    for (const [key, entry] of Object.entries(data.keywords || {})) {
      const $li = createKeywordListItem(key, entry);
      list.appendChild($li);
    }
  });
}

export function addKeyword({ name, keyword, url }) {
  chrome.storage.sync.get("keywords", (data) => {
    const keywords = data.keywords || {};
    keywords[keyword] = { name, url };
    chrome.storage.sync.set({ keywords }, () => {
      appendKeywords();
    });
  });
}
export function deleteKeyword(keyword) {
  chrome.storage.sync.get("keywords", (data) => {
    const keywords = data.keywords || {};
    delete keywords[keyword];
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
    if (data.keywords && data.keywords[keyword]) {
      if (openInNewTab) {
        chrome.tabs.create({ url: data.keywords[keyword].url });
      } else {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
          chrome.tabs.update(tabs[0].id, { url: data.keywords[keyword].url });
        });
      }
      // close popup
      window.close();
    }
  });
}
