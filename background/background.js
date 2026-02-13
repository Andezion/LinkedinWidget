chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('skills', (data) => {
    if (!data.skills) {
      chrome.storage.local.set({ skills: [] });
    }
  });
});
