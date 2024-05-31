chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveAnnotation") {
    try {
      chrome.storage.local.set({ annotations: message.annotat ,highlights : message.high}, () => {
        sendResponse({ status: "success" });
      });
    } catch (error) {
      console.error("Error saving annotations:", error);
      sendResponse({ status: "failure" });
    }
    return true; // Indicates that sendResponse will be called asynchronously
  } else if (message.action === "loadAnnotations") {
      chrome.storage.local.get(['annotations','highlights'], (result) => {
      sendResponse({ annotations: result.annotations , highlights: result.highlights});
    });
    return true; // Indicates that sendResponse will be called asynchronously
  }
});
