import { useState } from 'react';
import Button from '../../../components/ui/Button';
import { pillar1Api } from '../../../services/pillar1Api';
import { downloadBlob } from '../../../utils/downloadFile';

export default function DownloadReportButton({ month }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await pillar1Api.downloadReport(month);
      const reportFileName = response.headers?.['x-report-filename'] || 'Annual_Report_Learning_Teaching.docx';
      downloadBlob(response.data, reportFileName);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to download report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="download-box">
      <h3>Generate Final Report</h3>
      <p>After entering section data, click download to generate a .docx annual report for {month}.</p>
      <Button className="btn-primary" onClick={handleDownload} disabled={loading}>
        {loading ? 'Generating...' : 'Download .docx Report'}
      </Button>
      {error ? <p className="status status-error">{error}</p> : null}
    </div>
  );
}
