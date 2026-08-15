import { useState } from "react"
import SectionGrid from "./SectionGrid"

export type Project = {
  title: string
  tag: string
  year: string
  description: string
  links: { label: string; href: string }[]
  tech: string[]
}

export default function Projects({
  projects,
  mobile,
}: {
  projects: Project[]
  mobile: boolean
}) {
  return (
    <section
      id="projects"
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: mobile ? "64px 24px" : "96px 32px",
      }}
    >
      <SectionGrid label="03 — Projects" mobile={mobile}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {projects.map((project, i) => (
            <ProjectCard
              key={`${project.title}-${project.year}`}
              project={project}
              last={i === projects.length - 1}
              mobile={mobile}
            />
          ))}
        </div>
      </SectionGrid>
    </section>
  )
}

function ProjectCard({
  project,
  last,
  mobile,
}: {
  project: Project
  last: boolean
  mobile: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: last ? "none" : "1px solid rgba(167,139,250,0.12)",
        paddingBottom: last ? 0 : 40,
        marginBottom: last ? 0 : 40,
        transition: "opacity 0.2s",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "1fr auto",
          gap: mobile ? 12 : 32,
          alignItems: "start",
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
                background: "rgba(167,139,250,0.1)",
                border: "1px solid rgba(167,139,250,0.2)",
                borderRadius: 20,
                padding: "3px 10px",
              }}
            >
              {project.tag}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--color-muted)",
                letterSpacing: "0.05em",
              }}
            >
              {project.year}
            </span>
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: mobile ? 18 : 22,
              letterSpacing: "-0.01em",
              margin: 0,
              color: hovered ? "var(--color-accent)" : "var(--color-fg)",
              transition: "color 0.2s",
            }}
          >
            {project.title}
          </h3>
        </div>
        {!mobile && (
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {project.links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="project-link"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  border: "1px solid rgba(167,139,250,0.25)",
                  borderRadius: 6,
                  padding: "5px 12px",
                  transition: "all 0.15s",
                  background: "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(167,139,250,0.1)"
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.25)"
                }}
              >
                {label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
      <p
        style={{
          fontWeight: 300,
          fontSize: 14,
          lineHeight: 1.7,
          color: "var(--color-muted)",
          margin: "0 0 14px",
          maxWidth: 620,
        }}
      >
        {project.description}
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {project.tech.map((t) => (
          <span
            key={t}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.04em",
              color: "var(--color-muted)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(167,139,250,0.12)",
              borderRadius: 4,
              padding: "3px 8px",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      {mobile && (
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          {project.links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
                textDecoration: "none",
              }}
            >
              {label} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
