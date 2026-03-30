export default function SectionCard({ title, description, children }) {
  return (
    <section className="section-card">
      <div className="section-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}
