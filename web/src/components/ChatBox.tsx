import { useState, useRef, type FormEvent } from 'react'

interface ChatMessage {
  role: 'user' | 'bot'
  content: string
}

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  function handleSend(e: FormEvent) {
    e.preventDefault()
    const message = inputRef.current?.value.trim()
    if (!message || eventSourceRef.current) return

    setMessages((prev) => [...prev, { role: 'user', content: message }])
    inputRef.current!.value = ''

    const es = new EventSource(`/sse?message=${encodeURIComponent(message)}`)
    eventSourceRef.current = es

    es.addEventListener('chat-response', (e) => {
      setMessages((prev) => [...prev, { role: 'bot', content: e.data }])
      es.close()
      eventSourceRef.current = null
    })

    es.onerror = () => {
      es.close()
      eventSourceRef.current = null
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ marginBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <strong>{m.role === 'user' ? 'You' : 'Bot'}:</strong> {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input ref={inputRef} type="text" placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
