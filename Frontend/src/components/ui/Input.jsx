export default function Input({ label, name, type = 'text', value, onChange, required = false, placeholder = '' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} />
    </label>
  );
}