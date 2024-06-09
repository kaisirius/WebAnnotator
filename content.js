console.log("BAKWAS IMPLEMENTATION KE LIYE MAAFI");

let Tool = null;
let Color = '#FFFF00'; //yellow
let Annotations = []; //for pen 
let Highlights = []; //for highlighter
let isDrawing = false;
let Actions = []; //track record of what we did last time 

let Canvas, Ctx; 
let purpose = 2; // For what purpose u are calling reload function (basically to distinguish)


function CreateCanvas() {
  Canvas = document.createElement('canvas');
  Canvas.style.position = 'absolute';
  Canvas.style.top = '0';
  Canvas.style.left = '0';
  Canvas.style.pointerEvents = 'none';
  Canvas.width = window.innerWidth;
  Canvas.height = window.innerHeight;
  document.body.appendChild(Canvas);
  Ctx = Canvas.getContext('2d');
  Ctx.clearRect(0, 0, Canvas.width, Canvas.height);
  
  Canvas.addEventListener('mousedown', MouseDown);
  Canvas.addEventListener('mousemove', MouseMove);
  Canvas.addEventListener('mouseup', MouseUp);

  ReloadAnnotations();
  ReloadToolState();
}
// delay in pop up coz error will come while adding notes
let TextSelecting = false;
let ClickTime;
let MouseMovedOrNot = false;

function MouseDown(e) {
  if (Tool === 'pen') {
    InitiateDrawing(e);
  } else if (Tool === 'highlighter') {
    TextSelecting = true;
    MouseMovedOrNot = false;
  }
}

function MouseMove(e) {
  if (Tool === 'pen' && isDrawing) {
    Draw(e);
  }else if(TextSelecting){
    MouseMovedOrNot = true;
  }
}

function MouseUp(e) {
  if (Tool === 'pen' && isDrawing) {
    PauseDrawing(Color);
  } else if (Tool === 'highlighter' && TextSelecting) {
    TextSelecting = false;
    if(MouseMovedOrNot){
      clearTimeout(ClickTime);
      ClickTime = setTimeout(() => {
        InitiateHighlighting();
      }, 200); 
    }
  }
}

function redraw(purpose) {
  console.log("Redrawing annotations");
  Ctx.clearRect(0, 0, Canvas.width, Canvas.height);
  
  
  // highlights redraw
  if(purpose === 2){
    // console.log(highlights.length);
    // console.log(555); DEBUG KAR RHA HUN IGNORE
    // let c=0;
    Highlights.forEach(highlight => {
      // c=c+1;
      // console.log(c);
      // console.log(highlight);
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
  if(purpose === 1){
    // console.log(annotations.length);
    // console.log(999);  DEBUG KAR RHA HUN IGNORE 
    // let counter=0;
    Annotations.forEach(annotation => {

      // counter=counter+1;
      // console.log(counter); 
      // console.log(annotation);
      Ctx.strokeStyle = annotation.color;
      Ctx.lineWidth = 2;
      Ctx.globalAlpha = 1.0;
      Ctx.lineCap = 'round';
      
      const paths = annotation.path;
      
      for (let i = 1; i < paths.length; i++) {
        Ctx.beginPath();
        Ctx.moveTo(paths[i-1].x, paths[i-1].y);
        Ctx.lineTo(paths[i].x, paths[i].y);
        Ctx.stroke();
      }
      
    });
  }
}
function ReloadAnnotations() {
  chrome.runtime.sendMessage({ action: "loadAnnotations" }, (response) => {
    if (response && response.annotations) 
    {
      Annotations = response.annotations;
      purpose=1;
      redraw(purpose);
      console.log("Annotations loaded");
    } 
    if(response && response.highlights)
    {
      Highlights = response.highlights;
      purpose=2;
      redraw(purpose);
      console.log("Highlights loaded");
    }
    else 
    {
      console.log("KUCH NHI MILA BHAI");
    }
  });
}

function ReloadToolState() {
  chrome.storage.local.get(['PenStatus', 'HighlighterStatus','ColorStatus'], (result) => {
    if (result.PenStatus === true) {
      Tool = 'pen';
      Canvas.style.pointerEvents = 'auto';
      Color = result.ColorStatus || '#FFFF00';
    } else if (result.HighlighterStatus === true) {
      Tool = 'highlighter';
      Canvas.style.pointerEvents = 'none';
      Color = result.ColorStatus || '#FFFF00';
    } else {
      Tool = null;
      Canvas.style.pointerEvents = 'none';
      Color = result.ColorStatus || '#FFFF00';
    }
  });
}
//x,y coordinates for pen tracking
let CurrentX, CurrentY, Path;

function InitiateDrawing(e) {
  Canvas.style.pointerEvents = 'auto';
  isDrawing = true;
  console.log("draw!");
  CurrentX = e.clientX;
  CurrentY = e.clientY;
  Path = [{ x: CurrentX, y: CurrentY }];
}

function Draw(e) {
  if (!isDrawing) return; 
  Ctx.strokeStyle = Color;
  Ctx.lineWidth = 2;
  Ctx.lineCap = 'round';
  Ctx.globalAlpha = 1.0;

  Ctx.beginPath();
  Ctx.moveTo(CurrentX, CurrentY);
  Ctx.lineTo(e.clientX, e.clientY);
  Ctx.stroke();

  CurrentX = e.clientX;
  CurrentY = e.clientY;
  Path.push({ x: CurrentX, y: CurrentY });
}

function PauseDrawing(color) {
  if (!isDrawing) return;
  isDrawing = false;
  if (Path.length > 1) {
    Actions.push(1);
    Annotations.push({ tool: 'pen', color: color, path: Path });
  }
}

function WrapSelectedTextWithSpan(color,notes) {
  let selection = window.getSelection();
  if (selection.rangeCount > 0) {
    let range = selection.getRangeAt(0);
    const contents = range.cloneContents();
    const walker = document.createTreeWalker(contents, NodeFilter.SHOW_ALL, null, false);
    let hasNonTextNode = false;
    while (walker.nextNode()) {
      if (walker.currentNode.nodeType !== Node.TEXT_NODE) {
        hasNonTextNode = true;
        break;
      }
    }
    if (hasNonTextNode) {
      alert('Please select only textual content.');
    } 
    else{
      let span = document.createElement('span');
      span.style.backgroundColor = color;
      span.setAttribute('highlight-id', Date.now()); 
      range.surroundContents(span);
      Actions.push(2);
      Highlights.push({ span: span.outerHTML, range: range.toString(), color: color, id: span.getAttribute('highlight-id'),note: notes });
    }
  }
}

function InitiateHighlighting() {
  if(Tool === 'highlighter'){
    console.log("again!");
    let note = prompt("Enter a note for this highlight:");
    WrapSelectedTextWithSpan(Color,note);
    console.log("high!");
  }
}



CreateCanvas();

document.addEventListener('click', (event) => {
  if (event.target.tagName === 'SPAN' && event.target.hasAttribute('highlight-id')) {
    let highlightId = event.target.getAttribute('highlight-id');
    let highlight = Highlights.find(h => h.id === highlightId);
    if (highlight && highlight.note) {
      alert(`Note: ${highlight.note}`);
    }
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.action === "pen") {
    Tool = message.status2 ? 'pen' : null;
    Canvas.style.pointerEvents = message.status2 ? 'auto' : 'none';
  } else if (message.action === "highlighter") {
    Tool = message.status1 ? 'highlighter' : null;
    Canvas.style.pointerEvents = message.status1 ? 'none' : 'none';
    if(Tool === 'highlighter'){
      document.addEventListener('mousedown', MouseDown);
      document.addEventListener('mousemove', MouseMove);
      document.addEventListener('mouseup', MouseUp);
    }
    // document.addEventListener('mousedown', () => {
    //   if (currentTool === "highlighter") {
    //     startHighlighting();
    //   }
    // });
  } else if (message.action === "color") {
    console.log("Setting color to", message.color);
    Color = message.color;
  } else if (message.action === "save") {
    console.log("Saving annotations");
    chrome.runtime.sendMessage({ action: "saveAnnotation", annotat: Annotations, high: Highlights }, (response) => {
      if (response && response.status === "success") {
        alert("Annotations Saved!");
      }
    });
  } else if (message.action === "undo") {
    
    console.log("Undoing last annotation");
    const CurrentAction = Actions.pop();
    console.log(CurrentAction);
    if (CurrentAction === 1) {
      if (Annotations.length > 0) {
        const lastAnnotation = Annotations.pop();
        purpose=1;
        redraw(purpose);
      }
    } else if (CurrentAction === 2) {
      if (Highlights.length > 0) {
        const lastHighlight = Highlights.pop();
        const span = document.querySelector(`span[highlight-id="${lastHighlight.id}"]`);
        if (span) {
          span.replaceWith(document.createTextNode(span.textContent));
        }  
        purpose=2; 
        redraw(purpose);
      }  
    }
  }
});
