export default function StatusText({ message, isError }) {
  if (!message) return null;
  return <p className={isError ? 'status status-error' : 'status status-ok'}>{message}</p>;
}
