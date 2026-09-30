import { useEffect, useRef } from 'react'

// Gemini answers use light Markdown (**bold**, `code`, "* " bullets). This
// renders just that narrow subset — not a full Markdown parser/dependency,
// since that's all the assistant's system prompt actually produces.
function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*.+?\*\*|`.+?`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={`${keyPrefix}-c${i}`}
          className="rounded bg-black/30 px-1 py-0.5 font-mono text-[13px] text-violet-200"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

function renderMessageBody(text) {
  const lines = text.split('\n')
  const blocks = []
  let currentList = []

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc space-y-1 pl-4">
          {currentList.map((item, i) => (
            <li key={i}>{renderInline(item, `li-${blocks.length}-${i}`)}</li>
          ))}
        </ul>,
      )
      currentList = []
    }
  }

  lines.forEach((rawLine, idx) => {
    const trimmed = rawLine.trim()
    const bulletMatch = trimmed.match(/^[*-]\s+(.*)$/)
    if (bulletMatch) {
      currentList.push(bulletMatch[1])
      return
    }
    if (trimmed === '') {
      flushList()
      return
    }
    flushList()
    blocks.push(<p key={`p-${idx}`}>{renderInline(trimmed, `p-${idx}`)}</p>)
  })
  flushList()

  return blocks
}

export default function ChatWindow({
  messages,
  input,
  isLoading,
  onInputChange,
  onSend,
  onClose,
  maxLength,
  suggestions,
  onSuggestionClick,
}) {
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isLoading])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <div
      role="dialog"
      aria-label="AI portfolio assistant chat"
      className="fixed bottom-24 left-5 right-5 z-50 flex h-[70svh] max-h-[520px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0c12] shadow-2xl sm:bottom-28 sm:left-auto sm:right-6 sm:w-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
            ✦
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Mozammil AI</p>
            <p className="text-[11px] text-gray-500">AI Portfolio Assistant</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-full p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="chat-scroll flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'user' ? (
              <p className="max-w-[80%] whitespace-pre-wrap wrap-break-word rounded-2xl bg-violet-500 px-3.5 py-2.5 text-[15px] leading-relaxed text-white">
                {message.text}
              </p>
            ) : (
              <div className="max-w-[85%] space-y-2 wrap-break-word rounded-2xl border border-white/5 bg-white/6 px-4 py-3 text-[15px] leading-relaxed text-gray-100">
                {renderMessageBody(message.text)}
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-white/6 px-4 py-3">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
              </span>
              <span className="text-xs text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested questions */}
      {suggestions?.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-white/5 px-4 py-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => onSuggestionClick(suggestion.question)}
              disabled={isLoading}
              className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-white/10 p-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          placeholder="Ask about Mozammil…"
          aria-label="Message the AI portfolio assistant"
          className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white placeholder:text-gray-500 transition focus:border-violet-400/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.25)] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onSend()}
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
