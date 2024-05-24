chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveAnnotation") {
    console.log("Saving annotations in local storage");
    try {
      chrome.storage.local.set({ annotations: message.annotation }, () => {
        sendResponse({ status: "success" });
      });
    } catch (error) {
      console.error("Error saving annotations:", error);
      sendResponse({ status: "failure" });
    }
    return true; // Indicates that sendResponse will be called asynchronously
  } else if (message.action === "loadAnnotations") {
    chrome.storage.local.get('annotations', (result) => {
      sendResponse({ annotations: result.annotations || [] });
    });
    return true; // Indicates that sendResponse will be called asynchronously
  }
});
