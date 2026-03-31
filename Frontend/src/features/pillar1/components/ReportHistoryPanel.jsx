import { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import { pillar1Api } from '../../../services/pillar1Api';
import { downloadBlob } from '../../../utils/downloadFile';

function formatSize(bytes = 0) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** index);
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

export default function ReportHistoryPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await pillar1Api.listReportHistory();
      setReports(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load report history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDownload = async (fileName) => {
    try {
      setError('');
      const response = await pillar1Api.downloadReportByName(fileName);
      downloadBlob(response.data, fileName);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to download selected report.');
    }
  };

  const handleDownloadAll = async () => {
    try {
      setDownloadingAll(true);
      setError('');
      const response = await pillar1Api.downloadAllReports();
      downloadBlob(response.data, `Generated_Reports_${new Date().toISOString().slice(0, 10)}.zip`);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to download reports archive.');
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <section className="history-panel section-card">
      <div className="history-header">
        <h2>Generated Reports History</h2>
        <div className="history-actions">
          <Button type="button" onClick={loadHistory} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            className="btn-primary"
            type="button"
            onClick={handleDownloadAll}
            disabled={downloadingAll || reports.length === 0}
          >
            {downloadingAll ? 'Preparing ZIP...' : 'Download All (.zip)'}
          </Button>
        </div>
      </div>

      {error ? <p className="status status-error">{error}</p> : null}

      {reports.length === 0 && !loading ? (
        <p className="history-empty">No generated reports yet. Generate one report first.</p>
      ) : null}

      {reports.length > 0 ? (
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Created</th>
                <th>Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((item) => (
                <tr key={item.fileName}>
                  <td>{item.fileName}</td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>{formatSize(item.sizeBytes)}</td>
                  <td>
                    <Button type="button" onClick={() => handleDownload(item.fileName)}>
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
