console.log("KOODA IMPLEMENTATION KE LIYE MAAFI");

let currentTool = null;
let currentColor = '#FFFF00';
let annotations = [];
let highlights = [];
let isDrawing = false;
let currentAction = 0, lastAction = 0;
let startX, startY, path;
let canvas, ctx;
let purpose = 2; 

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
  lastAction = currentAction;
  currentAction = 1;
  console.log("draw!");
  console.log(currentAction);
  console.log(lastAction);
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
    annotations.push({ tool: 'pen', color: currentColor, path: path, lastTask: lastAction });
  }
}

function wrapSelectedTextWithSpan(color) {
  let selection = window.getSelection();
  if (selection.rangeCount > 0) {
    let range = selection.getRangeAt(0);
    let span = document.createElement('span');
    span.style.backgroundColor = color;
    span.setAttribute('highlight-id', Date.now()); // Assigning a unique identifier
    range.surroundContents(span);
    highlights.push({ span: span.outerHTML, range: range.toString(), color: color, id: span.getAttribute('highlight-id'),lastTask: lastAction });
  }
}

function startHighlighting() {
  if(currentTool === 'highlighter'){
    console.log("again!");
    wrapSelectedTextWithSpan(currentColor);
    lastAction = currentAction;
    currentAction = 2;
    console.log("high!");
    console.log(currentAction);
    console.log(lastAction);
  }
}

function loadAnnotations() {
  chrome.runtime.sendMessage({ action: "loadAnnotations" }, (response) => {
    if (response && response.annotations) {
      annotations = response.annotations;
      highlights = response.highlights;
      purpose=2;
      redraw(purpose);
      console.log("Annotations loaded");
    } else {
      console.log("No annotations found");
    }
  });
}

function loadToolState() {
  chrome.storage.local.get(['PenStatus', 'HighlighterStatus','ColorStatus'], (result) => {
    if (result.PenStatus) {
      currentTool = 'pen';
      canvas.style.pointerEvents = 'auto';
      currentColor = result.ColorStatus;
    } else if (result.HighlighterStatus) {
      currentTool = 'highlighter';
      canvas.style.pointerEvents = 'none';
      currentColor = result.ColorStatus;
    } else {
      currentTool = null;
      canvas.style.pointerEvents = 'none';
      currentColor = result.ColorStatus;
    }
  });
}

function redraw(purpose) {
  console.log("Redrawing annotations");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // highlights redraw
  if(purpose === 2){
    highlights.forEach(highlight => {
      let span = document.createElement('span');
      span.innerHTML = highlight.range;
      span.style.backgroundColor = highlight.color;
      span.setAttribute('highlight-id', highlight.id);
      let bodyText = document.body.innerHTML;
      let highlightedText = bodyText.replace(highlight.range, span.outerHTML);
      document.body.innerHTML = highlightedText;
    });
  }
  //annotations redraw
  if(purpose===2 || purpose===1){
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
}

createCanvas();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.action === "pen") {
    currentTool = message.status2 ? 'pen' : null;
    canvas.style.pointerEvents = message.status2 ? 'auto' : 'none';
  } else if (message.action === "highlighter") {
    currentTool = message.status1 ? 'highlighter' : null;
    canvas.style.pointerEvents = message.status1 ? 'none' : 'none';

    if(currentTool === 'highlighter'){
      document.addEventListener('mousedown',startHighlighting);
    }
    // document.addEventListener('mousedown', () => {
    //   if (currentTool === "highlighter") {
    //     startHighlighting();
    //   }
    // });
  } else if (message.action === "color") {
    console.log("Setting color to", message.color);
    currentColor = message.color;
  } else if (message.action === "save") {
    console.log("Saving annotations");
    chrome.runtime.sendMessage({ action: "saveAnnotation", annotat: annotations, high: highlights }, (response) => {
      if (response && response.status === "success") {
        alert("Annotations Saved!");
      }
    });
  } else if (message.action === "undo") {
    purpose=1;
    console.log("Undoing last annotation");
    console.log(currentAction);
    if (currentAction === 1) {
      if (annotations.length > 0) {
        const lastAnnotation = annotations.pop();
        currentAction = lastAnnotation.lastTask;
        redraw(purpose);
      }
    } else if (currentAction === 2) {
      if (highlights.length > 0) {
        const lastHighlight = highlights.pop();
        const span = document.querySelector(`span[highlight-id="${lastHighlight.id}"]`);
        if (span) {
          span.replaceWith(document.createTextNode(span.textContent));
        }
        currentAction = lastHighlight.lastTask;
        redraw(purpose);
      }  
    }
    console.log(currentAction);
  }
});
