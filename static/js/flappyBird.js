let cvs = document.getElementById("flappyBird");
let ctx = cvs.getContext("2d");
let panelScore = document.getElementById("score");
let panelAction = document.getElementById("action");
let panelReward = document.getElementById("reward");
let panelVelocity = document.getElementById("velocity");
let panelAcc = document.getElementById("accelaration");
let toggleAgent = document.getElementById("attachAI");
let terminal = document.getElementById("terminal");

 
let bird = new Image();
let bg = new Image();
let fg = new Image();
let pipeNorth = new Image();
let pipeSouth = new Image();

const socket = io('http://localhost:8000');

bird.src = "static/images/bird.png";
bg.src = "static/images/bg.png";
fg.src = "static/images/fg.png";
pipeNorth.src = "static/images/pipeNorth.png";
pipeSouth.src = "static/images/pipeSouth.png";

var fly = new Audio();
var scor = new Audio();

fly.src = "static/sounds/fly.mp3";
scor.src = "static/sounds/score.mp3";


// gap; is the gap in pixels between the south Pipe and North Pipe.
var gap = 85;
var bXStart=40;
var bYStart=150

// the constant is the south Pipe position, and it is calculating by adding the gap to the north Pipe.
var constant=pipeNorth.height+gap;

// the bird X and Y positions.
var bX = bXStart;
var bY = bYStart;

var velY=0

// the bird falls by 1.5 pixels at a time.
var gravity = -9.8;
var forceY=0;
var deltaForceY=350

// we initiate the players score
var score = 0;

// reward
var reward=0;

//action
var action=0
var actionToTake=0
var prevAction=0
var manual=false
var error=false
var t0 = performance.now();
var t1 = performance.now();
var fps=0;
var stateHistory=[];

function getFPS(){
  t0=t1;
  t1=performance.now();
  dt=(t1 - t0)/1000
  fps=Math.round(1/dt * 100) / 100;
  return fps;
}

function logTerminal(data){
  let log = document.createElement('P')
  log.innerHTML="$ "+data;
  terminal.appendChild(log)
}

function stateSync(data){
  bX=data.bX
  bY=data.bY
  pipe=data.pipe
  gap=data.gap
  action=data.action
  score=data.score
  gameover=data.gameover
  if(action==1){moveUp()}
  if(reward!=0){scor.play()}
  draw()
}
function gameover(data){

}
document.addEventListener("keydown",manualAction);
//document.addEventListener("keyup",manualAction);
socket.on('statesync', stateSync);
socket.on('gameover', gameover);


socket.on('Log', (data)=>{
  if(!error){
    logTerminal(data.log)
    if(data.status=='error'){
      error=true
    }
    manual=true;
  }
});



function manualAction(){
  if(manual){
    socket.emit('manual',{action:1})
  }
}


function moveUp(){
  fly.play();
}

var pipe = [];

var gameover=false


function attachAI(){
  manual=!toggleAgent.checked
  socket.emit('agentSwitch',{manual:manual})
}
function writeInfo(){
  panelScore.innerText=score;
  panelVelocity.innerText=Math.round(velY * 100) / 100;
  panelAcc.innerText=(gravity+forceY);
  panelReward.innerText=reward;
  panelAction.innerText=action;
}




function draw(){
  constant=pipeNorth.height+gap;
  ctx.drawImage(bg,0,0);
  for(let i =0; i<pipe.length;i++){
    point=pipe[i]

    ctx.drawImage(pipeNorth,point.x,point.y);
    ctx.drawImage(pipeSouth,point.x,point.y+constant);
  }
  let cover=0
  while(cover<=cvs.width && cover<1000 && fg.width>0){
    ctx.drawImage(fg,cover,cvs.height-fg.height);
    cover+=fg.width;
  }
  ctx.drawImage(bird,bX,bY);
  //ctx.font = "30px Arial";
  //ctx.fillStyle = "red";
  
  //ctx.fillText("FPS: "+fps, 10, cvs.height-50);
  writeInfo()

}
attachAI()

