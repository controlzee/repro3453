'use strict';

/*
    Player
*/
function Player() {
    this.id = Math.floor( Math.random()*100000 );
    this.x = 100;
    this.y = Math.floor( Math.random()*500 + 50);
    this.color = getRandomColor();

    // For local players only
    var d = 10;
    this.direction = { x:Math.random()*d-(d/2), y:Math.random()*d-(d/2) };
}

Player.prototype.toJson = function() {
    return {
        id: this.id,
        x: this.x,
        y: this.y,
        color: this.color
    }
}

Player.prototype.fromJson = function(data) {
    this.id = data.id;
    this.x = data.x;
    this.y = data.y;
    this.color = data.color;
}

/*
    Game
*/
function Game(canvas, numLocalPlayers) {
    this.canvas = canvas;
    this.websocketRelayClient = new WebsocketRelayClient();
    this.websocketRelayClient.onTextMessageReceived = this.onTextMessageReceived.bind(this);

    this.numWasteRenderPasses = 1;

    this.localPlayers = {};
    this.remotePlayers = {}

    this.moveLocalPlayers = false;

    this.receivedMessages = [];

    this._setNumLocalPlayers(numLocalPlayers);
}

Game.prototype.onTextMessageReceived = function(message) {
    this.receivedMessages.push(message);
}

Game.prototype.setNumLocalPlayers = function(num) {
    this._setNumLocalPlayers(num);
    this.websocketRelayClient.sendTextMessage("reset");
}

Game.prototype._setNumLocalPlayers = function(num) {
    this.localPlayers = {};
    for ( var i=0; i<num; i++ ) {
        var localPlayer = new Player();
        this.localPlayers[localPlayer.id] = localPlayer;
    }
}

Game.prototype.update = function() {
    var canvas = this.canvas;

    if ( this.moveLocalPlayers ) {
        for ( var id in this.localPlayers ) {
            var player = this.localPlayers[id];
            player.x += player.direction.x;
            if ( player.x<0 || player.x>canvas.width ) {
                player.direction.x *= -1
                player.x += 2*player.direction.x;
            } 

            player.y += player.direction.y;
            if ( player.y<0 || player.y>canvas.height ) {
                player.direction.y *= -1
                player.y += 2*player.direction.y;
            }

            this.websocketRelayClient.sendTextMessage(player.toJson());
        }
    }

    var n = this.receivedMessages.length;
    for ( var i=0; i<n; i++ ) {
        var message = this.receivedMessages[i];
        if ( message==='reset' ) {
            this.remotePlayers = {};
        } else {
            var id = message.id;
            var remotePlayer = this.remotePlayers[id];
            if ( !remotePlayer ) {
                remotePlayer = new Player();
                this.remotePlayers[id] = remotePlayer;
            }
            remotePlayer.fromJson(message);
        }
    }
    this.receivedMessages.length = 0;
};

Game.prototype.render = function() {
    var canvas = this.canvas;
    var context = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;//* window.devicePixelRatio;
    canvas.height = canvas.clientHeight;// * window.devicePixelRatio;

    context.strokeStyle = 'black'
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height);

    for ( var id in this.localPlayers ) {
        var player = this.localPlayers[id];
        this.renderPlayer(player);
    }
    for ( var id in this.remotePlayers ) {
        var player = this.remotePlayers[id];
        this.renderPlayer(player);
    }
};

Game.prototype.renderPlayer = function(player) {
    var canvas = this.canvas;
    var context = canvas.getContext('2d');

    var x0 = player.x;
    var y0 = player.y;
    var radius = 50;
    var startAngle = 0;
    var endAngle = 2*Math.PI;
    var anticlockwise = false
    context.strokeStyle = 'black'
    context.fillStyle = player.color;
    context.beginPath();
    context.arc(x0, y0, radius, startAngle, endAngle, anticlockwise);
    context.fill();
    context.stroke();

    var numPasses = this.numWasteRenderPasses;
    for ( var i=0; i<numPasses; i++ ) {
        var h = 5;
        var w = 5;
        var s = 12;
        var r = 5;
        for ( var y=0; y<h; y++ ) {
            for ( var x=0; x<w; x++ ) {
                context.beginPath();
                context.fillStyle = getRandomColor();
                context.arc(x0 + x*s - (h*s/2), y0 + y*s - (h*s/2), r, startAngle, endAngle, anticlockwise);
                context.fill();
            }    
        }
    }
};


function getRandomColor() {
    return 'rgb(' + Math.random()*255 + ', ' + Math.random()*255 + ', '+ Math.random()*255 + ')';
}
