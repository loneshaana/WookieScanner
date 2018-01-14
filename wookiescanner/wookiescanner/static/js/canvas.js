// Resize the canvas 
function showCanvas()
{
console.log("Canvas is working");
document.body.style.backgroundColor = 'hsl(180, 24%, 12%)';

var canvas = document.querySelector('canvas');
canvas.width =  window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext("2d");
var mouse ={
	x:undefined,
	y:undefined
}
var maxRadius = 60;
var limit = 10;
var colorArray =[
	'#2C3E50',
	'#E7C3C',
	'#ECF0F1',
	'#3498DB',
	'#2980B9',
	'#17202A',
	'#6C3483',
	'#16A085',
];

window.addEventListener('resize',function(){
	canvas.width =  window.innerWidth;
	canvas.height = window.innerHeight;
	init();
});

function Circle(x,y,dx,dy,radius)
{
this.x = x;
this.dx =dx;
this.y = y;
this.dy = dy;
this.radius = radius;
this.color =colorArray[Math.floor(Math.random() * colorArray.length)];
this.minRadius = radius

this.draw = function()
{
	c.beginPath();
	c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
	c.strokeStyle = this.color;
	c.fillStyle= this.color;
	c.fill();
	c.stroke();
}

this.update = function()
{
		if(this.x + this.radius > innerWidth || this.x - this.radius <0)
		{
		this.dx =- this.dx;
		}
	this.x += this.dx;
	this.draw();
	}
}

var circleArray =[];

function init()
{
	circleArray = []
	var i=0;
	for(i=0; i<limit; i++)
	{
		var x = innerWidth /2;
		var dx = (Math.random() - 0.5)*10;
		var radius = Math.random() * 3 +1;
		var y= innerHeight /2;
		var dy =(Math.random() - 0.5)*10;
		circleArray.push(new Circle(x,y,dx,dy,radius));
	}
}

function animate()
{
	requestAnimationFrame(animate);  //loop 
	c.clearRect(0,0,innerWidth,innerHeight);
	for(i=0;i<circleArray.length;i++)
	{
		circleArray[i].update();
	}
}
init();
animate();
}