const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export class ChatApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// Streams the reply from POST /chat/stream, calling onChunk(text) for each
// piece as it arrives. Resolves with the full reply text.
export async function streamChatMessage(message, onChunk) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
  } catch {
    throw new ChatApiError('Network error', 0)
  }

  if (!response.ok || !response.body) {
    throw new ChatApiError(`Chat request failed with status ${response.status}`, response.status)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      if (text) {
        fullText += text
        onChunk(text)
      }
    }
  } catch {
    // Connection dropped mid-answer. Keep whatever already arrived.
    if (!fullText) throw new ChatApiError('Network error', 0)
  }

  return fullText
}
