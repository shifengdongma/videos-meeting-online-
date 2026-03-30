export interface SignalMessage {
  type: string
  [key: string]: unknown
}

export class WsClient {
  private socket: WebSocket | null = null
  private messageQueue: SignalMessage[] = []
  private readyResolve: (() => void) | null = null
  private readyPromise: Promise<void> = Promise.resolve()

  connect(url: string, onMessage: (event: MessageEvent<string>) => void): Promise<void> {
    this.messageQueue = []
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve
    })

    this.socket = new WebSocket(url)
    this.socket.onmessage = onMessage

    this.socket.onopen = () => {
      // Send queued messages
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift()!
        this.socket!.send(JSON.stringify(msg))
      }
      this.readyResolve?.()
    }

    return this.readyPromise
  }

  send(payload: SignalMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload))
    } else {
      // Queue the message to send once connected
      this.messageQueue.push(payload)
    }
  }

  close() {
    this.socket?.close()
  }
}