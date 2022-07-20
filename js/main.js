//设置全局对象
var drawObj = {
	shape: 'arbitrary', //形状
	color: 'black', //颜色
	lineWidth: 1, //线的宽度
	strokeFill: 'stroke', //是填充还是描边
};
var historyShape = []; //历史记录
const canvas = document.querySelector('#canvas');
const save = document.querySelector('#save');
const undo = document.querySelector('.undo');
const eraser = document.querySelector('.eraser');
const clear = document.querySelector('.clear');
const recover = document.querySelector('.recover');
const rect = document.querySelector('.rect');
const triangle = document.querySelector('.triangle');
const circle = document.querySelector('.circle');
const line = document.querySelector('.line');
const arbitrary = document.querySelector('.arbitrary');
var ctx = canvas.getContext('2d');
var size = document.querySelector('#range');
const colorBtn = document.querySelectorAll('.color-item');
const fill = document.querySelector('.fill');
const stroke = document.querySelector('.stroke');
var flag = false;
var img1 = document.getElementById('img1');
var img2 = document.getElementById('img2');
var download1 = document.getElementById('downloadImage1');
var download2 = document.getElementById('downloadImage2');
var delete1 = document.getElementById('deleteImage1');
var delete2 = document.getElementById('deleteImgae2');
var download = [];
var deleteImgae = [];
var img = [];
var x = 0;
var y = 0;
var s = 0; //控制localStorage的变量
var url = ''; //用来存储canvas图片的二进制格式转为dataURL格式
var canvasHistory = []; // 存储所有的imageData,方便进行复现和撤销等功能
var step = -1;
download.push(download1);
download.push(download2);
deleteImgae.push(delete1);
deleteImgae.push(delete2);
img.push(img1);
img.push(img2);
// 给下载按钮添加上事件绑定
for (let i = 0; i < download.length; i++) {
	download[i].onclick = function() {
		let imgUrl = canvas.toDataURL('image/png');
		let saveA = document.createElement('a');
		document.body.appendChild(saveA);
		saveA.href = imgUrl;
		saveA.download = 'mypic' + (new Date).getTime();
		saveA.target = '_blank';
		saveA.click();
	}
}
// 给删除按钮添加上事件绑定
for (let i = 0; i < deleteImgae.length; i++) {
	deleteImgae[i].onclick = function() {
		img[i].src = "";
		if (window.localStorage) {
			key = 'history' + i;
			window.localStorage.removeItem(key);
			if (i == 0) {
				historyShape.shift();
			} else {
				historyShape.pop();
			}
			s--;
		}
	}
}
// 给颜色绑定上点击事件
for (let i = 0; i < colorBtn.length; i++) {
	colorBtn[i].addEventListener('click', function() {
		drawObj.color = colorBtn[i].getAttribute('value');
		draw();
	});
}
init();
window.addEventListener('resize', init)
// 设置画布的尺寸
function init() {
	canvas.width = document.getElementById('container').offsetWidth; //设置为整个盒子的宽度
	canvas.height = document.body.clientHeight - document.getElementById('container')
		.offsetHeight-2;
}
// 给对象设置参数
arbitrary.onclick = function() {
	drawObj.shape = 'arbitrary';
	draw();
}
line.onclick = function() {
	drawObj.shape = 'line';
	draw();
}
circle.onclick = function() {
	drawObj.shape = 'circle';
	draw();
}
triangle.onclick = function() {
	drawObj.shape = 'triangle';
	draw();
}
rect.onclick = function() {
	drawObj.shape = 'rect';
	draw();
}
//绑定恢复事件
undo.onclick = function() {
	canvasUndo();
};
//给按钮绑定点击事件
recover.onclick = function() {
	redo();
}
draw();
// 保存函数
save.onclick = function() {
	if (historyShape.length > 1) {
		alert("预览空间已满，请删除之后再进行操作");
		return;
	}
	url = canvas.toDataURL("image/png");
	if (window.localStorage) {
		localStorage.setItem('history' + `${s}`, JSON.stringify(url));
		s++;
	}
	historyShape.push(url)
	for (let i = 0; i < historyShape.length; i++) {
		img[i].src = historyShape[i];
	}
}
size.onchange = function() {
	drawObj.lineWidth = size.value;
	draw();
}
// 实现清屏
clear.onclick = function() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	canvasHistory = [];
	undo.classList.remove('active');
	recover.classList.remove('active');
	step = -1;
}
eraser.onclick = function() {
	drawObj.shape = 'eraser';
	draw();
}
// 填充
fill.onclick = function() {
	drawObj.strokeFill = 'fill';
}
stroke.onclick = function() {
	drawObj.strokeFill = 'stroke';
}
showHistory();
// 展示历史记录
function showHistory() {
	if (window.localStorage) {
		for (var i = 0; i < localStorage.length; i++) {
			historyShape.push(localStorage.getItem(localStorage.key(i)));
		}
	}
	s = localStorage.length;
	for (var i = 0; i < historyShape.length; i++) {
		img[i].src = JSON.parse(historyShape[i]);
	}
}
// 恢复函数
function redo() {
	if (step < canvasHistory.length - 1) {
		step++;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (let i = 0; i <= step; i++) {
			var data = canvasHistory[i];
			ctx.putImageData(data, 0, 0);
		}
	} else {
		recover.classList.remove('active')
		alert('已经是最新的记录了');
	}
}
// 撤销函数
function canvasUndo() {
	if (step > 0) {
		step--;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (let i = 0; i <= step; i++) {
			var data = canvasHistory[i];
			ctx.putImageData(data, 0, 0);
		}
		undo.classList.add('active');
		recover.classList.add('active'); //add函数，如果这个要添加的元素在列表中，则取消本次添加
	} else {
		undo.classList.remove('active');
		alert('不能再继续撤销了');
	}
}
//绘制函数
function draw() {
	ctx.lineWidth = drawObj.lineWidth; //将对象的线宽赋值给canvas
	ctx[drawObj.strokeFill + "Style"] = drawObj.color;
	canvas.onmousedown = function(e) {
		flag = true;
		x = e.offsetX; // 鼠标落下时的X
		y = e.offsetY; // 鼠标落下时的Y
		ctx.beginPath();
	}
	//鼠标移入进行绘图
	canvas.onmousemove = function(e) {
		if (!flag) return;
		if ('arbitrary' === drawObj.shape) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			Pencil(e);
		} else if ('triangle' === drawObj.shape) {
			console.log(canvas.width, canvas.height)
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			Triangle(e);
		} else if ('rect' === drawObj.shape) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			Rect(e);
		} else if ('line' === drawObj.shape) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			var line = new Line(e);
			line.draw();
		} else if ('circle' === drawObj.shape) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			Circle(e);
		} else if ('eraser' === drawObj.shape) {
			earserImplenmention(e);
		}
	};
	//鼠标松开事件
	canvas.onmouseup = function(e) {
		flag = false;
		step++;
		if (step < canvasHistory.length) {
			canvasHistory.length = step;
		}
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		canvasHistory.push(imageData);
		loadImage();
		ctx.closePath();
		if (step >= 0) {
			undo.classList.add('active');
		}
	};
}
// 实现橡皮擦
function earserImplenmention(e) {
	ctx.save();
	ctx.globalCompositeOperation = "destination-out";
	ctx.beginPath();
	radius = drawObj.lineWidth * 2;
	ctx.arc(e.offsetX, e.offsetY, radius, 0, 2 * Math.PI);
	ctx.clip();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.restore();
}
//	直线类
function Line(e) {
	this.x = x;
	this.y = y;
	this.draw = function() {
		ctx.beginPath();
		loadImage();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(e.offsetX, e.offsetY);
		ctx[drawObj.strokeFill]();
	}
}
// 实现三角形的绘制
function Triangle(e) {
	loadImage();
	ctx.beginPath();
	var xLeft = 2 * x - e.clientX;
	var top = Math.sqrt(3) * (e.clientX - x);
	var yTop = e.clientY - top;
	ctx.moveTo(e.clientX, e.clientY);
	ctx.lineTo(xLeft, e.clientY);
	ctx.lineTo(x, yTop);
	ctx.closePath();
	ctx[drawObj.strokeFill]();
}
//圆的绘制函数，实现绘制圆
function Circle(e) {
	if (flag) {
		loadImage();
		ctx.beginPath();
		var rx = (e.offsetX - x) / 2;
		var ry = (e.offsetY - y) / 2;
		var r = Math.sqrt(rx * rx + ry * ry);
		ctx.arc(rx + x, ry + y, r, 0, Math.PI * 2);
		ctx[drawObj.strokeFill]();
	}
}
//矩形绘制函数，实现绘制矩形
function Rect(e) {
	if (flag) {
		loadImage();
		ctx.beginPath();
		if (drawObj.strokeFill === "fill") {
			ctx.fillRect(x, y, e.offsetX - x, e.offsetY - y);
		} else {
			ctx.strokeRect(x, y, e.offsetX - x, e.offsetY - y);
		}
	}
}
//画笔绘制函数，实现随意画图
function Pencil(e) {
	if (flag) {
		loadImage();
		ctx.lineTo(e.offsetX, e.offsetY);
		ctx.stroke(); // 调用绘制方法 
	}
}
//保存每次的画布
function loadImage() {
	for (let i = 0; i <= step; i++) {
		var data = canvasHistory[i];
		ctx.putImageData(data, 0, 0);
	}
}

// 视图的切换函数
function switchView(btn) {
	if (btn.className != 'active') {
		const drawView = document.querySelector('.leftContent');
		const historyView = document.querySelector('.history');
		const drawBtn = document.querySelector('#draw')
		const historyBtn = document.querySelector('#history')
		if (btn == drawBtn) {
			// 按钮为激活状态
			historyBtn.className = '';
			drawBtn.className = 'active';
			// 视图切换
			drawView.style.display = 'block';
			historyView.style.display = 'none';
		} else {
			// 按钮为激活状态
			historyBtn.className = 'active';
			drawBtn.className = '';
			// 视图切换
			drawView.style.display = 'none';
			historyView.style.display = 'block';
			historyView.style.height = '48.75rem';
		}
	}
}
