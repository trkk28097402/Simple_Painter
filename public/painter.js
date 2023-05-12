const mode = {
  DRAW: 0,
  SQUARE: 1,
  CIRCLE: 2,
  TRIANGLE: 3,
  TEXT: 4,
  PICK: 5,
}

let now = mode.DRAW;
let isfill = false;
let erase = false;

const canvas = document.getElementById('my_canvas');
const ctx = canvas.getContext('2d');
const picker = document.getElementById('my_picker');
const pctx = picker.getContext('2d');
const my_window = document.getElementById('content');

canvas.style.cursor = "url('img/draw.png'), auto"
picker.style.cursor = "url('img/pick.png'), auto"

const Arial = new FontFace('Arial', "local('Arial')");
const ArianaVioleta = new FontFace('ArianaVioleta', 'url(font/ArianaVioleta.ttf)');
const Conquest = new FontFace('Conquest', 'url(font/Conquest.ttf)');
const Debrosee = new FontFace('Debrosee', 'url(font/Debrosee.ttf)');
const Freedom = new FontFace('Freedom', 'url(font/Freedom.ttf)');
const WinterSong = new FontFace('WinterSong', 'url(font/WinterSong.ttf)');
document.fonts.add(Arial);
document.fonts.add(ArianaVioleta);
document.fonts.add(Conquest);
document.fonts.add(Debrosee);
document.fonts.add(Freedom);
document.fonts.add(WinterSong);

//load font
ctx.font = '20px Arial';
ctx.fillStyle = "transparent";
ctx.fillText("Arial", 0, 0);
ctx.font = '20px ArianaVioleta';
ctx.fillStyle = "transparent";
ctx.fillText("ArianaVioleta", 0, 0);
ctx.font = '20px Conquest';
ctx.fillStyle = "transparent";
ctx.fillText("Conquest", 0, 0);
ctx.font = '20px Freedom';
ctx.fillStyle = "transparent";
ctx.fillText("Freedom", 0, 0);
ctx.font = '20px Debrosee';
ctx.fillStyle = "transparent";
ctx.fillText("Debrosee", 0, 0);
ctx.font = '20px WinterSong';
ctx.fillStyle = "transparent";
ctx.fillText("WinterSong", 0, 0);

function resize() {
  const contentRatio = my_window.offsetHeight / my_window.offsetWidth;
  const windowRatio = window.innerHeight / window.innerWidth;
  let scale;
  if (windowRatio < contentRatio) {
    scale = window.innerHeight / my_window.offsetHeight;
  } else {
    scale = window.innerWidth / my_window.offsetWidth;
  }
  my_window.style.transform = "scale(" + scale + ")";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  img.src = canvas.toDataURL();
}

window.addEventListener("resize", resize);

const tool = document.getElementById('my_tool');
const my_r = document.getElementById('my_r');
const my_g = document.getElementById('my_g');
const my_b = document.getElementById('my_b');
let r = 0, g = 0, b = 0;
var my_color = "rgb(0,0,0)";

function updatergb(){
  my_color = `rgb(${my_r.value}, ${my_g.value}, ${my_b.value})`; 
  r = my_r.value;
  g = my_g.value;
  b = my_b.value;

  my_color = "rgb(" + r + "," + g + "," + b + ")";
}
my_r.addEventListener('input', updatergb);
my_g.addEventListener('input', updatergb);
my_b.addEventListener('input', updatergb);

const line = document.getElementById('line_width');
const selectElement = document.querySelector('#fontSelect');

const is_touch_event = 'ontouchstart' in canvas ? true : false;
const is_down_event = is_touch_event ? 'ontouchstart' : 'mousedown';
const is_move_event = is_touch_event ? 'ontouchmove' : 'mousemove';
const is_up_event = is_touch_event ? 'touchend' : 'mouseup';
let is_mouse_active = false;

let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
let line_width = 5;

var my_font = 'Arial';

var img = new Image();
var undo_stack = [], redo_stack = [];

let s_x = 0, s_y = 0; //center spot
let radius = 0; //circle

let d = 0; //triangle vertex to spot
let side = 0;

canvas.addEventListener(is_down_event,function(e){
  is_mouse_active = true;
})

canvas.addEventListener(is_down_event,function(e){
  is_mouse_active = true;

  s_x = x1 = e.offsetX;
  s_y = y1 = e.offsetY;
  ctx.strokeStyle = ctx.fillStyle = my_color;
  if(isfill == false) ctx.fillStyle = "transparent";

  undo_stack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  redo_stack = [];

})

canvas.addEventListener(is_move_event,function(e){
  if(!is_mouse_active) {return ;} 
  
  x2 = e.offsetX;
  y2 = e.offsetY;

  my_color = "rgb(" + r + "," + g + "," + b + ")";

  ctx.lineWidth = line_width; //todo stroke width
  ctx.lineCap = 'round'; //todo storke type
  ctx.lineJoin = 'round'; //option

  if(erase) ctx.globalCompositeOperation = "destination-out";
  else ctx.globalCompositeOperation = "source-over";

  if(now == mode.DRAW){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  else if(now == mode.SQUARE){
		if(!erase){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    }
    ctx.beginPath();
    ctx.rect(s_x, s_y, x2 - s_x, y2 - s_y);
    ctx.stroke();
    ctx.fill();
  }
  else if(now == mode.CIRCLE){
    if(!erase){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    }
    ctx.beginPath();
    radius = Math.sqrt(Math.pow(x2 - s_x, 2) + Math.pow(y2 - s_y, 2));
    
    ctx.arc(s_x , s_y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  }
  else if(now == mode.TRIANGLE){
    if(!erase){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    }
    d = Math.sqrt((x2 - s_x) * (x2 - s_x) + (y2 - s_y) * (y2 - s_y));
    side = 2 * d * Math.sin(Math.PI / 3)
    ctx.beginPath();
		ctx.moveTo(s_x, s_y - side / 2);
		ctx.lineTo(s_x - side / 2, s_y + side / 2);
		ctx.lineTo(s_x + side / 2, s_y + side / 2);
    ctx.lineTo(s_x, s_y - side / 2);
    ctx.stroke();
    ctx.fill();
  }  

  x1 = x2;
  y1 = y2;

})

canvas.addEventListener(is_up_event,function(e){
  is_mouse_active = false;
  x1 = 0, x2 = 0, y1 = 0, y2 = 0, s_x = 0, s_y = 0;

  img.src = canvas.toDataURL();
})

function picking(which){
  var pixelData;
  var pixelPos;
  if(which == 0){
    pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pixelPos = (y1 * canvas.width + x1) * 4;
  }else{
    pixelData = pctx.getImageData(0, 0, picker.width, picker.height);
    pixelPos = (y1 * picker.width + x1) * 4;
  }
  
  my_r.value = r = pixelData.data[pixelPos];
  my_g.value = g = pixelData.data[pixelPos + 1];
  my_b.value = b = pixelData.data[pixelPos + 2];
  console.log(pixelData.data[pixelPos])
  my_color = "rgb(" + r + "," + g + "," + b + ")";
}

var my_text;
var already_texting = false;
var my_text = document.getElementById('inputtext');

canvas.addEventListener('click', function(e) {
  x1 = e.offsetX;
  y1 = e.offsetY;
  if(now == mode.TEXT){
    my_text.style.display = 'block';
    my_text.style.position = "absolute";
    my_text.style.left = x1 + 'px';
    my_text.style.top = y1 + 'px';
    my_text.style.zIndex = '2';

    my_text.focus();

    my_text.addEventListener('keydown', function my_textFunc(e2){
      if (e2.key == "Enter"){
        my_text.style.display = 'none';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        
        ctx.font = line_width + 'px ' + my_font;
        ctx.fillStyle = my_color;
        var text = my_text.value;
        ctx.fillText(text, x1, y1);

        img.src = canvas.toDataURL();
        my_text.value = "";
        my_text.removeEventListener('keydown', my_textFunc);
      }
      else if (e2.key == "Escape"){
        my_text.value = "";
        my_text.style.display = 'none';
        my_text.removeEventListener('keydown', my_textFunc);
      }
    })
  }
  else if(now == mode.PICK){
    picking(0);
  }
});

tool.addEventListener('click',function(e){
  if(e.target.id == 'draw'){
    erase = false;
    now = mode.DRAW;
    canvas.style.cursor = "url('img/draw.png'), auto"
  }
  else if(e.target.id == 'erase'){
    erase = true;
    my_color = "transparent"
    canvas.style.cursor = "url('img/erase.png'), auto"
  }
  else if(e.target.id == 'stroke'){
    isfill = false;
    ctx.fillStyle = "transparent";
  }
  else if(e.target.id == 'fill'){
    isfill = true;
    ctx.fillStyle = my_color;
  } 
  else if(e.target.id == 'pick'){
    now = mode.PICK;
    canvas.style.cursor = "url('img/pick.png'), auto"
  } 
  else if(e.target.id == 'clear'){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    img.src = canvas.toDataURL();
  }
  else if(e.target.id == 'square'){
    now = mode.SQUARE;
    canvas.style.cursor = "url('img/square.png'), auto"
  }
  else if(e.target.id == 'circle'){
    now = mode.CIRCLE;
    canvas.style.cursor = "url('img/circle.png'), auto"
  }
  else if(e.target.id == 'triangle'){
    now = mode.TRIANGLE;
    canvas.style.cursor = "url('img/triangle.png'), auto"
  }
  else if(e.target.id == 'text'){
    now = mode.TEXT;
    canvas.style.cursor = "url('img/text.png'), auto"
  }
})

line.addEventListener('change',function(e){
  if(e.target.id == 'line_width'){
    line_width = e.target.value;
  }
})

selectElement.addEventListener('change',function(e){
  if(e.target.id == 'fontSelect'){
    my_font = e.target.value;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);    
  }
})
  

//keyevent
document.addEventListener('keydown', function(e){
  if(e.ctrlKey && e.key === 'z') undo();
  else if(e.ctrlKey && e.key === 'y') redo();
  else if(e.key === 'c'){
    undo_stack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.clearRect(0,0,canvas.width,canvas.height);
    img.src = canvas.toDataURL();
  }
})

function undo(){
  if(undo_stack.length > 0){
    redo_stack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(undo_stack.pop(), 0, 0);
    img.src = canvas.toDataURL();

    x1 = 0, x2 = 0, y1 = 0, y2 = 0, s_x = 0, s_y = 0;
  }
}

function redo(){
  if(redo_stack.length > 0){
    undo_stack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(redo_stack.pop(), 0, 0);
    img.src = canvas.toDataURL();

    x1 = 0, x2 = 0, y1 = 0, y2 = 0, s_x = 0, s_y = 0;
  }
}

const upload = document.getElementById('upload');
const download = document.getElementById('download');
const imageInput = document.getElementById('imageinput');

upload.addEventListener('click', function() {
  imageInput.click();
});

download.addEventListener('click', function() {
  const link = document.createElement('a');
  link.download = 'download.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

imageInput.addEventListener('change', function(e) {
  const file = imageInput.files[0];
  const reader = new FileReader();

  reader.addEventListener('load', function() {
    const image = new Image();
    image.src = reader.result;

    image.addEventListener('load', function() {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    });
  });

  reader.readAsDataURL(file);
});

//picker
pctx.clearRect(0, 0, picker.width, picker.height);
let gradient = pctx.createLinearGradient(0, 0, picker.width, 0);

gradient.addColorStop(0, "rgb(255, 0, 0)");
gradient.addColorStop(0.16, "rgb(255, 0, 255)");
gradient.addColorStop(0.33, "rgb(0, 0, 255)");  
gradient.addColorStop(0.50, "rgb(0, 255, 255)");
gradient.addColorStop(0.67, "rgb(0, 255, 0)");
gradient.addColorStop(0.84, "rgb(255, 255, 0)");
gradient.addColorStop(1, "rgb(255, 0, 0)");

pctx.fillStyle = gradient;
pctx.fillRect(0, 0, picker.width, picker.height);

gradient = pctx.createLinearGradient(0, 0, 0, picker.height);
gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
gradient.addColorStop(1, "rgba(0, 0, 0, 1)");

pctx.fillStyle = gradient;
pctx.fillRect(0, 0, picker.width, picker.height);

picker.addEventListener('click', function(e){
  x1 = e.offsetX;
  y1 = e.offsetY;
  picking(1);
})

/*
//fill
function fill(x, y, targetColor, fillColor) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const queue = [[x, y]];
  const visited = new Set();

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const pixelPos = (y * canvas.width + x) * 4;

    if (visited.has(pixelPos)) {
      continue;
    }

    visited.add(pixelPos);

    if (matchPixel(imageData, pixelPos, targetColor)) {
      imageData.data[pixelPos] = fillColor[0];
      imageData.data[pixelPos + 1] = fillColor[1];
      imageData.data[pixelPos + 2] = fillColor[2];
      imageData.data[pixelPos + 3] = 255; 

      if (x > 0) {
        queue.push([x - 1, y]);
      }
      if (x < canvas.width ) {
        queue.push([x + 1, y]);
      }
      if (y > 0) {
        queue.push([x, y - 1]);
      }
      if (y < canvas.height ) {
        queue.push([x, y + 1]);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  img.src = canvas.toDataURL();
}

function matchPixel(imageData, pixelPos, targetColor) {
  const r = imageData.data[pixelPos];
  const g = imageData.data[pixelPos + 1];
  const b = imageData.data[pixelPos + 2];
  return r == targetColor[0] && g == targetColor[1] && b == targetColor[2];
}

function getPixel(imageData, x, y) {
  const pixelPos = (y * imageData.width + x) * 4;
  const r = imageData.data[pixelPos];
  const g = imageData.data[pixelPos + 1];
  const b = imageData.data[pixelPos + 2];
  //const a = imageData.data[pixelPos + 3];
  //return [r, g, b, a];

  return [r, g, b];
}

canvas.addEventListener('click', function(event) {
  if(isfill == false) {return;}
  const x = event.offsetX;
  const y = event.offsetY;
  const targetColor = getPixel(ctx.getImageData(0, 0, canvas.width, canvas.height), x, y);
  const fillColor = [r, g, b]; 
  fill(x, y, targetColor, fillColor);
});
*/