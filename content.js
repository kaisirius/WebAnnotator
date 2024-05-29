console.log("KOODA IMPLEMENTATION KE LIYE MAAFI");

let currentTool = null;
let currentColor = '#000000';
let annotations = [];
let highlights = [];
let isDrawing = false;
let currentAction = 0,lastAction = 0;
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

  // Add event listeners for drawing and highlighting
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);

  // Load saved annotations and tool state
  loadAnnotations();
  loadToolState();
}

function handleMouseDown(e) {
  if (currentTool === 'pen') {
    startDrawing(e);
  } 
}

function handleMouseMove(e) {
  if (currentTool === 'pen' && isDrawing) {
    draw(e);
  }
}

function handleMouseUp(e) {
  if (currentTool === 'pen' && isDrawing) {
    stopDrawing();
  } 
}

function startDrawing(e) {
  isDrawing = true;
  lastAction=currentAction;
  currentAction=1;
  startX = e.clientX;
  startY = e.clientY;
  path = [{ x: startX, y: startY }];
}

function draw(e) {
  if (!isDrawing) return;
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 1.0;

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
    annotations.push({ tool: 'pen', color: currentColor, path: path ,lastTask: lastAction});
  }
}
function getTextCoordinates() {
  let selection = window.getSelection();
  if (selection.rangeCount > 0) {
    let range = selection.getRangeAt(0);
    let rects = range.getClientRects();
    return Array.from(rects);
  }
  return null;
}
function startHighlighting(e) {
  let rects = getTextCoordinates();
  if (rects) {
    // Store the new highlight
    highlights.push(...rects.map(rect => ({
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
      color: currentColor,
      lastTask: lastAction
    })));
    lastAction=currentAction;
    currentAction=2;
    // Redraw all highlights
    redraw();
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

function loadToolState() {
  chrome.storage.local.get(['PenStatus', 'HighlighterStatus'], (result) => {
    if (result.PenStatus) {
      currentTool = 'pen';
      canvas.style.pointerEvents = 'auto';
    } else if (result.HighlighterStatus) {
      currentTool = 'highlighter';
      canvas.style.pointerEvents = 'none';
    } else {
      currentTool = null;
      canvas.style.pointerEvents = 'none';
    }
  });
}

function redraw() {
  console.log("Redrawing annotations");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if(annotations.length > 0){
    annotations.forEach(annotation => {
      ctx.strokeStyle = annotation.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1.0;

      ctx.beginPath();
      const path = annotation.path;
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    });
  }
  if(highlights.length > 0){
    highlights.forEach(rect => {
      ctx.fillStyle = rect.color;
      console.log(rect.color);
      ctx.globalAlpha = 0.5;
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
    });
  }
  ctx.globalAlpha = 1.0; // Reset to default
}

createCanvas();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.action === "pen") {
    currentTool = message.status ? 'pen' : null;
    canvas.style.pointerEvents = message.status ? 'auto' : 'none';
  } else if (message.action === "highlighter") {
    currentTool = message.status ? 'highlighter' : null;
    canvas.style.pointerEvents = message.status ? 'none' : 'none';

    document.addEventListener('mouseup',(e)=>{
      if(currentTool === "highlighter") {
        startHighlighting(e);
      }
    })
  } else if (message.action === "color") {
    console.log("Setting color to", message.color);
    currentColor = message.color;
  } else if (message.action === "save") {
    console.log("Saving annotations");
    chrome.runtime.sendMessage({ action: "saveAnnotation", annotation: annotations, highlights: highlights }, (response) => {
      if (response && response.status === "success") {
        alert("Annotations Saved!");
      }
    });
  } else if (message.action === "undo") {
    console.log("Undoing last annotation");
    console.log(currentAction);
    if (currentAction === 1) {
      if(annotations.length > 0){
        const lastAnnotation = annotations.pop();
        currentAction=lastAnnotation.lastTask;
        redraw();
      }
    } else if (currentAction === 2) {
      if(highlights.length > 0){
        const lastHighlight = highlights.pop();
        highlights.pop();
        currentAction=lastHighlight.lastTask;
        redraw();
      }
    }
    console.log(currentAction);
  }
});
