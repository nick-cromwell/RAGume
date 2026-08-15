import { useState, useEffect } from "react"
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"
import "./App.css"
import { getRecaptchaSiteKey } from "./config"
import About from "./components/About"
import Contact from "./components/Contact"
import Experience from "./components/Experience"
import Hero from "./components/Hero"
import Projects from "./components/Projects"
import SectionGrid from "./components/SectionGrid"
import Skills from "./components/Skills"

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
]

const EXPERIENCE = [
  {
    role: "Lorem Ipsum Designer",
    company: "Dolor Sit Amet",
    period: "2024 – Present",
    location: "Lorem City, IA",
    bullets: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ],
  },
  {
    role: "Consectetur Adipiscing",
    company: "Sed Do Eiusmod",
    period: "2021 – 2024",
    location: "Ipsum, LT",
    bullets: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit.",
    ],
  },
  {
    role: "Dolor Sit Amet",
    company: "Tempor Incididunt",
    period: "2018 – 2021",
    location: "Consectetur, OR",
    bullets: [
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
      "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.",
    ],
  },
]

const PROJECTS = [
  {
    title: "Lorem Ipsum Project",
    tag: "Lorem",
    year: "2026",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    links: [{ label: "Case study", href: "#" }],
    tech: ["Lorem", "Ipsum", "Dolor", "Sit"],
  },
  {
    title: "Dolor Sit Amet",
    tag: "Ipsum",
    year: "2025",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
    links: [{ label: "Case study", href: "#" }],
    tech: ["Consectetur", "Adipiscing", "Elit", "Tempor"],
  },
  {
    title: "Consectetur Adipiscing",
    tag: "Dolor",
    year: "2024",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    links: [{ label: "Case study", href: "#" }],
    tech: ["Sed", "Do", "Eiusmod", "Tempor"],
  },
]

const SKILLS = [
  {
    category: "Lorem",
    items: ["Lorem", "Ipsum", "Dolor", "Sit", "Amet"],
  },
  {
    category: "Consectetur",
    items: ["Adipiscing", "Elit", "Sed", "Do", "Eiusmod"],
  },
  {
    category: "Tempor",
    items: ["Incididunt", "Labore", "Dolore", "Magna", "Aliqua"],
  },
  { category: "Ut", items: ["Enim", "Ad", "Minim", "Veniam", "Quis"] },
]

const BG = `
  radial-gradient(ellipse 80% 60% at 20% -10%, rgba(100,90,210,0.4) 0%, transparent 65%),
  radial-gradient(ellipse 60% 50% at 85% 110%, rgba(70,70,200,0.35) 0%, transparent 60%),
  radial-gradient(ellipse 50% 40% at 60% 50%, rgba(50,60,140,0.25) 0%, transparent 70%),
  #1e2440
`.trim()

const SUGGESTED = [
  "What's his background?",
  "What tools does he use?",
  "Is he available to hire?",
  "What are his strengths?",
]

function useBreakpoint(px: number) {
  const [below, setBelow] = useState(() => window.innerWidth < px)
  useEffect(() => {
    const fn = () => setBelow(window.innerWidth < px)
    window.addEventListener("resize", fn, { passive: true })
    return () => window.removeEventListener("resize", fn)
  }, [px])
  return below
}

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const mobile = useBreakpoint(840)
  const recaptchaSiteKey = getRecaptchaSiteKey()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = ["about", "experience", "projects", "skills", "contact"]
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const appContent = (
    <div
      style={{
        fontFamily: "var(--font-body)",
        background: BG,
        color: "var(--color-fg)",
        minHeight: "100vh",
      }}
    >
      {/* Nav */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderBottom:
            scrolled || menuOpen
              ? "1px solid rgba(167,139,250,0.15)"
              : "1px solid transparent",
          background:
            scrolled || menuOpen ? "rgba(11,14,26,0.92)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(16px)" : "none",
          transition: "all 0.25s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
          }}
        >
          <a
            href="#"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: 18,
              letterSpacing: "-0.01em",
              color: "var(--color-fg)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            Nick Cromwell
            <img
              src="./picture.jpg"
              alt=""
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                objectFit: "cover",
                objectPosition: "top",
                border: "1.5px solid rgba(167,139,250,0.4)",
                opacity: scrolled ? 1 : 0,
                transform: scrolled ? "scale(1)" : "scale(0.6)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
                flexShrink: 0,
              }}
            />
          </a>
          {mobile ? (
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 8,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
              aria-label="Toggle menu"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    width: 22,
                    height: 1.5,
                    background: "var(--color-fg)",
                    transition: "transform 0.2s, opacity 0.2s",
                    transformOrigin: "center",
                    transform: menuOpen
                      ? i === 0
                        ? "translateY(6.5px) rotate(45deg)"
                        : i === 2
                          ? "translateY(-6.5px) rotate(-45deg)"
                          : "scaleX(0)"
                      : "none",
                    opacity: menuOpen && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </button>
          ) : (
            <nav style={{ display: "flex", gap: 32 }}>
              {NAV_LINKS.map(({ label, href }) => {
                const id = href.replace("#", "")
                const isActive = activeSection === id
                return (
                  <a
                    key={href}
                    href={href}
                    className="nav-link"
                    style={{
                      fontWeight: 500,
                      fontSize: 13,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: isActive
                        ? "var(--color-accent)"
                        : "var(--color-muted)",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--color-fg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = isActive
                        ? "var(--color-accent)"
                        : "var(--color-muted)")
                    }
                  >
                    {label}
                  </a>
                )
              })}
            </nav>
          )}
        </div>
        {mobile && menuOpen && (
          <nav
            style={{
              padding: "12px 24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontWeight: 500,
                  fontSize: 15,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "var(--color-fg)",
                  textDecoration: "none",
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(167,139,250,0.1)",
                }}
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <Hero mobile={mobile} />

      <Divider />

      <About mobile={mobile} />

      <Divider />

      <Experience jobs={EXPERIENCE} mobile={mobile} />

      <Divider />

      <Projects projects={PROJECTS} mobile={mobile} />

      <Divider />

      {/* Education */}
      <section
        id="education"
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: mobile ? "64px 24px" : "96px 32px",
        }}
      >
        <SectionGrid label="04 — Education" mobile={mobile}>
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
                margin: "0 0 6px",
              }}
            >
              Lorem Ipsum University
            </p>
            <p
              style={{
                fontWeight: 400,
                fontSize: 16,
                color: "var(--color-fg)",
                margin: "0 0 4px",
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--color-muted)",
                margin: 0,
              }}
            >
              2020 – 2024
            </p>
          </div>
        </SectionGrid>
      </section>

      <Divider />

      <Skills skills={SKILLS} mobile={mobile} />

      <Divider />

      <Contact mobile={mobile} />

      <footer
        style={{
          borderTop: "1px solid rgba(167,139,250,0.12)",
          padding: "20px 24px",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-muted)",
              margin: 0,
            }}
          >
            © 2026 Nick Cromwell
          </p>
        </div>
      </footer>
    </div>
  )

  if (!recaptchaSiteKey) {
    return appContent
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaSiteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "body",
      }}
    >
      {appContent}
    </GoogleReCaptchaProvider>
  )
}


function Divider() {
  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ height: 1, background: "rgba(167,139,250,0.12)" }} />
    </div>
  )
}


