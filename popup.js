//for pen
document.getElementById('pen').addEventListener('click',()=>{
  chrome.tabs.query({active: true,currentWindow: true},(tabs)=>{
    chrome.tabs.sendMessage(tabs[0].id,{action: "pen"});
  });
});
//for highlighter
document.getElementById('highlighter').addEventListener('click',()=>{
  chrome.tabs.query({active: true,currentWindow: true},(tabs)=>{
    chrome.tabs.sendMessage(tabs[0].id,{action: "highlighter"});
  });
});
//change in color
document.getElementById('stroke-color').addEventListener('change',(event)=>{
  chrome.tabs.query({active: true,currentWindow: true},(tabs)=>{
    chrome.tabs.sendMessage(tabs[0].id,{action: "stroke-color",color: event.target.value});
  });
});
//for saving
document.getElementById('save').addEventListener('click',()=>{
  chrome.tabs.query({active: true,currentWindow: true},(tabs)=>{
    chrome.tabs.sendMessage(tabs[0].id,{action: "save"});
  });
}); 
//for undo
document.getElementById('undo').addEventListener('click',()=>{
  chrome.tabs.query({active: true,currentWindow: true},(tabs)=>{
    chrome.tabs.sendMessage(tabs[0].id,{action: "undo"});
  });
});

