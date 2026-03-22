export default function SectionHeader({ label, title, subtitle }:
  { label: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8 md:mb-10">
      <p className="label mb-3">{label}</p>
      <h2 className="mb-3" style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:"clamp(1.5rem,3.5vw,2.2rem)", color:"var(--text1)", letterSpacing:"-0.02em" }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ color:"var(--text2)", lineHeight:1.7, maxWidth:"520px", fontSize:"14px", fontFamily:"'DM Sans',sans-serif" }}>
          {subtitle}
        </p>
      )}
      <div className="hr mt-5"/>
    </div>
  );
}
