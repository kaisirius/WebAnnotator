console.log("Content script loaded");

let currentTool = 'null';
let currentColor = '#000000';
let annotations = [];
let undoStack = [];
let isDrawing = false;
let startX, startY, path;
let canvas, ctx;

// Create and append the canvas element to the body
function createCanvas() {
  canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');

  // Add event listeners for drawing
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  // Load saved annotations and ToolState
  loadAnnotations();
  loadToolState();
}

function startDrawing(e) {
  if(!currentTool) return;
  isDrawing = true;
  startX = e.clientX;
  startY = e.clientY;
  path = [{ x: startX, y: startY }];
}

function draw(e) {
  if (!isDrawing) return;

  ctx.strokeStyle = currentColor;
  ctx.lineWidth = currentTool === 'pen' ? 2 : 10;
  ctx.lineCap = 'round';

  if (currentTool === 'highlighter') {
    ctx.globalAlpha = 0.1; // Set transparency for highlighter
  } else {
    ctx.globalAlpha = 1.0; // Full opacity for pen
  }

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();

  startX = e.clientX;
  startY = e.clientY;
  path.push({ x: startX, y: startY });
}

function stopDrawing() {
  if (!isDrawing) return;
  isDrawing = false;
  if (path.length > 1) {
    annotations.push({ tool: currentTool, color: currentColor, path: path });
  }
}

function loadAnnotations() {
  chrome.runtime.sendMessage({ action: "loadAnnotations" }, (response) => {
    if (response && response.annotations) {
      annotations = response.annotations;
      redraw();
      console.log("Annotations loaded");
    } else {
      console.log("No annotations found");
    }
  });
}
function loadToolState(){
  chrome.storage.local.get(['PenStatus','HighlighterStatus'],(result)=>{
    if (result.PenStatus) {
      currentTool = 'pen';
      canvas.style.pointerEvents = 'auto';
    } else if (result.HighlighterStatus) {
      currentTool = 'highlighter';
      canvas.style.pointerEvents = 'auto';
    } else {
      currentTool = null;
      canvas.style.pointerEvents = 'none';
    }
  }); 
}
function redraw() {
  console.log("Redrawing annotations");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  annotations.forEach(annotation => {
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = annotation.tool === 'pen' ? 2 : 10;
    ctx.globalAlpha = annotation.tool === 'highlighter' ? 0.1 : 1.0;

    ctx.beginPath();
    const path = annotation.path;
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  });
}

createCanvas();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.action === "pen") {
    currentTool = message.status ? 'pen': null;
    canvas.style.pointerEvents = message.status ? 'auto' : 'none';
  } else if (message.action === "highlighter") {
    currentTool = message.status ? 'highlighter': null;
    canvas.style.pointerEvents = message.status ? 'auto' : 'none';
  } else if (message.action === "color") {
    console.log("Setting color to", message.color);
    currentColor = message.color;
  } else if (message.action === "save") {
    console.log("Saving annotations");
    chrome.runtime.sendMessage({ action: "saveAnnotation", annotation: annotations }, (response) => {
      if (response && response.status === "success") {
        alert("Annotations Saved!");
      }
    });
  } else if (message.action === "undo") {
    console.log("Undoing last annotation");
    if (annotations.length > 0) {
      const lastAnnotation = annotations.pop();
      undoStack.push(lastAnnotation);
      redraw();
    }
  }
});
