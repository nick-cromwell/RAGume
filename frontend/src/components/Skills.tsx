export type SkillGroup = {
  category: string
  items: string[]
}

export default function Skills({
  skills,
  mobile,
}: {
  skills: SkillGroup[]
  mobile: boolean
}) {
  return (
    <section
      id="skills"
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: mobile ? "64px 24px" : "96px 32px",
      }}
    >
      <SectionGrid label="05 — Skills" mobile={mobile}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: mobile ? "32px 24px" : 40,
          }}
        >
          {skills.map(({ category, items }) => (
            <div key={category}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  margin: "0 0 14px",
                }}
              >
                {category}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {items.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      color: "var(--color-fg)",
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "var(--color-accent)",
                        flexShrink: 0,
                        opacity: 0.6,
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionGrid>
    </section>
  )
}

function SectionGrid({
  label,
  children,
  mobile,
}: {
  label: string
  children: React.ReactNode
  mobile: boolean
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "200px 1fr",
        gap: mobile ? 24 : 64,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          margin: 0,
        }}
      >
        {label}
      </p>
      <div>{children}</div>
    </div>
  )
}
