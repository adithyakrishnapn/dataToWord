import { useState } from 'react';
import SectionCard from './components/SectionCard';
import DownloadReportButton from './components/DownloadReportButton';
import ReportHistoryPanel from './components/ReportHistoryPanel';
import RecordsList from './components/RecordsList';
import InnovativeTeachingForm from './forms/InnovativeTeachingForm';
import EContentsForm from './forms/EContentsForm';
import GuestLectureForm from './forms/GuestLectureForm';
import FdpOrganizedForm from './forms/FdpOrganizedForm';
import CourseFacilitatorForm from './forms/CourseFacilitatorForm';
import FacultyEventForm from './forms/FacultyEventForm';
import StudentEventForm from './forms/StudentEventForm';
import NptelMoocForm from './forms/NptelMoocForm';
import AcademicAchievementForm from './forms/AcademicAchievementForm';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const editSections = [
  { id: 'innovative', name: '1. Innovative Teaching' },
  { id: 'econtents', name: '2. E-Contents' },
  { id: 'guest', name: '3.1 Guest Lectures' },
  { id: 'fdp', name: '3.2 FDPs Organized' },
  { id: 'facilitator', name: '3.3 Course Facilitator' },
  { id: 'faculty', name: '4. Faculty Events' },
  { id: 'student', name: '5. Student Events' },
  { id: 'nptel', name: '6. NPTEL/MOOC' },
  { id: 'achievement', name: '7. Academic Achievement' }
];

export default function PillarOnePage() {
  const [activeTab, setActiveTab] = useState('entry');
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedEditSection, setSelectedEditSection] = useState(null);

  return (
    <main className="page-wrap">
      <header className="hero-panel">
        <p className="eyebrow">DataToWord</p>
        <h1>Center for Learning & Teaching</h1>
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
        </div>
      </header>

      {activeTab === 'entry' ? (
        <>
          <DownloadReportButton />

          <SectionCard title="1. Innovative Teaching Methodologies" description="Best one per department.">
            <InnovativeTeachingForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="2. E-Contents Developed" description="Faculty and students content records.">
            <EContentsForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="3.1 Guest Lectures Organized" description="Workshops, seminars and guest lecture events.">
            <GuestLectureForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="3.2 FDPs Organized" description="Sponsored FDP programs and beneficiary counts.">
            <FdpOrganizedForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="3.3 Course Facilitator Sessions" description="Course facilitator sessions organized.">
            <CourseFacilitatorForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="4. Events Attended by Faculty" description="Workshop, seminar, guest lecture, FDP, others.">
            <FacultyEventForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="5. Events Attended by Students" description="Workshop, seminar, guest lecture, and facilitator sessions.">
            <StudentEventForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="6. NPTEL & MOOC Courses" description="Faculty and students course completion records.">
            <NptelMoocForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="7. Academic Achievements" description="Appeared, graduated and graduation percentage data.">
            <AcademicAchievementForm month={selectedMonth} />
          </SectionCard>
        </>
      ) : activeTab === 'edit' ? (
        <div style={{ padding: '20px' }}>
          <h2>Edit and Delete Records</h2>
          {selectedEditSection ? (
            <RecordsList 
              section={selectedEditSection} 
              onClose={() => setSelectedEditSection(null)}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {editSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setSelectedEditSection(sec.id)}
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
                  {sec.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <ReportHistoryPanel />
      )}
    </main>
  );
}
