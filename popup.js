document.addEventListener('DOMContentLoaded',()=>{

  let PenStatus=false;
  let HighlighterStatus=false;
  // loading saved tools state
  chrome.storage.local.get(['PenStatus', 'HighlighterStatus'], (result) => {
    PenStatus = result.PenStatus || false;
    HighlighterStatus = result.HighlighterStatus || false;
    UpdateButton();
  });
  
  function UpdateButton(){
    document.getElementById('pen').style.backgroundColor = PenStatus ? '#D4D4D4' : 'FFFFFF';
    document.getElementById('highlighter').style.backgroundColor = HighlighterStatus ? '#D4D4D4' : 'FFFFFF';
  }
  
  //css will change on click
  document.getElementById('pen').addEventListener('click', () => {
    PenStatus=!PenStatus;
    HighlighterStatus=false;
    chrome.storage.local.set({ PenStatus, HighlighterStatus });
    UpdateButton();

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs.length > 0) {
        console.log("Sending 'pen' action to content script");
        chrome.tabs.sendMessage(tabs[0].id, {action: "pen" , status1 : HighlighterStatus,status2 : PenStatus});
      } else {
        console.error("No active tab found");
      }
    });
  });

  document.getElementById('highlighter').addEventListener('click', () => {
    HighlighterStatus=!HighlighterStatus;
    PenStatus=false;
    chrome.storage.local.set({ PenStatus, HighlighterStatus });
    UpdateButton();

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs.length > 0) {
        console.log("Sending 'highlighter' action to content script");
        chrome.tabs.sendMessage(tabs[0].id, {action: "highlighter" , status1 : HighlighterStatus,status2 : PenStatus});
      } else {
        console.error("No active tab found");
      }
    });
  });

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

});
  
