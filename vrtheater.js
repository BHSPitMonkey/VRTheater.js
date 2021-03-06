/**
 * @author Stephen Eisenhauer / http://stepheneisenhauer.com
 * 
 * VRTheater depends on Three.js (threejs.org).
 */

var VRTheater = { REVISION: '0' };

// 3D mode definitions
VRTheater.MODE_3D = {
	NONE: 0,
	HORIZONTAL: 1,
	VERTICAL: 2
}

// Define mappings for 3D modes
VRTheater.MAPPINGS = {};
VRTheater.MAPPINGS.NO_3D = [
  [new THREE.Vector2(0, 1), new THREE.Vector2(0, 0), new THREE.Vector2(1, 1)],
  [new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1)]
];
VRTheater.MAPPINGS.HORIZONTAL_LEFT = [
  [new THREE.Vector2(0, 1), new THREE.Vector2(0, 0), new THREE.Vector2(0.5, 1)],
  [new THREE.Vector2(0, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0.5, 1)]
];
VRTheater.MAPPINGS.HORIZONTAL_RIGHT = [
  [new THREE.Vector2(0.5, 1), new THREE.Vector2(0.5, 0), new THREE.Vector2(1, 1)],
  [new THREE.Vector2(0.5, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1)]
];

VRTheater.Player = function(video, options) {
	this.video = video;
	// TODO: Verify video is video element
	
	// Process options and do early decisionmaking
	// TODO: Actually process options passed in
	if (options !== undefined) alert("Warning: VRTheater options being ignored due to developer laziness"); // Sorry
	this.options = {
		initialSize: "coverVideo",
		startFullscreen: false
	};

	// Three.js setup
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 75, 16.0/10.0, 0.1, 1000 );
	this.renderer = new THREE.WebGLRenderer();
	this.canvas = this.renderer.domElement;

	// Handle adding the Canvas to the page
	switch (this.options.initialSize) {
		case "coverVideo":
			this.canvas.width = this.video.offsetWidth;
			this.canvas.height = this.video.offsetHeight;
			this.canvas.style.zIndex = 1;
			if (this.video.style.zIndex)
				this.canvas.style.zIndex = 1 + parseInt(this.video.style.zIndex);
			this.video.parentNode.insertBefore(this.canvas, this.video);
			this.canvas.focus();
			break;
		case "fillWindow":
			this.canvas.style.position = "fixed";
			this.canvas.style.top = 0;
			this.canvas.style.left = 0;
			this.canvas.style.width = "100%";
			this.canvas.style.height = "100%";
			this.canvas.style.zIndex = 2999999999;
			this.canvas.style.outline = "none";
			this.canvas.tabIndex = 1000;
			this.width = window.innerWidth;
			this.height = window.innerHeight;
			document.body.appendChild(this.canvas);
			this.canvas.focus();
			break;
		case "none":
		default:
			break;
	}

	// Handle asking for Fullscreen
	if (this.options.startFullscreen === true) {
		this.toggleFullscreen(true);
	}
	
	this.width = this.canvas.offsetWidth;
	this.height = this.canvas.offsetHeight;

	// Add OculusRiftEffect
	this.effect = new THREE.OculusRiftEffect(this.renderer);
	this.effect.setSize(this.width, this.height);
	this.effect.preLeftRender = function() {
		switch (this.mode3D) {
			case VRTheater.MODE_3D.NONE:
				this.geometry.faceVertexUvs[0] = VRTheater.MAPPINGS.NO_3D;
				this.geometry.uvsNeedUpdate = true;
				break;
			case VRTheater.MODE_3D.HORIZONTAL:
				this.geometry.faceVertexUvs[0] = VRTheater.MAPPINGS.HORIZONTAL_LEFT;
				this.geometry.uvsNeedUpdate = true;
				break;
		}
	}.bind(this);
	this.effect.preRightRender = function() {
		switch (this.mode3D) {
			case VRTheater.MODE_3D.HORIZONTAL:
				this.geometry.faceVertexUvs[0] = VRTheater.MAPPINGS.HORIZONTAL_RIGHT;
				this.geometry.uvsNeedUpdate = true;
				break;
		}
	}.bind(this);

	// Internal state
	this.mode3D = VRTheater.MODE_3D.NONE;

	// Set up a rectangular plane object as a screen
	this.geometry = new THREE.PlaneGeometry(15, 15*(this.video.videoHeight/this.video.videoWidth));
	this.texture = new THREE.Texture(this.video);
	var material = new THREE.MeshBasicMaterial({
		map: this.texture,
		overdraw: true,
		side:THREE.FrontSide
	});
	this.screen = new THREE.Mesh(this.geometry, material);
	this.screen.position.z = -10;
	this.video.addEventListener("resize", function(){ alert("Not resizing screen due to developer laziness"); }, false);
	this.scene.add(this.screen);

	// Set up skybox thing
	var cubegeometry = new THREE.CubeGeometry(100, 100, 200);
	var cubematerial = new THREE.MeshBasicMaterial( { color: 0x111111, side: THREE.BackSide } );
	var cube = new THREE.Mesh( cubegeometry, cubematerial );
	this.scene.add(cube);

	// Set up controls HUD
	this.controls = {};
	this.controls.geometry = new THREE.PlaneGeometry(8, 1);
	this.controls.canvas = document.createElement('canvas');
	this.controls.ctx = this.controls.canvas.getContext('2d');
	this.controls.canvas.width = 1024;
	this.controls.canvas.height = 128;
	this.controls.texture = new THREE.Texture(this.controls.canvas);
	var controlsMaterial = new THREE.MeshBasicMaterial({
		map: this.controls.texture,
		overdraw: true,
		side:THREE.FrontSide
	});
	this.controls.mesh = new THREE.Mesh(this.controls.geometry, controlsMaterial);
	this.controls.mesh.position.y = -2;
	this.controls.mesh.position.z = -4.5;
	this.controls.visible = true;
	this.controls.update = function() {
		var ctx = this.controls.ctx;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		ctx.fillStyle = "#444";
		ctx.fillRect (150, 50, 650, 28);
		ctx.fillStyle = "#ccc";
		ctx.fillRect (150, 50, 650*(this.video.currentTime/this.video.duration), 28);
	}.bind(this);
	this.scene.add(this.controls.mesh);

	// Set up keyboard capture
	document.addEventListener("keydown", function(e) {
		e = e || window.event;
		switch (e.keyCode) {
			case 38: // up arrow
				this.zoom(1);
				break;
			case 40: // down arrow
				this.zoom(-1);
				break;
			case 32: // spacebar
				this.togglePlayback();
				break;
			case 27: // esc
				this.destroy();
				break;
			case 77: // M
				this.mode3D = (this.mode3D + 1) % 2;
				break;
		}
	}.bind(this), false);

	// Listen for single click
	/* Disabled until a good solution for click/dblclick timing is decided
	this.canvas.addEventListener('click', function(e){ 
		this.togglePlayback();
	}, false); */

	// Listen for double click
	this.canvas.addEventListener('dblclick', function() {
		this.toggleFullscreen();
	}.bind(this), false);
	
	// Listen for mouse wheel
	this.canvas.addEventListener('mousewheel',function(e){
	  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	  this.zoom(delta);
	  return false;
	}.bind(this), false);

	// Animate
	this.animloop = function() {
		try {
			// Detect changes in canvas size and adjust as necessary
			if (this.canvas.offsetHeight != this.height || this.canvas.offsetWidth != this.width) {
				this.width = this.canvas.offsetWidth;
				this.height = this.canvas.offsetHeight;
				this.effect.setSize(this.width, this.height);
				this.camera.aspect = this.width / this.height;
				this.camera.updateProjectionMatrix();
			}
			// Update the video texture
			if( this.video.readyState === this.video.HAVE_ENOUGH_DATA ){
				this.texture.needsUpdate = true;
			}
			// Update the UI controls texture
			if (this.controls.visible === true) {
				this.controls.update();
				this.controls.texture.needsUpdate = true;
			}
			this.effect.render(this.scene, this.camera); // Render the scene
			requestAnimationFrame(this.animloop.bind(this));
		} catch (e) {
			alert("Sorry, something went wrong.");
			console.log(e);
			this.destroy();
		}
	};
	this.animloop();
};

VRTheater.Player.prototype = {

	constructor: VRTheater.Player,

	// Show a temporary text message on the screen
	toast: function(text) {
		// TODO: Draw a texture, show a sprite
	},

	togglePlayback: function() {
		if (this.video.paused)
			this.video.play();
		else
			this.video.pause();
		return this;
	},

	toggleFullscreen: function() {
		var alreadyFullscreen = false;
		// TODO: Determine
		
		if (alreadyFullscreen) {
			if (document.cancelFullScreen) {
				document.cancelFullScreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
		}
		else {
			if (this.canvas.requestFullscreen)
				this.canvas.requestFullscreen();
			else if (this.canvas.mozRequestFullScreen)
				this.canvas.mozRequestFullScreen();
			else if (this.canvas.webkitRequestFullscreen)
				this.canvas.webkitRequestFullscreen();
			else if (this.canvas.msRequestFullscreen)
				this.canvas.msRequestFullscreen();
			return this;
		}
	},

	zoom: function(dir) {
		if (dir == 1) { // Zoom in
			this.screen.position.z += 1; // Move screen closer
			if (this.screen.position.z > -1)
				this.screen.position.z = -1; // Limit closeness
		}    
		else if (dir == -1) { // Zoom out
			this.screen.position.z -= 1; // Move screen farther
			if (this.screen.position.z < -99)
				this.screen.position.z = -99; // Limit distance
		}
	},

	destroy: function() {
		this.canvas.parentNode.removeChild(this.canvas);
	}

};
