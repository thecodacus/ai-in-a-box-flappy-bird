import math
import random
from external.agent import AIAgent as ExtrAIAgent
class Game():
    # gap is the gap in pixels between the south Pipe and North Pipe.
    def __init__(self,cvsHeight=512,cvsWidth=800,pipeHeight=242,pipeWidth=52, fgHeight=118, birdHeight=38,birdWidth=26):
        self.cvsHeight=cvsHeight
        self.cvsWidth=cvsWidth
        self.pipeHeight=pipeHeight
        self.pipeWidth=pipeWidth
        self.fgHeight=fgHeight
        self.birdHeight=birdHeight
        self.birdWidth=birdWidth

        self.gap = 85
        self.bXStart=40
        self.bYStart=150

        # the constant is the south Pipe position, and it is calculating by adding the gap to the north Pipe.
        self.constant=self.pipeHeight+self.gap

        # the bird X and Y positions.
        self.bX = self.bXStart
        self.bY = self.bYStart

        self.velY=0

        # the bird falls by 1.5 pixels at a time.
        self.gravity = -9.8
        self.forceY=0
        self.deltaForceY=300

        # we initiate the players score
        self.score = 0

        # reward
        self.reward=0

        #action
        self.action=0
        self.actionToTake=0
        self.prevAction=0
        self.manual=False
        self.error=False
        self.fps=0
        self.stateHistory=[]

        self.pipe = []

        self.pipe.append({'x' : self.cvsWidth,'y' : 0})
        self.gameover=False

        self.mAgent=ManualAgent()
        self.aiAgent=AIAgent()

    def moveUp(self):
        self.forceY=self.deltaForceY

    def reset(self):
        self.pipe = []
        self.pipe.append({'x' : self.cvsWidth,'y' : 0})
        self.velY=0
        self.bY = self.bYStart
        self.score = 0
        self.forceY=0
        self.action=0

    def getNearestPipe(self):
        minDist=self.cvsWidth*20
        nearestPole=-1
        for i  in range(len(self.pipe)):
            point=self.pipe[i]
            dstFromBird=(point['x']+self.pipeWidth)-self.bX
            if dstFromBird>0 and dstFromBird<minDist:
                minDist=dstFromBird
                nearestPole=i
        return nearestPole
    
    def updateGameLogic(self):
        for i in range(len(self.pipe)):
            point=self.pipe[i]
            self.pipe[i]['x']-=1
            if self.pipe[i]['x']==self.cvsWidth-188:
                self.pipe.append({
                    'x' : self.cvsWidth,
                    'y' : math.floor(random.random()*self.pipeHeight)-self.pipeHeight
                })
            if (self.bX+self.birdWidth>=point['x'] and self.bX<=point['x'] 
                and (self.bY<=point['y']+self.pipeHeight or self.bY+self.birdHeight>=point['y']+self.pipeHeight+self.gap)
                or self.bY+self.birdHeight>=self.cvsHeight-self.fgHeight
                or self.bY<=0):
                self.reward=-10
                self.gameover=True
                break
            if(point['x']==10):
                self.score+=1
                self.reward=10
        for i in range(len(self.pipe)):
            if(self.pipe[i]['x']<=-188):
                del self.pipe[i]
                break
    
    def takeAction(self):
        nearestPole=self.getNearestPipe()
        state={
            'bX':self.bX/self.cvsWidth,
            'bY':self.bY/self.cvsHeight,
            'pX1':self.pipe[nearestPole]['x']/self.cvsWidth,
            'pX2':self.pipe[nearestPole]['x']/self.cvsWidth,
            'pY1':(self.pipe[nearestPole]['y']+self.pipeHeight)/self.cvsHeight,
            'pY2':(self.pipe[nearestPole]['y']+self.pipeHeight+self.gap)/self.cvsHeight,
            'velY':self.velY,
            'action':self.action
        }
        if(self.manual):
            self.action=self.mAgent.getAction(state,self.reward)
        else:
            self.action=self.aiAgent.getAction(state,self.reward)
        
        self.velY=self.velY+(self.gravity+self.deltaForceY*self.action)*(0.015)
        self.bY-= self.velY
        self.reward=0
        self.action=0

    def getGameState(self):
        state={
            'bX':self.bX,
            'bY':self.bY,
            'pipe':self.pipe,
            'gap':self.gap,
            'action':self.action,
            'score':self.score,
            'gameover':self.gameover,
            'reward':self.reward
        }
        return state
        
class Agent():
    def __init__(self):
        self.action=0
    def getAction(self,state,reward):
        return self.action
    def setNextAction(self, action):
        self.action=action

class ManualAgent(Agent):
    def __init__(self):
        super().__init__()
    def getAction(self,state,reward):
        action=self.action
        self.action=0
        return action
    
class AIAgent(Agent):
    def __init__(self):
        super().__init__()
        self.externalAgent=ExtrAIAgent()
    
    def getAction(self,state,reward):
        self.action=self.externalAgent.takeAction(state,reward)
        return self.action
    