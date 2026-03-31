import { useState, useEffect } from 'react';
import { pillar1Api } from '../../../services/pillar1Api';

// API method mapping to pillar1Api service
const apiMethods = {
  innovative: () => pillar1Api.getInnovativeTeachingRecords(),
  econtents: () => pillar1Api.getEContentsRecords(),
  guest: () => pillar1Api.getGuestLectureRecords(),
  fdp: () => pillar1Api.getFdpOrganizedRecords(),
  facilitator: () => pillar1Api.getCourseFacilitatorRecords(),
  faculty: () => pillar1Api.getFacultyEventRecords(),
  student: () => pillar1Api.getStudentEventRecords(),
  nptel: () => pillar1Api.getNptelMoocRecords(),
  achievement: () => pillar1Api.getAcademicAchievementRecords(),
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

export default function RecordsList({ section, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
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
  }, [section]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const { data } = await apiMethods[section]();
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
      const { data: updated } = await updateMethods[section](editingId, editForm);
      setRecords(records.map(r => r._id === editingId ? updated : r));
      setEditingId(null);
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
        <h3>{config.name} Records ({records.length})</h3>
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
                  record={editForm}
                  onChange={setEditForm}
                  onSave={handleUpdate}
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

  return <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>{previews[section]?.()} </p>;
}

function EditForm({ record, onChange, onSave, onCancel }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        {Object.entries(record)
          .filter(([key]) => !['_id', '__v', 'imagePath', 'certificatePath', 'createdAt'].includes(key))
          .map(([key, value]) => (
            <input
              key={key}
              type={typeof value === 'number' ? 'number' : 'text'}
              placeholder={key}
              value={Array.isArray(value) ? JSON.stringify(value) : value || ''}
              onChange={(e) => onChange({ ...record, [key]: e.target.value })}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
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
