
var canvas;
var gl;
var realToCSSPixels = window.devicePixelRatio;
var displayWidth;
var displayHeight;
var rings;
var createdMetaballs = [];
var assetsIndexToLoad = 0;
var assetsToLoad = [
    {path: '', src: 'noise1.png', name: 'noise3', type: 'texture'}
];
var assets = {};

window.onload = preloadAssets;

function preloadAssets() {


    function checkIfAllAssetsAreLoaded() {
        if (assetsIndexToLoad < assetsToLoad.length) {
            loadAssetIndex(assetsIndexToLoad);
        }
        else {
            initialize();
        }
    }

    function loadAssetIndex(index) {
        var objectToLoad = assetsToLoad[index];

        switch (objectToLoad.type) {
            case 'texture':
                var image = new Image();
                image.onload = function(event) {
                    assets[objectToLoad.name] = this;
                    assetsIndexToLoad++;
                    checkIfAllAssetsAreLoaded();
                };
            image.crossOrigin = '';
                image.src = objectToLoad.path + objectToLoad.src;
                break;
        }
    }

    loadAssetIndex(assetsIndexToLoad);
}

function initialize(){

    canvas = document.getElementById('metaball-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var glConfig = {
        premultipliedAlpha: true,
        antialias: true,
        depth:true,
        alpha: true
    }

    gl = canvas.getContext('webgl', glConfig) || canvas.getContext('experimental-webgl', glConfig);

    if(!gl){
        console.error('cannot find gl', gl);
        return;
    }
    displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
    displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

    var minSpeed = 0.001;
    var maxSpeed = 0.3;
    var minOffset = -600;
    var maxOffset = 600;
    var minRadius = 1;
    var maxRadius = 150;
    var minMultiplierArcX = -5;
    var maxMultiplierArcX = 5;
    var minMultiplierArcY = -5;
    var maxMultiplierArcY = 5;
    var scale = 1.2;

    function generateMetaball () {
      return {
          centerOffsetX:getRandomFloat(minOffset, maxOffset) * scale, centerOffsetY:getRandomFloat(minOffset, maxOffset) * scale, radius: getRandomFloat(minRadius, maxRadius) * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY)
      }
    }

    function generateMetaballs(num) {
      let group = [];
      for (let i=0;i<num;i++) {
        group.push(generateMetaball())
      }
      return group
    }
    var metaballGroup =[
      {
          metaballs:generateMetaballs(20),
          texture:generateGradientTexture([{color:'#ff4920', stop:0.2}, {color:'#ffc700', stop:.35}, {color:'#ede058', stop:.55}, {color:'#ffd40d', stop:.75}, {color:'#ff9100', stop:1.0}], false, false)
      },
      {
          metaballs:generateMetaballs(8),
          texture:generateGradientTexture([{color:'#1cdfff', stop:0.0}, {color:'#4f9cff', stop:0.3}, {color:'#5855ff', stop:.4}, {color:'#1e9dff', stop:.7}], true, false)
      },
      {
          metaballs:generateMetaballs(7),
          texture:generateGradientTexture([{color:'#9a64bd', stop:0.56}, {color:'#c8246c', stop:.63}, {color:'#40204c', stop:.7}], false, false)
      },
      {
          metaballs:generateMetaballs(5),
          texture:generateGradientTexture([{color:'#a2c25d', stop:0.1}, {color:'#b1f324', stop:.20}, {color:'#a2c25d', stop:.4}], false, false)
      },
      {
          metaballs:generateMetaballs(8),
          texture:generateGradientTexture([{color:'#1fffa1', stop:0.25}, {color:'#23e09a', stop:.60}, {color:'#00af9e', stop:0.78}], true, false)
      },
      {
          metaballs:generateMetaballs(3),
          texture:generateGradientTexture([{color:'#e24926', stop:0.0}, {color:'#e24926', stop:0.7}, {color:'#c8246c', stop:.8}, {color:'#40204c', stop:1.0}], false, false)
      },
      {
          metaballs:generateMetaballs(4),
          texture:generateGradientTexture([{color:'#e24926', stop:0.2}, {color:'#c8246c', stop:.4}, {color:'#40204c', stop:.7}], true, false)
      }
    ];

    metaballGroup.forEach(
      (group,i) => {
        let ballGroup = new Metaballs(gl, group)
        createdMetaballs.push(ballGroup)
        setTimeout(ballGroup.fadeIn, i * 3000);
      }
    );
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onWindowMouseMove);

    resizeGL(gl);

    step();
}

function generateGradientTexture(colors, vertical, debug) {

    colors = colors || [{color:'#000000', stop:0.0}, {color:'#FFF000', stop:.5}, {color:'#642054', stop:1.0}];
    vertical = vertical !== undefined ? vertical : false;

    var size = 512;

    // create canvas
    var textureCanvas = document.createElement( 'canvas' );
    textureCanvas.width = size;
    textureCanvas.height = size;

    if(debug == true){
        textureCanvas.style.position = 'absolute';
        textureCanvas.style.top = '0px';
        textureCanvas.style.left = '0px';
        document.body.appendChild(textureCanvas);
    }

    // get context
    var context = textureCanvas.getContext( '2d' );

    // draw gradient
    context.rect( 0, 0, size, size );

    var grd = vertical ? context.createLinearGradient(size, size, 0, 0) : context.createLinearGradient(0, 0, size, size);
    for(var i = 0; i < colors.length; i++){
        grd.addColorStop(colors[i].stop, colors[i].color);
    }
    context.fillStyle = grd;
    context.fillRect(0, 0, size, size);

    return textureCanvas;
}

function randn_bm() {
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
  return num;
}

function getNormalRandomFloat(min, max) {
    return randn_bm() * (max - min) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function onWindowResize(event){
    canvas.width   = canvas.clientWidth;
    canvas.height  = canvas.clientHeight;


    resizeGL(gl);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function onWindowMouseMove(event){
    createdMetaballs.forEach(function(metaball){
        metaball.handleMouseMove(event.clientX, event.clientY);
    });
}

function resizeGL(gl) {
    realToCSSPixels = window.devicePixelRatio;

    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
    displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

    // Check if the canvas is not the same size.
    if (gl.canvas.width  !== displayWidth ||
        gl.canvas.height !== displayHeight) {

        // Make the canvas the same size
        gl.canvas.width  = displayWidth;
        gl.canvas.height = displayHeight;
    }

    gl.viewport(0, 0, displayWidth, displayHeight);

    createdMetaballs.forEach(function(metaball){
        metaball.handleResize(displayWidth, displayHeight);
    });
}

var step = function() {

    createdMetaballs.forEach(function(metaball){
        metaball.updateSimulation();
    });
    requestAnimationFrame(step);
};
