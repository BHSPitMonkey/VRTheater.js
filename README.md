# VRTheater.js

**NOTE: THIS IS A WORK IN PROGRESS; IT IS NOT YET FULLY FUNCTIONAL.**

A reusable, embeddable VR-mode HTML5 video player in JavaScript.

## Introduction

vrtheater.js is a drop-in JavaScript library that wraps any HTML5 video
element in a player interface made for head-mounted displays like the
Oculus Rift. Embed it into your web pages or web applications for an
easy VR multimedia experience without leaving the browser.

[three.js](http://threejs.org) is required.

See a live demo [here](http://bhspitmonkey.github.io/VRTheater.js/demo.html).

## Quick Start

```html
<script type="text/javascript" src="three.js"></script>
<script type="text/javascript" src="OculusRiftEffect.js"></script>
<script type="text/javascript" src="vrtheater.js"></script>
<script>
    function go() {
        var video = document.getElementById("movie");
        var options = {}; // Optional
        var player = new VRTheater.Player(video, options);
    }
</script>
...
<video id="movie" src="movie.webm"></video>
<button onclick="go()">Start VR Mode</button>
```

When you create a new VRTheater object and pass a video element to its 
constructor, a VRTheater canvas will be created containing the VR player.
By default, this player will cover the video element exactly, making itself
the same size.

## Options

| **Name**        | **Default**    | **Description** |
| --------------- | -------------- | --------------- |
| initialSize     | `"coverVideo"` | Covers the video element, matching its size. Other options are `"fillWindow"` (player covers entire viewport) and `"none"` (player canvas is hidden until you explicitly add it to the DOM)|
| startFullScreen | `false`        | If true, the canvas will call requestFullscreen on itself when created. |

## Events

TODO

## User Controls

The player's canvas listens for mouse and keyboard events for
controlling playback and requesting fullscreen mode.

|                    | Keyboard | Mouse        | Gamepad |
| ------------------ | -------- | ------------ | ------- |
| **Zoom in**        | Up       | Scroll up    |         |
| **Zoom out**       | Down     | Scroll down  |         |
| **Play/Pause**     | Space    |              |         |
| **Fullscreen**     |          | Double click |         |
| **Toggle 3D mode** | M        |              |         |

## License

Authors of included third-party code retain all rights to their contributions.
(OculusRiftEffect.js was licensed by its 
[original author](http://github.com/troffmo5) under the terms of the MIT 
License.)

All other software in this repository is provided under the MIT License.
Please see LICENSE for the full license text.
