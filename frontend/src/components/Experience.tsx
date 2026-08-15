import { useState } from "react"
import SectionGrid from "./SectionGrid"

export type ExperienceJob = {
  role: string
  company: string
  period: string
  location: string
  bullets: string[]
}

export default function Experience({
  jobs,
  mobile,
}: {
  jobs: ExperienceJob[]
  mobile: boolean
}) {
  return (
    <section
      id="experience"
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: mobile ? "64px 24px" : "96px 32px",
      }}
    >
      <SectionGrid label="02 — Experience" mobile={mobile}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {jobs.map((job, i) => (
            <ExperienceRow
              key={`${job.company}-${job.role}`}
              job={job}
              last={i === jobs.length - 1}
              mobile={mobile}
            />
          ))}
        </div>
      </SectionGrid>
    </section>
  )
}


function ExperienceRow({
  job,
  last,
  mobile,
}: {
  job: ExperienceJob
  last: boolean
  mobile: boolean
}) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        borderBottom: last ? "none" : "1px solid rgba(167,139,250,0.12)",
        paddingBottom: last ? 0 : 36,
        marginBottom: last ? 0 : 36,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "start",
          gap: 16,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: mobile ? 18 : 22,
              letterSpacing: "-0.01em",
              margin: "0 0 4px",
              color:
                hovered || open ? "var(--color-accent)" : "var(--color-fg)",
              transition: "color 0.2s",
            }}
          >
            {job.role}
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontWeight: 500,
                fontSize: 13,
                color: "var(--color-accent)",
              }}
            >
              {job.company}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--color-muted)",
                letterSpacing: "0.05em",
              }}
            >
              {job.location}
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingTop: 4,
          }}
        >
          {!mobile && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--color-muted)",
                whiteSpace: "nowrap",
              }}
            >
              {job.period}
            </span>
          )}
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "1.5px solid rgba(167,139,250,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              lineHeight: 1,
              color: "var(--color-accent)",
              flexShrink: 0,
              transition: "transform 0.2s",
              transform: open ? "rotate(45deg)" : "none",
            }}
          >
            +
          </span>
        </div>
      </button>
      {mobile && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-muted)",
            margin: "6px 0 0",
          }}
        >
          {job.period}
        </p>
      )}
      {open && (
        <ul
          style={{
            listStyle: "none",
            padding: "16px 0 0",
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {job.bullets.map((b, i) => (
            <li
              key={`${job.company}-${job.role}-${b}`}
              style={{
                display: "flex",
                gap: 12,
                fontSize: 14,
                fontWeight: 300,
                lineHeight: 1.6,
                color: "var(--color-muted)",
              }}
            >
              <span
                style={{
                  color: "var(--color-accent)",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                —
              </span>
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
