import { useEffect, useRef } from 'react'

interface UseCollabOptions {
  projectId: string
  onMessage: (data: any) => void
}

export function useCollab({ projectId, onMessage }: UseCollabOptions) {
  const websocket = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!projectId) {
      return
    }

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = location.host
    const wsUrl = `${protocol}//${host}/api/collab?projectId=${projectId}`

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error('Failed to parse message data:', error)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    ws.onerror = error => {
      console.error('WebSocket error:', error)
    }

    websocket.current = ws

    return () => {
      ws.close()
    }
  }, [projectId, onMessage])

  const sendMessage = (data: any) => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify(data))
    }
  }

  return { sendMessage }
}
