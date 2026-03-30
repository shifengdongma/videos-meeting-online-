export class WsClient {
    constructor() {
        Object.defineProperty(this, "socket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "messageQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "readyResolve", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "readyPromise", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Promise.resolve()
        });
    }
    connect(url, onMessage) {
        this.messageQueue = [];
        this.readyPromise = new Promise((resolve) => {
            this.readyResolve = resolve;
        });
        this.socket = new WebSocket(url);
        this.socket.onmessage = onMessage;
        this.socket.onopen = () => {
            // Send queued messages
            while (this.messageQueue.length > 0) {
                const msg = this.messageQueue.shift();
                this.socket.send(JSON.stringify(msg));
            }
            this.readyResolve?.();
        };
        return this.readyPromise;
    }
    send(payload) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(payload));
        }
        else {
            // Queue the message to send once connected
            this.messageQueue.push(payload);
        }
    }
    close() {
        this.socket?.close();
    }
}
