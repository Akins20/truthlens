// Minimal service worker — keeps the extension alive in MV3
chrome.runtime.onInstalled.addListener(() => {
  console.log("TruthLens installed");
});
