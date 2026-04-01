import { useMemo, useState } from 'react';
import Button from '../ui/Button';
import { pillar1Api } from '../../services/pillar1Api';
import { downloadBlob } from '../../utils/downloadFile';

function toHtml(markdownText = '') {
  return String(markdownText)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^###\s+(.*)$/gim, '<h3>$1</h3>')
    .replace(/^##\s+(.*)$/gim, '<h2>$1</h2>')
    .replace(/^#\s+(.*)$/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

export default function MonthlySummaryPanel({ month }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [source, setSource] = useState('');
  const [summaryMarkdown, setSummaryMarkdown] = useState('');
  const [downloading, setDownloading] = useState(false);

  const summaryHtml = useMemo(() => toHtml(summaryMarkdown), [summaryMarkdown]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError('');
      setWarning('');
      const response = await pillar1Api.getMonthlySummary(month);
      const payload = response.data || {};
      setSummaryMarkdown(payload.summaryMarkdown || 'No summary generated.');
      setSource(payload.source || 'unknown');
      if (payload.warning) {
        setWarning(payload.warning);
      }
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Failed to generate summary report.';
      if (String(message).toLowerCase().includes('timeout')) {
        setError('Summary generation timed out. The AI model is under high demand. Please retry in a few seconds.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSummary = async () => {
    try {
      setDownloading(true);
      setError('');
      const response = await pillar1Api.downloadMonthlySummary(month);
      const defaultName = `Monthly_Institutional_Summary_${String(month || 'All_Months').replace(/\s+/g, '_')}.docx`;
      const disposition = response.headers?.['content-disposition'] || '';
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const fileName = match?.[1] || defaultName;
      downloadBlob(response.data, fileName);
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Failed to download summary.';
      setError(message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="section-card" style={{ marginTop: '1rem' }}>
      <div className="section-card-head" style={{ marginBottom: '1rem' }}>
        <h2>Monthly Narrative Summary</h2>
        <p>
          Generate a proper text report for {month} by reading all available data across Pillar 1 to Pillar 5.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <Button className="btn-primary" type="button" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : `Generate Summary for ${month}`}
        </Button>
        {source ? <span className="status">Source: {source}</span> : null}
      </div>

      {warning ? <p className="status" style={{ color: '#b45309' }}>Warning: {warning}</p> : null}
      {error ? <p className="status status-error">{error}</p> : null}

      {summaryMarkdown ? (
        <>
          <article
            style={{
              background: '#fff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1rem',
              lineHeight: 1.65,
            }}
            dangerouslySetInnerHTML={{ __html: summaryHtml }}
          />
          <div style={{ marginTop: '0.9rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button className="btn-primary" type="button" onClick={handleDownloadSummary} disabled={downloading}>
              {downloading ? 'Preparing DOCX...' : 'Download Summary DOCX'}
            </Button>
          </div>
        </>
      ) : (
        <p className="status">No summary generated yet.</p>
      )}
    </section>
  );
}
