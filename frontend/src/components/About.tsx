import SectionGrid from "./SectionGrid";

export default function About({ mobile }: { mobile: boolean }) {
  return (
    <section
      id="about"
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: mobile ? "64px 24px" : "96px 32px",
      }}
    >
      <SectionGrid label="01 — About" mobile={mobile}>
        <div>
          <p
            style={{
              fontWeight: 300,
              fontSize: mobile ? 15 : 17,
              lineHeight: 1.75,
              color: "var(--color-fg)",
              margin: "0 0 20px",
              maxWidth: 600,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
          <p
            style={{
              fontWeight: 300,
              fontSize: mobile ? 15 : 17,
              lineHeight: 1.75,
              color: "var(--color-muted)",
              margin: 0,
              maxWidth: 600,
            }}
          >
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
            dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </SectionGrid>
    </section>
  )
}

