from aiohttp import web
import socketio
import sys
import asyncio
from module.game import Game

error=False

# creates a new Async Socket IO Server
sio = socketio.AsyncServer()
# Creates a new Aiohttp Web Application
app = web.Application()
# Binds our Socket.IO server to our Web App
# instance
sio.attach(app)
 
app.router.add_static('/static/',path='static',name='static')

# setting game logic
game=Game(cvsHeight=512,cvsWidth=800)
async def gameLoop(game,sio):
    while True:
        game.updateGameLogic()
        gameState=game.getGameState()
        await sio.emit('statesync',gameState)
        game.takeAction()
        if(game.gameover):
            game.reset()
            game.gameover=False
            await sio.emit('gameover',game.gameover)
        await asyncio.sleep(0.015)

@sio.on('manual')
async def manual(sid, message):
    game.mAgent.setNextAction(message['action'])

@sio.on('agentSwitch')
async def agentSwitch(sid, message):
    game.manual=message['manual']

asyncio.ensure_future(gameLoop(game,sio))
# we can define aiohttp endpoints just as we normally
# would with no change
async def index(request):
    with open('index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

# If we wanted to create a new websocket endpoint,
# use this decorator, passing in the name of the
# event we wish to listen out for
# We bind our aiohttp endpoint to our app
# router
app.router.add_get('/', index)

# We kick off our server
if __name__ == '__main__':
    web.run_app(app, host='0.0.0.0')