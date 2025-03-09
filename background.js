chrome.commands.onCommand.addListener((command) => {
  chrome.storage.sync.get("keywords", (data) => {
    const entry = data.keywords[command];
    if (entry) {
      chrome.tabs.create({ url: entry.url });
    }
  });
});
