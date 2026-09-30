import { useState } from 'react'
import ChatWindow from './ChatWindow'
import { streamChatMessage } from '../services/chatApi'

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: "Hi! I'm Mozammil's AI assistant. Ask me about his projects, skills, experience, or education.",
}

const SUGGESTED_QUESTIONS = [
  { label: 'My projects', question: 'What projects has Mozammil built?' },
  { label: 'Tech stack', question: 'What technologies does Mozammil work with?' },
  { label: 'Experience', question: "What is Mozammil's work experience?" },
  { label: 'DocuMind AI', question: 'Tell me about DocuMind AI.' },
]

const UNAVAILABLE_REPLY =
  'Sorry, the assistant is temporarily unavailable. Please try again.'

const RATE_LIMIT_REPLY =
  "You're sending messages a little too quickly. Please try again in a moment."

function replyForError(error) {
  if (error?.status === 429) return RATE_LIMIT_REPLY
  return UNAVAILABLE_REPLY
}

const MAX_INPUT_LENGTH = 300

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev
      if (next && !hasOpenedOnce) {
        setMessages([WELCOME_MESSAGE])
        setHasOpenedOnce(true)
      }
      return next
    })
  }

  const handleSend = async (overrideText) => {
    const trimmed = (overrideText ?? input).trim()
    if (!trimmed || isLoading) return

    const userMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // The assistant bubble is only added once the first chunk arrives, so
    // the typing indicator shows until then.
    const assistantId = `a-${Date.now()}`
    let started = false
    const appendChunk = (chunk) => {
      if (!started) {
        started = true
        setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', text: chunk }])
        return
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + chunk } : m)),
      )
    }

    try {
      const replyText = await streamChatMessage(trimmed, appendChunk)
      if (!replyText.trim() && !started) appendChunk(UNAVAILABLE_REPLY)
    } catch (error) {
      if (!started) appendChunk(replyForError(error))
    }
    setIsLoading(false)
  }

  return (
    <>
      {isOpen && (
        <ChatWindow
          messages={messages}
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSend={handleSend}
          onClose={toggleOpen}
          maxLength={MAX_INPUT_LENGTH}
          suggestions={messages.length <= 1 ? SUGGESTED_QUESTIONS : []}
          onSuggestionClick={(question) => handleSend(question)}
        />
      )}

      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 sm:bottom-6 sm:right-6">
        {!isOpen && (
          <span className="animate-pulse whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#05060a] shadow-lg">
            Ask me anything 👋
          </span>
        )}
        <button
          type="button"
          onClick={toggleOpen}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close AI assistant chat' : 'Open AI assistant chat'}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-blue-500 text-white shadow-[0_0_25px_-5px_rgba(139,92,246,0.8)] transition hover:opacity-90"
        >
          {isOpen ? <CloseIcon /> : <RobotIcon />}
        </button>
      </div>
    </>
  )
}

function RobotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M12 2v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="2.5" r="1" fill="currentColor" />
      <rect
        x="4"
        y="6"
        width="16"
        height="13"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <circle cx="9" cy="12.5" r="1.4" fill="currentColor" />
      <circle cx="15" cy="12.5" r="1.4" fill="currentColor" />
      <path
        d="M9 16h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M2 12h2M20 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
