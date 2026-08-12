/**
 * WebSocket Client Manager for Live Sessions
 */

type EventCallback = (payload: any) => void

export class LiveSessionManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout = 1000
  private listeners: Map<string, Set<EventCallback>> = new Map()
  private token: string

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    try {
      const connectUrl = new URL(this.url)
      connectUrl.searchParams.set("token", this.token)
      this.ws = new WebSocket(connectUrl.toString())

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)
    } catch (error) {
      console.error("WebSocket connection error:", error)
      this.scheduleReconnect()
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close(1000, "Client disconnected gracefully")
      this.ws = null
    }
  }

  public subscribe(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(callback)

    return () => this.unsubscribe(event, callback)
  }

  public unsubscribe(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback)
  }

  public emit(event: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload }))
    } else {
      console.warn("WebSocket not connected. Cannot emit event:", event)
    }
  }

  private handleOpen() {
    console.log("WebSocket connected successfully")
    this.reconnectAttempts = 0
    this.dispatchEvent("connected", null)
  }

  private handleMessage(messageEvent: MessageEvent) {
    try {
      const data = JSON.parse(messageEvent.data)
      const { event, payload } = data
      
      if (event) {
        this.dispatchEvent(event, payload)
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error)
    }
  }

  private handleClose(event: CloseEvent) {
    console.log(`WebSocket closed (Code: ${event.code}, Reason: ${event.reason})`)
    this.dispatchEvent("disconnected", { code: event.code })
    
    if (event.code !== 1000) {
      this.scheduleReconnect()
    }
  }

  private handleError(event: Event) {
    console.error("WebSocket error:", event)
    this.dispatchEvent("error", event)
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const timeout = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1)
      console.log(`Attempting reconnect in ${timeout}ms... (Attempt ${this.reconnectAttempts})`)
      setTimeout(() => this.connect(), timeout)
    } else {
      console.error("Max reconnect attempts reached. Giving up.")
      this.dispatchEvent("reconnect_failed", null)
    }
  }

  private dispatchEvent(event: string, payload: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(payload)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }
}

// Singleton instance management if needed
let defaultInstance: LiveSessionManager | null = null

export const getLiveSessionManager = (url: string, token: string) => {
  if (!defaultInstance) {
    defaultInstance = new LiveSessionManager(url, token)
  }
  return defaultInstance
}
