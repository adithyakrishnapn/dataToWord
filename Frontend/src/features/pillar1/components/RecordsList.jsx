import { useState, useEffect } from 'react';
import { pillar1Api } from '../../../services/pillar1Api';
import {
  SECTION_1_FIELDS,
  SECTION_2_FIELDS,
  SECTION_3_1_FIELDS,
  SECTION_3_2_FIELDS,
  SECTION_3_3_FIELDS,
  SECTION_4_FIELDS,
  SECTION_5_FIELDS,
  SECTION_6_FIELDS,
  SECTION_7_FIELDS,
} from '../../../constants/formConstants';
import { toAbsoluteApiUrl } from '../../../config/apiConfig';

// API method mapping to pillar1Api service
const apiMethods = {
  innovative: (month) => pillar1Api.getInnovativeTeachingRecords(month),
  econtents: (month) => pillar1Api.getEContentsRecords(month),
  guest: (month) => pillar1Api.getGuestLectureRecords(month),
  fdp: (month) => pillar1Api.getFdpOrganizedRecords(month),
  facilitator: (month) => pillar1Api.getCourseFacilitatorRecords(month),
  faculty: (month) => pillar1Api.getFacultyEventRecords(month),
  student: (month) => pillar1Api.getStudentEventRecords(month),
  nptel: (month) => pillar1Api.getNptelMoocRecords(month),
  achievement: (month) => pillar1Api.getAcademicAchievementRecords(month),
};

// Delete method mapping
const deleteMethods = {
  innovative: (id) => pillar1Api.deleteInnovativeTeaching(id),
  econtents: (id) => pillar1Api.deleteEContents(id),
  guest: (id) => pillar1Api.deleteGuestLecture(id),
  fdp: (id) => pillar1Api.deleteFdpOrganized(id),
  facilitator: (id) => pillar1Api.deleteCourseFacilitatorSession(id),
  faculty: (id) => pillar1Api.deleteFacultyEvent(id),
  student: (id) => pillar1Api.deleteStudentEvent(id),
  nptel: (id) => pillar1Api.deleteNptelMooc(id),
  achievement: (id) => pillar1Api.deleteAcademicAchievement(id),
};

// Update method mapping
const updateMethods = {
  innovative: (id, data) => pillar1Api.updateInnovativeTeaching(id, data),
  econtents: (id, data) => pillar1Api.updateEContents(id, data),
  guest: (id, data) => pillar1Api.updateGuestLecture(id, data),
  fdp: (id, data) => pillar1Api.updateFdpOrganized(id, data),
  facilitator: (id, data) => pillar1Api.updateCourseFacilitatorSession(id, data),
  faculty: (id, data) => pillar1Api.updateFacultyEvent(id, data),
  student: (id, data) => pillar1Api.updateStudentEvent(id, data),
  nptel: (id, data) => pillar1Api.updateNptelMooc(id, data),
  achievement: (id, data) => pillar1Api.updateAcademicAchievement(id, data),
};

const sectionFieldMap = {
  innovative: SECTION_1_FIELDS,
  econtents: SECTION_2_FIELDS,
  guest: SECTION_3_1_FIELDS,
  fdp: SECTION_3_2_FIELDS,
  facilitator: SECTION_3_3_FIELDS,
  faculty: SECTION_4_FIELDS,
  student: SECTION_5_FIELDS,
  nptel: SECTION_6_FIELDS,
  achievement: SECTION_7_FIELDS,
};

const mediaConfigMap = {
  innovative: { pathKey: 'imagePath', uploadKey: 'image', label: 'Image URL' },
  guest: { pathKey: 'imagePath', uploadKey: 'image', label: 'Image URL' },
  fdp: { pathKey: 'imagePath', uploadKey: 'image', label: 'Image URL' },
  facilitator: { pathKey: 'imagePath', uploadKey: 'image', label: 'Image URL' },
  faculty: { pathKey: 'certificatePath', uploadKey: 'certificate', label: 'Certificate URL' },
  nptel: { pathKey: 'certificatePath', uploadKey: 'certificate', label: 'Certificate URL' },
};

const systemKeys = new Set(['_id', '__v', 'createdAt']);
const labelOverrides = {
  month: 'Month',
  academicYear: 'Academic Year',
  graduationPercentage: 'Graduation Percentage',
};

function humanizeKey(key = '') {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getLabel(section, key) {
  const fieldConfig = sectionFieldMap[section]?.[key];
  if (fieldConfig?.label) return fieldConfig.label;
  if (labelOverrides[key]) return labelOverrides[key];
  return humanizeKey(key);
}

function getMediaUrl(pathValue) {
  if (!pathValue) return '';
  return toAbsoluteApiUrl(pathValue);
}

export default function RecordsList({ section, selectedMonth, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMediaFile, setEditMediaFile] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const sections = {
    innovative: { name: 'Innovative Teaching', key: 'innovative-teaching' },
    econtents: { name: 'E-Contents', key: 'e-contents' },
    guest: { name: 'Guest Lectures', key: 'guest-lectures' },
    fdp: { name: 'FDPs Organized', key: 'fdps-organized' },
    facilitator: { name: 'Course Facilitator', key: 'course-facilitator-sessions' },
    faculty: { name: 'Faculty Events', key: 'faculty-events' },
    student: { name: 'Student Events', key: 'student-events' },
    nptel: { name: 'NPTEL/MOOC', key: 'nptel-mooc' },
    achievement: { name: 'Academic Achievement', key: 'academic-achievements' }
  };

  const config = sections[section];

  useEffect(() => {
    loadRecords();
  }, [section, selectedMonth]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const { data } = await apiMethods[section](selectedMonth);
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load records:', error);
      alert('Failed to load records: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    setEditForm({ ...record });
    setEditMediaFile(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      setDeleting(id);
      await deleteMethods[section](id);
      setRecords(records.filter(r => r._id !== id));
      alert('Record deleted successfully!');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete: ' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleUpdate = async () => {
    try {
      const mediaConfig = mediaConfigMap[section];
      let payload = editForm;

      if (mediaConfig) {
        const formData = new FormData();
        Object.entries(editForm)
          .filter(([key]) => !systemKeys.has(key) && key !== mediaConfig.pathKey)
          .forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (Array.isArray(value) || typeof value === 'object') {
              formData.append(key, JSON.stringify(value));
              return;
            }
            formData.append(key, String(value));
          });

        if (editMediaFile) {
          formData.append(mediaConfig.uploadKey, editMediaFile);
        }

        payload = formData;
      }

      const { data: updatedResponse } = await updateMethods[section](editingId, payload);
      const updatedRecord = updatedResponse?.data || updatedResponse;
      setRecords(records.map((r) => (r._id === editingId ? updatedRecord : r)));
      setEditingId(null);
      setEditMediaFile(null);
      alert('Record updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update: ' + error.message);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{config.name} Records - {selectedMonth} ({records.length})</h3>
        <button onClick={onClose} style={{ padding: '8px 16px', cursor: 'pointer' }}>Close</button>
      </div>

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
              {editingId === record._id ? (
                <EditForm
                  section={section}
                  record={editForm}
                  onChange={setEditForm}
                  onSave={handleUpdate}
                  mediaFile={editMediaFile}
                  onMediaFileChange={setEditMediaFile}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <RecordPreview record={record} section={section} />
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
                      disabled={deleting === record._id}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: deleting === record._id ? '#ccc' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: deleting === record._id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {deleting === record._id ? 'Deleting...' : '✕ Delete'}
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

function RecordPreview({ record, section }) {
  const previews = {
    innovative: () => `${record.department} - ${record.courseName} (${record.topic})`,
    econtents: () => `${record.branch} - ${record.youtubeVideoCount} videos`,
    guest: () => `${record.department} - ${record.workshopTitle}`,
    fdp: () => `${record.department} - ${record.fdpTitle}`,
    facilitator: () => `${record.department} - ${record.courseName}`,
    faculty: () => `${record.facultyName} - ${record.eventTitle}`,
    student: () => `${record.department} - ${record.eventTitle}`,
    nptel: () => `${record.classOrDepartment} - ${record.courseName}`,
    achievement: () => `${record.branch} - ${record.semesterYear}`
  };

  const mediaConfig = mediaConfigMap[section];
  const mediaValue = mediaConfig ? record[mediaConfig.pathKey] : '';
  const mediaUrl = getMediaUrl(mediaValue);

  return (
    <div>
      <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>{previews[section]?.()} </p>
      {mediaUrl ? (
        <p style={{ margin: 0, fontSize: '13px' }}>
          <strong>{mediaConfig.label}:</strong>{' '}
          <a href={mediaUrl} target="_blank" rel="noreferrer">{mediaUrl}</a>
        </p>
      ) : null}
    </div>
  );
}

function EditForm({ section, record, onChange, onSave, onCancel, mediaFile, onMediaFileChange }) {
  const mediaConfig = mediaConfigMap[section];
  const mediaPathValue = mediaConfig ? record?.[mediaConfig.pathKey] : '';
  const mediaUrl = getMediaUrl(mediaPathValue);

  return (
    <div>
      {mediaConfig ? (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>{mediaConfig.label}</label>
          <input
            type="text"
            value={mediaUrl || ''}
            readOnly
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '8px',
              backgroundColor: '#f8f9fa'
            }}
          />
          {mediaUrl ? (
            <a href={mediaUrl} target="_blank" rel="noreferrer" style={{ fontSize: '13px' }}>Open current file</a>
          ) : (
            <span style={{ fontSize: '13px', color: '#666' }}>No file available</span>
          )}
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Replace File (Optional)</label>
            <input
              type="file"
              accept={mediaConfig.uploadKey === 'image' ? 'image/*' : '.pdf,.jpg,.jpeg,.png,.webp'}
              onChange={(e) => onMediaFileChange(e.target.files?.[0] || null)}
            />
            {mediaFile ? (
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#555' }}>Selected: {mediaFile.name}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        {Object.entries(record)
          .filter(([key]) => !systemKeys.has(key) && key !== 'imagePath' && key !== 'certificatePath')
          .map(([key, value]) => (
            <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{getLabel(section, key)}</span>
              <input
                type={typeof value === 'number' ? 'number' : 'text'}
                value={Array.isArray(value) || typeof value === 'object'
                  ? JSON.stringify(value)
                  : (value ?? '')}
                onChange={(e) => onChange({ ...record, [key]: e.target.value })}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </label>
          ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onSave}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
