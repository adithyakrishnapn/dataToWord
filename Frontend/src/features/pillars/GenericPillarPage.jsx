import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useSubmit } from '../../hooks/useSubmit';
import DownloadReportButton from '../pillar1/components/DownloadReportButton';
import ReportHistoryPanel from '../pillar1/components/ReportHistoryPanel';
import SectionCard from '../pillar1/components/SectionCard';
import StatusText from '../pillar1/components/StatusText';
import ImportExportModal from '../../components/modals/ImportExportModal';
import MonthlySummaryPanel from '../../components/reports/MonthlySummaryPanel';
import { pillarConfig, months, academicYearOptions } from './pillarConfig';
import { pillarGenericApi } from '../../services/pillarGenericApi';
import { toAbsoluteApiUrl } from '../../config/apiConfig';

function buildInitialData(fields) {
  const initial = {};
  fields.forEach((field) => {
    initial[field.key] = '';
  });
  return initial;
}

function getAbsoluteMediaUrl(pathValue) {
  if (!pathValue) return '';
  return toAbsoluteApiUrl(pathValue);
}

export default function GenericPillarPage({ pillarId }) {
  const config = pillarConfig[pillarId];
  const [activeTab, setActiveTab] = useState('entry');
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedEditSection, setSelectedEditSection] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  if (!config) return null;

  return (
    <main className="page-wrap">
      <header className="hero-panel">
        <p className="eyebrow">DataToWord</p>
        <h1>{config.name}</h1>
        <p>
          Industrial workflow for pillar data entry and one-click annual report generation.
          All forms below map directly to your backend APIs.
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ marginRight: '1rem', fontWeight: '500' }}>
            Select Month:
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ marginLeft: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="hero-tabs" role="tablist" aria-label="Report sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'entry'}
            className={`hero-tab ${activeTab === 'entry' ? 'hero-tab-active' : ''}`}
            onClick={() => { setActiveTab('entry'); setSelectedEditSection(null); }}
          >
            Data Entry
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'edit'}
            className={`hero-tab ${activeTab === 'edit' ? 'hero-tab-active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            ✎ Edit Records
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'history'}
            className={`hero-tab ${activeTab === 'history' ? 'hero-tab-active' : ''}`}
            onClick={() => { setActiveTab('history'); setSelectedEditSection(null); }}
          >
            History
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'summary'}
            className={`hero-tab ${activeTab === 'summary' ? 'hero-tab-active' : ''}`}
            onClick={() => { setActiveTab('summary'); setSelectedEditSection(null); }}
          >
            Summary
          </button>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="hero-tab"
            onClick={() => setIsImportModalOpen(true)}
          >
            Import / Export Excel
          </button>
        </div>
      </header>

      <DownloadReportButton month={selectedMonth} />

      {activeTab === 'entry' ? (
        <>
          {config.sections.map((section) => (
            <SectionCard key={section.key} title={section.title} description={section.description}>
              <GenericSectionForm pillarId={pillarId} section={section} selectedMonth={selectedMonth} />
            </SectionCard>
          ))}
        </>
      ) : activeTab === 'edit' ? (
        <div style={{ padding: '20px' }}>
          <h2>Edit and Delete Records</h2>
          {selectedEditSection ? (
            <GenericRecordsList
              pillarId={pillarId}
              section={config.sections.find((s) => s.key === selectedEditSection)}
              selectedMonth={selectedMonth}
              onClose={() => setSelectedEditSection(null)}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {config.sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setSelectedEditSection(section.key)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {section.title}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'history' ? (
        <ReportHistoryPanel />
      ) : (
        <MonthlySummaryPanel month={selectedMonth} />
      )}

      <ImportExportModal
        isOpen={isImportModalOpen}
        selectedMonth={selectedMonth}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => setIsImportModalOpen(false)}
      />
    </main>
  );
}

function GenericSectionForm({ pillarId, section, selectedMonth }) {
  const [academicYear, setAcademicYear] = useState('1st year');
  const [formData, setFormData] = useState(() => buildInitialData(section.fields));
  const [image, setImage] = useState(null);
  const { isSubmitting, message, isError, wrapSubmit } = useSubmit();

  const department = useMemo(() => {
    return formData.department || formData.departmentName || formData.branch || formData.className || formData.classOrDepartment || '';
  }, [formData]);

  const onChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    wrapSubmit(async () => {
      if (section.hasImage) {
        const payload = new FormData();
        payload.append('sectionKey', section.key);
        payload.append('sectionTitle', section.title);
        payload.append('department', department);
        payload.append('month', selectedMonth);
        payload.append('academicYear', academicYear);
        payload.append('data', JSON.stringify(formData));
        if (image) payload.append('image', image);
        await pillarGenericApi.createRecord(pillarId, payload);
      } else {
        await pillarGenericApi.createRecord(pillarId, {
          sectionKey: section.key,
          sectionTitle: section.title,
          department,
          month: selectedMonth,
          academicYear,
          data: formData,
        });
      }
      setFormData(buildInitialData(section.fields));
      setImage(null);
      event.target.reset();
    });
  };

  return (
    <form className="grid-form" onSubmit={onSubmit}>
      <label className="field">
        <span>Academic Year</span>
        <select name="academicYear" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} required>
          {academicYearOptions.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </label>

      {section.fields.map((field) => (
        field.type === 'textarea' ? (
          <label key={field.key} className="field" style={{ gridColumn: '1 / -1' }}>
            <span>{field.label}</span>
            <textarea
              name={field.key}
              rows={3}
              value={formData[field.key]}
              onChange={onChange}
              required
            />
          </label>
        ) : (
          <Input
            key={field.key}
            label={field.label}
            name={field.key}
            type={field.type || 'text'}
            value={formData[field.key]}
            onChange={onChange}
            required
          />
        )
      ))}

      {section.hasImage ? (
        <label className="field">
          <span>Image (optional)</span>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        </label>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Record'}</Button>
      <StatusText message={message} isError={isError} />
    </form>
  );
}

function GenericRecordsList({ pillarId, section, selectedMonth, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState(false);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const { data } = await pillarGenericApi.listRecordsBySection(pillarId, section.key, selectedMonth);
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      setActionError(true);
      setActionMessage(error?.response?.data?.error || error.message || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (section) {
      loadRecords();
    }
  }, [pillarId, section?.key, selectedMonth]);

  const handleEdit = (record) => {
    setEditingId(record._id);
    setEditData({
      month: record.month,
      academicYear: record.academicYear,
      department: record.department,
      data: { ...record.data },
      imagePath: record.imagePath || null,
    });
    setEditImage(null);
    setActionMessage('');
    setActionError(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await pillarGenericApi.deleteRecord(pillarId, id);
      setRecords(records.filter((row) => row._id !== id));
      setActionError(false);
      setActionMessage('Deleted successfully.');
    } catch (error) {
      setActionError(true);
      setActionMessage(error?.response?.data?.error || error.message || 'Failed to delete record.');
    }
  };

  const handleSaveEdit = async () => {
    try {
      let response;
      if (section.hasImage) {
        const payload = new FormData();
        payload.append('month', editData.month);
        payload.append('academicYear', editData.academicYear);
        payload.append('department', editData.department || '');
        payload.append('data', JSON.stringify(editData.data || {}));
        if (editImage) payload.append('image', editImage);
        response = await pillarGenericApi.updateRecord(pillarId, editingId, payload);
      } else {
        response = await pillarGenericApi.updateRecord(pillarId, editingId, editData);
      }

      const { data } = response;
      setRecords(records.map((row) => (row._id === editingId ? data.data : row)));
      setEditingId(null);
      setEditData(null);
      setEditImage(null);
      setActionError(false);
      setActionMessage('Updated successfully.');
    } catch (error) {
      setActionError(true);
      setActionMessage(error?.response?.data?.error || error.message || 'Failed to update record.');
    }
  };

  if (!section) return null;
  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{section.title} Records ({records.length})</h3>
        <button onClick={onClose} style={{ padding: '8px 16px', cursor: 'pointer' }}>Close</button>
      </div>

      <StatusText message={actionMessage} isError={actionError} />

      {records.length === 0 ? (
        <p style={{ color: '#666' }}>No records found</p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {records.map((record) => (
            <div
              key={record._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '12px',
                backgroundColor: editingId === record._id ? '#f9f9f9' : '#fff'
              }}
            >
              {editingId === record._id && editData ? (
                <div className="grid-form">
                  <label className="field">
                    <span>Month</span>
                    <select value={editData.month} onChange={(e) => setEditData((prev) => ({ ...prev, month: e.target.value }))}>
                      {months.map((month) => <option key={month} value={month}>{month}</option>)}
                    </select>
                  </label>

                  <label className="field">
                    <span>Academic Year</span>
                    <select value={editData.academicYear} onChange={(e) => setEditData((prev) => ({ ...prev, academicYear: e.target.value }))}>
                      {academicYearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </label>

                  {section.fields.map((field) => (
                    field.type === 'textarea' ? (
                      <label key={field.key} className="field" style={{ gridColumn: '1 / -1' }}>
                        <span>{field.label}</span>
                        <textarea
                          rows={3}
                          value={editData.data[field.key] || ''}
                          onChange={(e) => setEditData((prev) => ({
                            ...prev,
                            data: { ...prev.data, [field.key]: e.target.value },
                            department: field.key === 'department' || field.key === 'departmentName' || field.key === 'branch' ? e.target.value : prev.department,
                          }))}
                        />
                      </label>
                    ) : (
                      <Input
                        key={field.key}
                        label={field.label}
                        name={field.key}
                        type={field.type || 'text'}
                        value={editData.data[field.key] || ''}
                        onChange={(e) => setEditData((prev) => ({
                          ...prev,
                          data: { ...prev.data, [field.key]: e.target.value },
                          department: field.key === 'department' || field.key === 'departmentName' || field.key === 'branch' ? e.target.value : prev.department,
                        }))}
                      />
                    )
                  ))}

                  {section.hasImage ? (
                    <label className="field">
                      <span>Current Image URL</span>
                      <input value={editData.imagePath ? getAbsoluteMediaUrl(editData.imagePath) : ''} readOnly placeholder="No image uploaded" />
                    </label>
                  ) : null}

                  {section.hasImage ? (
                    <label className="field">
                      <span>Replace Image (optional)</span>
                      <input type="file" accept="image/*" onChange={(e) => setEditImage(e.target.files?.[0] || null)} />
                    </label>
                  ) : null}

                  <Button type="button" className="btn-primary" onClick={handleSaveEdit}>Save</Button>
                  <Button type="button" onClick={() => { setEditingId(null); setEditData(null); }}>Cancel</Button>
                </div>
              ) : (
                <>
                  <p style={{ margin: 0, fontWeight: '500' }}>{record.sectionTitle}</p>
                  <p style={{ margin: '4px 0', color: '#666' }}>{record.department || 'No Department'} | {record.month} | {record.academicYear}</p>
                  <div style={{ margin: '0 0 8px 0', fontSize: '13px' }}>
                    {section.fields.slice(0, 4).map((field) => (
                      <p key={field.key} style={{ margin: '2px 0' }}>
                        <strong>{field.label}:</strong> {record?.data?.[field.key] || '-'}
                      </p>
                    ))}
                    {record.imagePath ? (
                      <p style={{ margin: '4px 0 0' }}>
                        <strong>Image URL:</strong>{' '}
                        <a href={getAbsoluteMediaUrl(record.imagePath)} target="_blank" rel="noreferrer">
                          {getAbsoluteMediaUrl(record.imagePath)}
                        </a>
                      </p>
                    ) : null}
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(record)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(record._id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
