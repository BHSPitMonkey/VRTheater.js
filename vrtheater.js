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
	this.camera = new THREE.PerspectiveCamera( 75, video.videoWidth/video.videoHeight, 0.1, 1000 );
	this.renderer = new THREE.WebGLRenderer();
	this.canvas = this.renderer.domElement;

	// Handle adding the Canvas to the page
	switch (this.options.initialSize) {
		case "coverVideo":
			this.canvas.style.width = this.video.width;
			this.canvas.style.height = this.video.height;
			this.canvas.style.zIndex = 1;
			if (this.video.style.zIndex)
				this.canvas.style.zIndex = 1 + parseInt(this.video.style.zIndex);
			this.video.parent.appendChild(this.canvas);
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
			break;
		case "none":
		default:
			break;
	}

	// Handle asking for Fullscreen
	if (this.options.startFullscreen === true) {
		this.canvas.requestFullscreen();
		this.canvas.mozRequestFullScreen();
		this.canvas.webkitRequestFullscreen();
		this.canvas.msRequestFullscreen();
	}

	// Add OculusRiftEffect
	this.effect = new THREE.OculusRiftEffect(this.renderer);
	this.effect.setSize(this.canvas.width, this.canvas.height);
	
	// Internal state
	this.mode3D = VRTheater.MODE_3D.NONE;

	// Set up a rectangular plane object as a screen
	this.geometry = new THREE.PlaneGeometry(15, 15*(this.video.videoHeight/this.video.videoWidth));
	this.texture = new THREE.Texture(this.video);
	var material = new THREE.MeshBasicMaterial({
		map: this.texture,
		overdraw: true,
		side:THREE.DoubleSide
	});
	this.sceen = new THREE.Mesh(this.geometry, material);
	this.sceen.position.z = -10;
	this.video.addEventListener("resize", function(){ alert("Not resizing screen due to developer laziness"); }, false);
	this.scene.add(this.sceen);

	// Set up skybox thing
	var cubegeometry = new THREE.CubeGeometry(100, 100, 200);
	var cubematerial = new THREE.MeshBasicMaterial( { color: 0x111111, side: THREE.BackSide } );
	var cube = new THREE.Mesh( cubegeometry, cubematerial );
	this.scene.add(cube);
};

VRTheater.Player.prototype = {

	constructor: VRTheater.Player,
	
	// Show a temporary text message on the screen
	toast: function(text) {
		// TODO: Draw a texture, show a sprite
	},

	destroy: function() {
		this.canvas.parentNode.removeChild(this.canvas);
	}

};
