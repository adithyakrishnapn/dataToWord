export default function Button({ children, type = 'button', disabled = false, onClick, className = '' }) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`btn ${className}`}>
      {children}
    </button>
  );
}
