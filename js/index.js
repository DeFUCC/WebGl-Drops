const drops = {
  init: {
    minSpeed: 0.001,
    maxSpeed: 0.9,
    minOffset: -1000,
    maxOffset: 1000,
    minRadius: 5,
    maxRadius: 150,
    minMultiplierArcX: -5,
    maxMultiplierArcX: 5,
    minMultiplierArcY: -5,
    maxMultiplierArcY: 5,
    scale: 1.5
  },
  radius: 20,
  radiusControl:1,
  back:document.getElementById('back').style,
  overlay:document.getElementById('overlay'),
  time:1,
  cursorLayer:0
};


drops.keyFuncs = {
  ' '() { createdMetaballs.forEach(function(metaball) { metaball.pause(); });
  },
  '1'() { drops.back.backgroundColor="#fff"; },
  '0'() { drops.back.backgroundColor="#000"; },
  'q'() { drops.time > -2 ? drops.time-=0.1 : false },
  'w'() { drops.time < 2 ? drops.time+=0.1 : false },
  'a'() {drops.time=1; },
  's'() { drops.time=-1;},
  'z'() { drops.radiusControl  > 0 ? drops.radiusControl-=0.001 : false },
  'x'() { drops.radiusControl  < 2 ? drops.radiusControl+=0.001 : false },
  'd'() {
    drops.overlay.style.opacity == 0.5 ? drops.overlay.style.opacity=0 : drops.overlay.style.opacity=0.5
  },
  'p'() {exportCanvas(); },
  'e'() { drops.cursorLayer > 0 ? drops.cursorLayer-- : undefined; },
  'r'() { drops.cursorLayer < drops.layers.length ? drops.cursorLayer++ : undefined; }
}

function onClick(event) {
  drops.keyFuncs[' ']();
}

function onWheel(event) {
  let {deltaX,deltaY}=event;
  console.log(event)
  if (drops.radiusControl>0 && deltaY<0) {
    drops.radiusControl-=0.005;
  }
  if (drops.radiusControl<2.5 && deltaY>0) {drops.radiusControl+=0.005;event.preventDefault()}
  if (drops.radius>0 && deltaX<0) {drops.radius-=0.5;event.preventDefault()}
  if (drops.radius<=100 && deltaX>0) {drops.radius+=0.5;event.preventDefault()}
}

function onKey(event) {
  if (drops.keyFuncs[event.key]) {
    event.preventDefault()
    drops.keyFuncs[event.key]()
  }
}

drops.layers =[
  {
    radius:1.8,
    angle:false,
    gradient:[{
      color: '#9a64bd',
      stop: 0.2
    }, {
      color: '#7c1ca0',
      stop: .5
    }, {
      color: '#5e20ad',
      stop: .9
    }]
  },
  {
    radius:1.5,
    angle:true,
    gradient:[{
      color: '#1cdfff',
      stop: 0.0
    }, {
      color: '#4f9cff',
      stop: 0.3
    }, {
      color: '#5855ff',
      stop: .4
    }, {
      color: '#1e9dff',
      stop: .7
    }]
  },
  {
    radius:1.2,
    angle:true,
    gradient:[{
      color: '#a2c25d',
      stop: 0.1
    }, {
      color: '#b1f324',
      stop: .20
    }, {
      color: '#a2c25d',
      stop: .4
    }]
  },
  {
    radius:1,
    angle:false,
    gradient:[{
      color: '#3cbda7',
      stop: 0.25
    }, {
      color: '#28917a',
      stop: .60
    }, {
      color: '#00af9e',
      stop: 0.78
    }]
  },
  {
    radius:0.9,
    angle:true,
    gradient:[{
      color: '#e24926',
      stop: 0.0
    }, {
      color: '#e24926',
      stop: 0.7
    }, {
      color: '#c8246c',
      stop: .8
    }, {
      color: '#bb2a2a',
      stop: 1.0
    }]
  },
  {
    radius:0.7,
    angle:true,
    gradient:[{
      color: '#ff4920',
      stop: 0.2
    }, {
      color: '#ffc700',
      stop: .35
    }, {
      color: '#ede058',
      stop: .55
    }, {
      color: '#ffd40d',
      stop: .75
    }, {
      color: '#ff9100',
      stop: 1.0
    }]
  },
  {
    radius:0.4,
    angle:false,
    gradient:[{
      color: '#be7ec6',
      stop: 0.2
    }, {
      color: '#e646c1',
      stop: .4
    }, {
      color: '#cd7efc',
      stop: .7
    }]
  },
]

var canvas;
var gl;
var realToCSSPixels = window.devicePixelRatio;
var displayWidth;
var displayHeight;
var rings;
var createdMetaballs = [];
var assetsIndexToLoad = 0;
var assetsToLoad = [{
  path: '',
  src: 'noise1.png',
  name: 'noise3',
  type: 'texture'
}];
var assets = {};

window.onload = initialize;

function initialize() {

  canvas = document.getElementById('metaball-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var glConfig = {
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    antialias: true,
    depth: true,
    alpha: true
  }

  gl = canvas.getContext('webgl', glConfig) || canvas.getContext('experimental-webgl', glConfig);

  if (!gl) {
    console.error('cannot find gl', gl);
    return;
  }
  displayWidth = gl.canvas.clientWidth;
  displayHeight = gl.canvas.clientHeight;

  let {
    minSpeed,
    maxSpeed,
    minOffset,
    maxOffset,
    minRadius,
    maxRadius,
    minMultiplierArcX,
    maxMultiplierArcX,
    minMultiplierArcY,
    maxMultiplierArcY,
    scale
  } = drops.init;

  function generateMetaball(radius = 1) {
    return {
      centerOffsetX: getRandomFloat(minOffset, maxOffset) * scale,
      centerOffsetY: getRandomFloat(minOffset, maxOffset) * scale,
      radius: getRandomFloat(minRadius, maxRadius) * scale * radius,
      speed: getRandomFloat(minSpeed, maxSpeed),
      t: Math.random() * 200,
      arcMultiplierX: getRandomFloat(minMultiplierArcX, maxMultiplierArcX),
      arcMultiplierY: getRandomFloat(minMultiplierArcY, maxMultiplierArcY)
    }
  }

  function generateMetaballs(num,radius) {
    let group = [];
    for (let i = 0; i < num; i++) {
      group.push(generateMetaball(radius))
    }
    return group
  }

  var metaballGroup = [];

  drops.layers.forEach(
    layer => {
      metaballGroup.push({
        metaballs: generateMetaballs(12,layer.radius),
        texture: generateGradientTexture(layer.gradient, layer.angle, false)
      })
    }
  )

  metaballGroup.forEach(
    (group, i) => {

      let ballGroup = new Metaballs(gl, group, undefined, i)
      createdMetaballs.push(ballGroup)
      setTimeout(ballGroup.fadeIn, i * 3000);
    }
  );

  window.addEventListener('resize', onWindowResize);
  drops.overlay.addEventListener('mousemove', onWindowMouseMove);
  drops.overlay.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);
  window.addEventListener('wheel',onWheel)

  resizeGL(gl);

  step();
}

function generateGradientTexture(colors, vertical, debug) {

  colors = colors || [{
    color: '#000000',
    stop: 0.0
  }, {
    color: '#FFF000',
    stop: .5
  }, {
    color: '#642054',
    stop: 1.0
  }];
  vertical = vertical !== undefined ? vertical : false;

  var size = 512;

  // create canvas
  var textureCanvas = document.createElement('canvas');
  textureCanvas.width = size;
  textureCanvas.height = size;

  if (debug == true) {
    textureCanvas.style.position = 'absolute';
    textureCanvas.style.top = '0px';
    textureCanvas.style.left = '0px';
    document.body.appendChild(textureCanvas);
  }

  // get context
  var context = textureCanvas.getContext('2d');

  // draw gradient
  context.rect(0, 0, size, size);

  var grd = vertical ? context.createLinearGradient(size, size, 0, 0) : context.createLinearGradient(0, 0, size, size);
  for (var i = 0; i < colors.length; i++) {
    grd.addColorStop(colors[i].stop, colors[i].color);
  }
  context.fillStyle = grd;
  context.fillRect(0, 0, size, size);

  return textureCanvas;
}

function randn_bm() {
  var u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
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

function onWindowResize(event) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;


  resizeGL(gl);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function exportCanvas(){
        var mycanvas = document.getElementById("metaball-canvas");
        if(mycanvas && mycanvas.getContext) {
            var img = mycanvas.toDataURL("image/png;base64;");
            //img = img.replace("image/png","image/octet-stream"); // force download, user would have to give the file name.
            // you can also use anchor tag with download attribute to force download the canvas with file name.
            window.open(img,"","width=700,height=700");
        }
        else {
             alert("Can not export");
        }
    }

function onWindowMouseMove(event) {
  createdMetaballs.forEach(function(metaball) {
    metaball.handleMouseMove(event.clientX, event.clientY);
  });
}

function resizeGL(gl) {
  realToCSSPixels = window.devicePixelRatio;

  // Lookup the size the browser is displaying the canvas in CSS pixels
  // and compute a size needed to make our drawingbuffer match it in
  // device pixels.
  displayWidth = Math.floor(gl.canvas.clientWidth * realToCSSPixels);
  displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

  // Check if the canvas is not the same size.
  if (gl.canvas.width !== displayWidth ||
    gl.canvas.height !== displayHeight) {

    // Make the canvas the same size
    gl.canvas.width = displayWidth;
    gl.canvas.height = displayHeight;
  }

  gl.viewport(0, 0, displayWidth, displayHeight);

  createdMetaballs.forEach(function(metaball) {
    metaball.handleResize(displayWidth, displayHeight);
  });
}

var step = function() {

  createdMetaballs.forEach(function(metaball) {
    metaball.updateSimulation();
  });
  requestAnimationFrame(step);


};
