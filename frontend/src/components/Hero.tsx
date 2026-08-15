import { useState } from "react"
import ChatPanel from "./ChatPanel"

type HeroProps = {
  mobile: boolean
}

function HeroButton({
  href,
  children,
  primary,
}: {
  href: string
  children: React.ReactNode
  primary: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={href}
      className={`hero-button ${primary ? "primary" : "secondary"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "11px 20px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        textDecoration: "none",
        transition: "all 0.18s ease",
        ...(primary
          ? {
              background: hovered ? "#b39dfc" : "var(--color-accent)",
              color: "#0b0e1a",
              boxShadow: hovered ? "0 0 24px rgba(167,139,250,0.4)" : "none",
            }
          : {
              background: hovered ? "rgba(167,139,250,0.1)" : "transparent",
              color: "var(--color-fg)",
              border: "1px solid rgba(167,139,250,0.25)",
            }),
      }}
    >
      {children}
    </a>
  )
}

export default function Hero({ mobile }: HeroProps) {
  return (
    <section
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: mobile ? "100px 24px 64px" : "120px 32px 80px",
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "340px 1fr",
        gap: mobile ? 48 : 56,
        alignItems: "start",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: mobile ? "center" : "flex-start",
          textAlign: mobile ? "center" : "left",
          gap: 0,
        }}
      >
        <div style={{ position: "relative", marginBottom: 20 }}>
          <img
            src="/picture.jpg"
            alt="Nick Cromwell"
            style={{
              width: mobile ? 100 : "100%",
              height: mobile ? 100 : 320,
              objectFit: "cover",
              objectPosition: "top",
              borderRadius: mobile ? "50%" : 16,
              display: "block",
              background: "#1a1830",
              boxShadow:
                "0 0 0 1px rgba(167,139,250,0.2), 0 24px 48px rgba(0,0,0,0.5)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: -20,
              borderRadius: 28,
              background:
                "radial-gradient(ellipse at center, rgba(124,92,191,0.25) 0%, transparent 70%)",
              zIndex: -1,
              filter: "blur(16px)",
            }}
          />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: mobile ? 44 : 60,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            color: "var(--color-fg)",
            margin: "0 0 12px",
          }}
        >
          <span style={{ fontFamily: "'Lora', Georgia, serif" }}>
            Lorem Ipsum
          </span>
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            margin: "0 0 8px",
          }}
        >
          Dolor Sit Amet
        </p>
        <p
          style={{
            fontWeight: 400,
            fontSize: mobile ? 14 : 15,
            lineHeight: 1.65,
            color: "var(--color-fg)",
            opacity: 0.8,
            margin: mobile ? 0 : "0 0 24px",
            maxWidth: mobile ? 280 : "none",
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>

        {!mobile && (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 28,
              }}
            >
              {[
                { icon: "📍", text: "Lorem City, IA" },
                { icon: "💼", text: "Open to lorem & freelance" },
                { icon: "✉️", text: "lorem@example.com" },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span style={{ fontSize: 12 }}>{icon}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      letterSpacing: "0.04em",
                      color: "var(--color-muted)",
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <HeroButton href="#contact" primary>
                Get in touch
              </HeroButton>
              <HeroButton href="/resume.pdf" primary={false}>
                ↓ Resumé
              </HeroButton>
            </div>
          </>
        )}
      </div>


        <ChatPanel mobile={mobile} />

      {mobile && (
        <div
          style={{
            padding: "0 24px 0",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
            gridColumn: "1 / -1",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { icon: "📍", text: "Lorem City, IA" },
              { icon: "💼", text: "Open to lorem & freelance" },
              { icon: "✉️", text: "lorem@example.com" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(167,139,250,0.08)",
                  border: "1px solid rgba(167,139,250,0.15)",
                  borderRadius: 20,
                  padding: "5px 12px",
                }}
              >
                <span style={{ fontSize: 11 }}>{icon}</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.04em",
                    color: "var(--color-muted)",
                  }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <HeroButton href="#contact" primary>
              Get in touch
            </HeroButton>
            <HeroButton href="/resume.pdf" primary={false}>
              ↓ Resumé
            </HeroButton>
          </div>
        </div>
      )}
    </section>
  )
}
