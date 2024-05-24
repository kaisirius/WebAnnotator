//pen event
document.getElementById('pen').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs.length > 0) {
      console.log("Sending 'pen' action to content script");
      chrome.tabs.sendMessage(tabs[0].id, {action: "pen"});
    } else {
      console.error("No active tab found");
    }
  });
});
//highlighter event
document.getElementById('highlighter').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs.length > 0) {
      console.log("Sending 'highlighter' action to content script");
      chrome.tabs.sendMessage(tabs[0].id, {action: "highlighter"});
    } else {
      console.error("No active tab found");
    }
  });
});
//picking color
document.getElementById('stroke-color').addEventListener('change', (event) => {
  const selectedColor=event.target.value;
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs.length > 0) {
      console.log("Sending 'color' action to content script");
      chrome.tabs.sendMessage(tabs[0].id, {action: "color", color: selectedColor});
    } else {
      console.error("No active tab found");
    }
  });
});
//for saving annotations
document.getElementById('save').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs.length > 0) {
      console.log("Sending 'save' action to content script");
      chrome.tabs.sendMessage(tabs[0].id, {action: "save"});
    } else {
      console.error("No active tab found");
    }
  });
});
//for undoing last annotation
document.getElementById('undo').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs.length > 0) {
      console.log("Sending 'undo' action to content script");
      chrome.tabs.sendMessage(tabs[0].id, {action: "undo"});
    } else {
      console.error("No active tab found");
    }
  });
});
