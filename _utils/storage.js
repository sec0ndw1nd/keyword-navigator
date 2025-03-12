export async function getLocalKeywordsAll() {
  const { keywords } = await chrome.storage.local.get("keywords");
  return keywords || [];
}
export async function getLocalKeyword(keyword) {
  const keywords = await getLocalKeywordsAll();
  const found = keywords.find((v) => v.keyword === keyword);
  return found;
}

export async function updateLocalKeywords(keywords) {
  try {
    await chrome.storage.local.set({ keywords });
  } catch (error) {
    console.error(error);
  }
}

export async function addLocalKeyword({ keyword, name, url }) {
  const keywords = await getLocalKeywordsAll();
  keywords.push({ keyword, name, url });
  await updateLocalKeywords(keywords);
}

export async function deleteLocalKeyword(keyword) {
  const keywords = await getLocalKeywordsAll();
  const filtered = keywords.filter((k) => k.keyword !== keyword);

  try {
    await chrome.storage.local.set({ keywords: filtered });
  } catch (error) {
    console.error(error);
  }
}

export async function deleteLocalKeywordsAll() {
  try {
    await chrome.storage.local.clear();
  } catch (error) {
    console.error(error);
  }
}
