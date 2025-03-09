chrome.commands.onCommand.addListener((command) => {
  chrome.storage.sync.get("keywords", (data) => {
    const entry = (data.keywords || []).find((k) => k.keyword === command);
    if (entry) {
      chrome.tabs.create({ url: entry.url });
    }
  });
});
