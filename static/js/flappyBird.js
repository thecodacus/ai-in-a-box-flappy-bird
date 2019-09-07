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
var manual=false
var error=false
document.addEventListener("keydown",manualAction);
socket.on('aiMessage', autoAction);
socket.on('Log', (data)=>{
  if(!error){
    let log = document.createElement('P')
    log.innerHTML="$ "+data.log;
    terminal.appendChild(log)
    if(data.status=='error'){
      error=true
    }
    manual=true;
  }
});

function manualAction(){
  if(manual)moveUp()
}
function autoAction(data){
  console.log(data)
  if(!manual && data.action==1)moveUp()
}
function moveUp(){
  forceY=deltaForceY
  action=1;
  fly.play();
}

var pipe = [];

pipe[0] = {
  x : cvs.width,
  y : 0
};



function attachAI(){
  manual=!toggleAgent.checked
}
function writeInfo(){
  panelScore.innerText=score;
  panelVelocity.innerText=Math.round(velY * 100) / 100;
  panelAcc.innerText=(gravity+forceY);
  panelReward.innerText=reward;
  panelAction.innerText=action;
}
function reset(){
  attachAI()
  pipe = [];

  pipe[0] = {
    x : cvs.width,
    y : 0
  };
  velY=0
  bY = bYStart;
  score = 0;
  forceY=0;
  action=0;
}
function draw(){
  constant=pipeNorth.height+gap;
  ctx.drawImage(bg,0,0);
  let gameover=false
  let minDist=cvs.width;
  let nearestPole=-1
  for(let i =0; i<pipe.length;i++){
    point=pipe[i]

    let dstFromBird=(point.x+pipeNorth.width)-bX
    if(dstFromBird>0 && dstFromBird<minDist){
      minDist=dstFromBird;
      nearestPole=i;
    }
    ctx.drawImage(pipeNorth,point.x,point.y);
    ctx.drawImage(pipeSouth,point.x,point.y+constant);
    pipe[i].x--;
    if(pipe[i].x==cvs.width-188){
        pipe.push({
            x : cvs.width,
            y : Math.floor(Math.random()*pipeNorth.height)-pipeNorth.height
        });
    }
    
    if(bX+bird.width>=point.x 
      && bX<=point.x 
      && (bY<=point.y+pipeNorth.height
        ||bY+bird.height>=point.y+pipeNorth.height+gap)
      ||bY+bird.height>=cvs.height-fg.height
      || bY<=0){
      gameover=true;
      break;    
    }
    if(point.x==10){
      score+=1;
      reward=10;
      scor.play()
    }
  }
  for(let i =0; i<pipe.length;i++){
    if(pipe[i].x<=-188){
      pipe.splice(i, 1)
    }
  }
  let cover=0
  while(cover<=cvs.width && cover<1000 && fg.width>0){
    ctx.drawImage(fg,cover,cvs.height-fg.height);
    cover+=fg.width;
  }
  ctx.drawImage(bird,bX,bY);
  velY=velY+(gravity+forceY)*0.01
  bY-= velY


  writeInfo()
  if(nearestPole>=0){
    socket.emit('aiMessage', {
      bX:bX,
      bY:bY,
      pX:pipe[nearestPole].x,
      pnY:pipe[nearestPole].y+pipeNorth.height,
      psY:pipe[nearestPole].y+pipeNorth.height+gap,
      velY:velY,
      reward:reward,
      action:action
    });
  }
  forceY=0
  action=0
  reward=0
  requestAnimationFrame(draw);
  if(gameover){reset()}
}
reset()
draw();