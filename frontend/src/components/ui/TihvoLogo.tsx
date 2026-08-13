

export const TihvoLogoText = ({ fontSize = 18, className = "" }: { fontSize?: number, className?: string }) => (
  <span
    className={className}
    style={{
      fontWeight: 900,
      fontSize: fontSize,
      letterSpacing: '-0.4px',
      lineHeight: 1,
    }}
  >
    <span style={{ color: '#0B5E9A' }}>T</span>
    <span style={{ color: '#0B5E9A' }}>i</span>
    <span style={{ color: '#4FC3CF' }}>h</span>
    <span style={{ color: '#D97A00' }}>v</span>
    <span style={{ color: '#D97A00' }}>o </span>
    <span style={{ color: '#7761f8' }}> M</span>
    <span style={{ color: '#7761f8' }}>E</span>
    <span style={{ color: '#7761f8' }}>E</span>
    <span style={{ color: '#7761f8' }}>T</span>
  </span>
);
