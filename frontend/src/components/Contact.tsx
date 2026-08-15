import ContactForm from "./ContactForm"
import SectionGrid from "./SectionGrid"

export default function Contact({
  mobile,
}: {
  mobile: boolean
}) {
  return (
    <section
      id="contact"
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: mobile ? "64px 24px 100px" : "96px 32px 140px",
      }}
    >
      <SectionGrid label="06 — Contact" mobile={mobile}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
            gap: mobile ? 48 : 64,
            alignItems: "start",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: mobile ? 32 : 40,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                margin: "0 0 16px",
                color: "var(--color-fg)",
              }}
            >
              Lorem ipsum
              <br />
              <em style={{ fontStyle: "italic", color: "var(--color-accent)" }}>
                dolor sit amet
              </em>
            </h2>
            <p
              style={{
                fontWeight: 300,
                fontSize: mobile ? 15 : 16,
                lineHeight: 1.7,
                color: "var(--color-muted)",
                margin: "0 0 32px",
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { platform: "Lorem Ipsum", url: "example.com/lorem-ipsum" },
              ].map(({ platform, url }) => (
                <div
                  key={platform}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(167,139,250,0.12)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--color-muted)",
                    }}
                  >
                    {platform}
                  </span>
                  <a
                    href={`https://${url}`}
                    className="icon-link"
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      color: "var(--color-fg)",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--color-accent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--color-fg)")
                    }
                  >
                    {url}
                  </a>
                </div>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </SectionGrid>
    </section>
  )
}
