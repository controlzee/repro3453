'use strict';

function WebsocketRelayClientInWebWorker() {
    this.worker = new Worker('Worker.js');
    this.worker.postMessage({
        action:'init',
        hostname: window.location.host
    })
    this.worker.onmessage = this._onWebworkerMessage.bind(this);

    this.onTextMessageReceived = null;
};

WebsocketRelayClientInWebWorker.prototype.dispose = function() {
    // this._closeWebsocket();
};

WebsocketRelayClientInWebWorker.prototype.sendTextMessage = function( text ) {
    // var jsonObject = {
    //     type:'text',
    //     text:text
    // }
    // var jsonString = JSON.stringify(jsonObject);
    // this._websocket.send(jsonString);
    this.worker.postMessage({
        action:'postMessage',
        text: text
    })
};

WebsocketRelayClientInWebWorker.prototype.ping = function() {
    // var jsonObject = {
    //     type:'ping',
    //     senderID: this._senderID,
    //     receiverID: null,
    //     timestamp: performance.now()
    // };
    // var jsonString = JSON.stringify(jsonObject);
    // this._websocket.send(jsonString);
};

WebsocketRelayClientInWebWorker.prototype.sendArrayBuffer = function( arrayBuffer ) {
    // this._websocket.send(arrayBuffer);
};


WebsocketRelayClientInWebWorker.prototype._onWebworkerMessage = function(e) {
    var message = e.data;
    if ( this.onTextMessageReceived ) {
        this.onTextMessageReceived(message);
    }
};