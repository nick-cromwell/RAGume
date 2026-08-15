
import { useState } from "react"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { getApiBaseUrl } from "../config"

export default function ContactForm() {
  const [fields, setFields] = useState({ name: "", email: "", message: "" })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const { executeRecaptcha } = useGoogleReCaptcha()
  const captchaAvailable = !!executeRecaptcha

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFields((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const getCaptchaToken = async (action: string) => {
    if (!executeRecaptcha) {
      return ""
    }

    return executeRecaptcha(action)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fields.name || !fields.email || !fields.message || sending) return
    if (!captchaAvailable) {
      window.alert("This form is unavailable because reCAPTCHA is not configured.")
      return
    }

    setSending(true)

    try {
      const token = await getCaptchaToken("contact")
      const response = await fetch(`${getApiBaseUrl()}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name,
          email: fields.email,
          message: fields.message,
          token,
        }),
      })

      const payload = await response.json().catch(() => ({ message: "Unable to send message." })) as { message?: string }

      if (!response.ok) {
        throw new Error(payload.message || "Unable to send message.")
      }

      setSent(true)
      setFields({ name: "", email: "", message: "" })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send message."
      window.alert(message)
    } finally {
      setSending(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(167,139,250,0.2)",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: "var(--color-fg)",
    fontFamily: "var(--font-body)",
    fontWeight: 300,
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(167,139,250,0.18)",
        borderRadius: 16,
        overflow: "hidden",
        backdropFilter: "blur(12px)",
        boxShadow:
          "0 24px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(167,139,250,0.1)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid rgba(167,139,250,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            margin: 0,
          }}
        >
          Contact me
        </p>
      </div>

      {sent ? (
        <div style={{ padding: "28px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 20, margin: "0 0 8px" }}>✦</p>
          <p
            style={{
              fontWeight: 500,
              fontSize: 14,
              color: "var(--color-fg)",
              margin: "0 0 4px",
            }}
          >
            Message sent!
          </p>
          <p
            style={{
              fontSize: 13,
              fontWeight: 300,
              color: "var(--color-muted)",
              margin: 0,
            }}
          >
            Thanks — I'll be in touch soon.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <input
              name="name"
              type="text"
              placeholder="Name"
              value={fields.name}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(167,139,250,0.2)")
              }
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={fields.email}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(167,139,250,0.2)")
              }
            />
          </div>
          <textarea
            name="message"
            placeholder="Message"
            value={fields.message}
            onChange={handleChange}
            rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.5, flex: 1 }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(167,139,250,0.2)")
            }
          />
          <button
            type="submit"
            disabled={
              !fields.name ||
              !fields.email ||
              !fields.message ||
              sending ||
              !captchaAvailable
            }
            style={{
              alignSelf: "flex-end",
              padding: "9px 20px",
              borderRadius: 8,
              border: "none",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              cursor:
                fields.name &&
                fields.email &&
                fields.message &&
                !sending &&
                captchaAvailable
                  ? "pointer"
                  : "default",
              background:
                fields.name &&
                fields.email &&
                fields.message &&
                !sending &&
                captchaAvailable
                  ? "var(--color-accent)"
                  : "rgba(167,139,250,0.15)",
              color:
                fields.name &&
                fields.email &&
                fields.message &&
                !sending &&
                captchaAvailable
                  ? "#1e2440"
                  : "rgba(167,139,250,0.4)",
              transition: "all 0.15s",
            }}
          >
            {sending ? "Sending…" : "Send message"}
          </button>
        </form>
      )}
    </div>
  )
}
