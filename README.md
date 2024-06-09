# WebAnnotator
# Project Report: Web Annotator

## Garvit Khurana
Department of Electrical Engineering  
22115059

---

## Project Overview

**Web Annotator** is a Chrome extension which allows users to do annotations over different Web-pages. The core functionalities provided are pen, text-highlighter, customize color palette, save, and undo feature. One of the key features associated with the highlighter is contextual note to each highlighted content taken from the user itself. Also with the help of the save feature, the annotations will persist on web-pages whenever the user revisits. The undo feature helps users to overcome mistakes while doing annotations.

The report clearly explains both textually and visually through images about how the front-end of the extension looks as well as the explanation about the implementation of the back-end. 

The challenges faced and possible updates or features which can be added are discussed at the end of the report. Such types of Chrome extensions can be used in different domains such as education, research, corporate, journalism, personal use, software development, designing, etc.

---

## Table of Contents

1. [General requirements to build Chrome-extension](#general-requirements-to-build-chrome-extension)
2. [Flowcharts & Diagrams](#flowcharts--diagrams)
3. [Front-end Behaviour & Implementation](#front-end-behaviour--implementation)
4. [Back-end API Calls](#back-end-api-calls)
5. [Challenges faced](#challenges-faced)
6. [Possible upcoming updates & features](#possible-upcoming-updates--features)

---

## General requirements to build Chrome-extension

- **Manifest.json File**: Manifest is a JSON file which stores an abstract information of our Web-extension. It's basically an identity of our extension storing items like name, version, description, permissions, icon, and scripts of our extension. For any type of extension, this file is the first one to be created.
- **Popup Files**: There are mainly three types of Popup files required which includes `popup.html`, `popup.css` & `popup.js`. Each of them serves their own purpose and are interlinked. The HTML file is the skeleton of our extension, in web-annotator we added buttons for each feature and an input color palette. Obviously, no one likes the default look so to adjust margin and add some designing we made a CSS file which is linked to our HTML file. The main execution takes place from our JavaScript file which contains the logic of those HTML elements like buttons, inputs, etc. This file is further linked to other scripts as well.
- **Content.js File**: This file runs in context with our web-page. The moment you open any web-page and assuming extension is installed and necessary URL permissions are given then this file will be loaded first. It stores the logic behind tasks to be performed. Like in our case, it needs to store the drawing logic. Any type of command which is allowed to the user, this file stores its implementation in the form of different functions. You can think of it as the brain of our extension. In our web-annotator, it mainly stores the code of DOM manipulation.
- **Background.js File**: Background script serves the purpose of maintaining the current state of our extension. It includes implementation of actions such as saving annotations in our chrome local storage, loading annotations on reloading, etc. Basically, it's responsible for API calls. Background scripts can facilitate communication between different parts of your extension, such as the popup, content scripts, and other extension pages. This is done through message passing.

These were some general files needed for any type of web-extension. You may need other scripts if the feature is complex. To understand it visually flowchart and diagram are also added to this report.

---

## Flowcharts & Diagrams

<div style="display: flex; flex-direction: column; align-items: center;">
  <img src="images/Chrome-Extension-Architecture.jpg" alt="Architecture Diagram" style="width: 40%;">
  <p style="text-align: center;"><em>Figure 1: Architecture Diagram</em></p>
</div>

![Flowchart](flowchart.png)
*Figure 2: Flowchart*

---

## Front-end Behaviour & Implementation

- **Web-Annotator's front-end is written in HTML, CSS, and JavaScript.** First, let's see how it will look if you load the extension and open it.

    ![Extension's Front-end](frontend1.png)
    *Figure 3: Extension's Front-end*

- There are a total of 5 features which include drawing pen, text-highlighter, color-coded, save, and undo options. Let's go through each one of them to see how they work and what's the logic behind it.
- **Drawing Pen**: For implementing a pen I created the canvas which will allow me to draw. Every time a web-page is opened a canvas will be created therefore it's written in content script.
    - **Canvas**: It is a transparent 2D graphic HTML element used to draw graphs, animations, etc. I set canvas dimensions same as that of windows to make it suitable for every monitor size. On this canvas, three Event listeners were added to detect the pointer's movements.
        - Mouse Down allows us to detect if the mouse button is pressed within the range of the element. The callback function for this listener is `HandleMouseDown` where if the pen status is active/current tool is pen we will call `StartDrawing` function.
        - Mouse Move allows us to detect if the mouse is moved over the element. The callback function is `HandleMouseMove` from where we will call the `draw` function where the main drawing logic is implemented.
        - Mouse Up allows us to detect when we stopped moving after mouse down and move. The callback function is `HandleMouseUp` from where we called the `StopDrawing` function. In this Stop drawing function, we are storing the annotation path in a stack. This will help us later on in saving and undoing the annotations.
        - **Drawing Functions**: If the current tool is a pen and canvas detects mouse down then our flag "isDrawing" will be true and we get the coordinates using `e.clientX, e.clientY`. This will be the starting of our path and maintain this path as the form of `(X,Y)`.
        - After this as the mouse moves due to listeners our draw function will be called again and again and we keep on tracking the coordinates and storing them. Basic functions like begin path, move to, line to, and stroke are used. Used 2D context render to keep stroke style equal to the current color and stroke width remain constant.
        - The moment it stops we will push them in the `annotations` stack for further use of saving and undoing.

    ![Pen Tutorial](frontend2.png)
    *Figure 3: Pen Tutorial*

- **Text-Highlighter With Notes**: Highlighter has nothing to do with canvas because the implementation of it involves DOM manipulation. Here we are changing the background color of selected text. So the event listeners are added to the document object.
    - **Document Event Listeners**: There are 4 listeners added to the document if the current tool is a highlighter. The three are the same as that of pen that is `HandleMouseDown`, `HandleMouseMove`, `HandleMouseUp` with some modifications. The moment mouse up event occurs a prompt appears which takes the input of note associated with the corresponding highlight from the user. The 4th document event listener is of `click` which gives an alert showing the note attached to the highlight.
    - **DOM Manipulation**: This is done via wrapping of selected text with a span element. Using `window.getSelection()` to get the range and creating a span element and changing its background color and simply wrapping the range using `range.surroundContents()`. One thing to note is giving a specific id to span as this will help us to track the information of the element when we will redraw the highlights on reloading the web-page. Lastly, pushed this information in highlights stack to keep a record and can be used while saving/undoing.

- **Let's see how it works!**

    ![First Select Then Add Notes](frontend3.png)
    *Figure 4: First Select Then Add Notes*

    ![Highlight Tutorial](frontend4.png)
    *Figure 5: Highlight Tutorial*

    ![Pop Up Showing Notes After Clicking On Highlighted Text](frontend5.png)
    *Figure 6: Pop Up Showing Notes After Clicking On Highlighted Text*

- **Customize Color**: This feature is implemented using a simple HTML input element. Listeners were added in popup JavaScript files which store the value of the selected color as a string and pass it to the content script. By default, the color will be yellow. Any RGB value of color can be given too.
- **Saving & Undoing**: As told in pen and highlighter functionalities that a stack is implemented to store the last stroke of pen and highlighter in two different stacks named `annotations` & `highlights` respectively. These two stacks were passed to the background script to make Chrome API calls and save it in local storage. We will look at the background script in the next section. For Undo one more stack was implemented to have seamless interaction which is `Actions`. This actually stores the value as 1 OR 2. 1 represents that the last action was of pen else if it's 2 then a highlighter was used. Depending on its top value we can know out of other 2 stacks of annotations which has to be popped. A simple redraw function is called out which has the similar logic the way we did pen and highlighter.

    ![Pop-up Showing Annotations Saved](frontend6.png)
    *Figure 7: Pop-up Showing Annotations Saved*

---

## Back-end API Calls

To build this extension Chrome API was used multiple times to pass messages from popup files to content and background scripts and vice-versa.

- **Background Scripts**: The primary job is to maintain the state of extension in our case to make a save and load the annotations on reload. Chrome API was used for sending/receiving messages and storing/retrieving data from local storage.
- **Message Passing**: Chrome API provides 2 types of message passing mechanisms. `chrome.runtime.sendMessage()` and `chrome.runtime.onMessage.addListener()`. The first one sends the message to any part of the extension and the second one receives the message in the background. Using these two I passed data between the popup script to the content script and vice versa.
- **Local Storage**: Two main functions are `chrome.storage.local.set()` and `chrome.storage.local.get()`. First is used to save data into storage and the second one to get it. The data passed is in JSON format and therefore we can store a whole object in JSON format. From the content script, the annotations and highlights stack were sent to the background script via message passing and from the background script using `chrome.storage.local.set()` function data was saved in the local storage. So now every time you reload or revisit the web-page the canvas will be redrawn and the DOM manipulation of the highlight will be performed. This was achieved via `chrome.storage.local.get()` where the annotations and highlights stack will be passed to the content script and the previous drawing functions and DOM manipulation will be called accordingly.

---

## Challenges Faced

- **DOM Manipulation**: There were various challenges faced with respect to DOM manipulation. Selecting text and wrapping it with a span element with a unique id. Making that unique id persistent throughout reloads.
- **Canvas Redraw**: On reloading the web page redrawing the canvas was difficult because when reloaded, the context of the canvas is lost. Therefore, had to maintain an additional stack to get the coordinates of the previous annotations and call the same draw function again.
- **Responsive Design**: Making the extension responsive to different web-pages was a challenge. Ensuring that the canvas size is adjusted automatically based on different window sizes was tricky. Had to add various event listeners to resize the canvas on window resize events.

---

## Possible Upcoming Updates & Features

- **Collaborative Annotations**: A feature to share annotations with other users and collaborate in real-time.
- **Different Pen Styles**: Adding options for different pen styles such as dashed lines, dotted lines, etc.
- **Advanced Notes**: Making notes more advanced by adding options like images, links, etc., in the notes.
- **Text Recognition**: Implementing text recognition in the highlighted area to convert it to editable text.
- **Mobile Compatibility**: Making the extension compatible with mobile browsers.
- **Synchronization Across Devices**: Allowing annotations to be synchronized across different devices using the same Chrome account.
