import { useRef, useState } from 'react';

export default function SectionExcelImportButton({ sectionTitle, onImport }) {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(false);

  const triggerPicker = () => {
    if (fileRef.current) {
      fileRef.current.value = '';
      fileRef.current.click();
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      `Are you sure you want to import this file for ${sectionTitle}?\n\nFile: ${file.name}`
    );

    if (!confirmed) {
      if (fileRef.current) {
        fileRef.current.value = '';
      }
      return;
    }

    setLoading(true);
    setStatus('');
    setError(false);

    try {
      const result = await onImport(file);
      const inserted = result?.inserted ?? 0;
      const failed = result?.failed ?? 0;
      const suffix = failed > 0 ? ` (${failed} failed)` : '';
      setStatus(result?.message || `Imported ${inserted} records${suffix} for ${sectionTitle}.`);
    } catch (importError) {
      setError(true);
      setStatus(importError?.message || 'Section import failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="hero-tab"
        onClick={triggerPicker}
        disabled={loading}
        style={{
          backgroundColor: '#111111',
          color: '#ffffff',
          borderColor: '#111111',
        }}
      >
        {loading ? 'Importing Section...' : 'Import This Section from Excel'}
      </button>
      {status ? (
        <small style={{ color: error ? '#b00020' : '#1b5e20' }}>{status}</small>
      ) : null}
    </div>
  );
}
