export default function SectionGrid({
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
