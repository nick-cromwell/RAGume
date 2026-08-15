import { useEffect, useRef, useState } from "react"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { getApiBaseUrl, getApiUrl } from "../config"

const SUGGESTED = [
  "What's his background?",
  "What tools does he use?",
  "Is he available to hire?",
  "What are his strengths?",
]

type ChatPanelProps = {
  mobile: boolean
}

export default function ChatPanel({ mobile }: ChatPanelProps) {
  const [response, setResponse] = useState("")
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const [apiStatus, setApiStatus] = useState<"online" | "offline">("online")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { executeRecaptcha } = useGoogleReCaptcha()
  const captchaAvailable = !!executeRecaptcha

  useEffect(() => {
    let active = true

    const checkHealth = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/health`)
        if (!active) return
        setApiStatus(res.ok ? "online" : "offline")
      } catch {
        if (active) {
          setApiStatus("offline")
        }
      }
    }

    void checkHealth()

    return () => {
      active = false
    }
  }, [])

  const getCaptchaToken = async (action: string) => {
    if (!executeRecaptcha) {
      return ""
    }

    return executeRecaptcha(action)
  }

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || thinking || !captchaAvailable) return

    setInput("")
    setResponse("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    setThinking(true)

    try {
      const token = await getCaptchaToken("query")
      const controller = new AbortController()
      const res = await fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed, token }),
        signal: controller.signal,
      })

      if (!res.ok) {
        let message = "Request failed"
        const contentType = res.headers.get("content-type") || ""

        if (contentType.includes("application/json")) {
          const payload = await res.json() as { message?: string }
          if (payload.message) message = payload.message
        } else {
          const payload = await res.text().catch(() => "")
          if (payload) message = payload
        }

        throw new Error(message)
      }

      const reader = res.body?.getReader()
      if (!reader) {
        throw new Error("Streaming response is not available.")
      }

      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        if (chunk && thinking) {
          setThinking(false)
        }

        accumulated += chunk
        setResponse(accumulated)
      }

      const tail = decoder.decode()
      if (tail) {
        accumulated += tail
        setResponse(accumulated)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong while contacting the server."
      setResponse(message)
    } finally {
      setThinking(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (!e.shiftKey || e.metaKey)) {
      e.preventDefault()
      void send(input)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
  }

  const resetChat = () => {
    setResponse("")
    setInput("")
    setThinking(false)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const statusColor = apiStatus === "online" ? "#4ade80" : "#f87171"
  const statusLabel = apiStatus === "online" ? "online" : "offline"
  const isEmpty = !response && !thinking

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(167,139,250,0.18)",
        borderRadius: 16,
        overflow: "hidden",
        backdropFilter: "blur(12px)",
        boxShadow:
          "0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(167,139,250,0.1)",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(167,139,250,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c5cbf, #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ✦
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 1,
              right: 1,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: statusColor,
              border: "1.5px solid rgba(11,14,26,0.8)",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontWeight: 500,
              fontSize: 13,
              margin: 0,
              color: "var(--color-fg)",
            }}
          >
            RAGumé
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: statusColor,
              margin: 0,
              letterSpacing: "0.06em",
            }}
          >
            {statusLabel}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {response && !thinking && (
            <button
              type="button"
              aria-label="Clear chat"
              onClick={resetChat}
              title="Clear chat"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1px solid rgba(167,139,250,0.25)",
                background: "rgba(167,139,250,0.08)",
                color: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.18s ease",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(167,139,250,0.18)"
                e.currentTarget.style.borderColor = "rgba(167,139,250,0.45)"
                e.currentTarget.style.transform = "translateY(-1px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(167,139,250,0.08)"
                e.currentTarget.style.borderColor = "rgba(167,139,250,0.25)"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <a
            href="https://github.com/nickcromwell"
            target="_blank"
            rel="noopener noreferrer"
            title="View code on GitHub"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: 8,
              border: "1px solid rgba(167,139,250,0.2)",
              background: "rgba(167,139,250,0.06)",
              textDecoration: "none",
              color: "var(--color-muted)",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(167,139,250,0.45)"
              e.currentTarget.style.color = "var(--color-accent)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(167,139,250,0.2)"
              e.currentTarget.style.color = "var(--color-muted)"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.04em",
              }}
            >
              Code
            </span>
          </a>
        </div>
      </div>

      <div
        style={{
          padding: "24px 20px",
          minHeight: mobile ? 120 : 240,
          display: "flex",
          alignItems: isEmpty ? "center" : "flex-start",
          justifyContent: isEmpty ? "center" : "flex-start",
        }}
      >
        {isEmpty && (
          <p
            style={{
              fontSize: 14,
              fontWeight: 300,
              lineHeight: 1.75,
              color: "rgba(200,210,255,0.8)",
              textAlign: "center",
              margin: 0,
              maxWidth: 340,
            }}
          >
            Welcome to my{" "}
            <em style={{ fontStyle: "italic", color: "var(--color-accent)" }}>
              RAGumé
            </em>
            , a fully functional Retrieval Augmented Generative resumé populated
            with numerous facts about me, my skills, and my experiences.{" "}
            <a
              href="https://github.com/nickcromwell"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--color-accent)",
                textDecoration: "underline",
                textDecorationColor: "rgba(167,139,250,0.4)",
                textUnderlineOffset: 3,
              }}
            >
              View the code on GitHub.
            </a>
          </p>
        )}
        {thinking && (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--color-accent)",
                  display: "inline-block",
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
        {response && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "100%",
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 300,
                lineHeight: 1.7,
                color: "var(--color-fg)",
                margin: 0,
              }}
            >
              {response}
            </p>
          </div>
        )}
      </div>

      {isEmpty && (
        <div
          style={{
            padding: "0 20px 16px",
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              style={{
                background: "rgba(167,139,250,0.08)",
                border: "1px solid rgba(167,139,250,0.18)",
                borderRadius: 20,
                padding: "5px 12px",
                fontSize: 12,
                color: "var(--color-accent)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(167,139,250,0.18)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(167,139,250,0.08)")
              }
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(167,139,250,0.12)",
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKey}
          placeholder="Ask anything about Nick…"
          rows={1}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(167,139,250,0.2)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 14,
            color: "var(--color-fg)",
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            resize: "none",
            outline: "none",
            lineHeight: 1.5,
            transition: "border-color 0.15s",
            minHeight: 40,
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "rgba(167,139,250,0.2)")
          }
        />
        <button
          onClick={() => send(input)}
          disabled={
            !input.trim() ||
            thinking ||
            apiStatus === "offline" ||
            !captchaAvailable
          }
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "none",
            background:
              input.trim() && !thinking && captchaAvailable
                ? "var(--color-accent)"
                : "rgba(167,139,250,0.15)",
            color:
              input.trim() && !thinking && captchaAvailable
                ? "#0b0e1a"
                : "rgba(167,139,250,0.4)",
            cursor:
              input.trim() && !thinking && captchaAvailable ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
            transition: "all 0.15s",
          }}
          aria-label="Send"
          title={
            captchaAvailable
              ? "Send"
              : "reCAPTCHA is not configured for this environment"
          }
        >
          ↑
        </button>
      </div>
    </div>
  )
}
