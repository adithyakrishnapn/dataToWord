import { useState } from 'react';
import SectionCard from './components/SectionCard';
import DownloadReportButton from './components/DownloadReportButton';
import ReportHistoryPanel from './components/ReportHistoryPanel';
import RecordsList from './components/RecordsList';
import SectionExcelImportButton from '../../components/forms/SectionExcelImportButton';
import ImportExportModal from '../../components/modals/ImportExportModal';
import MonthlySummaryPanel from '../../components/reports/MonthlySummaryPanel';
import sectionImportService from '../../services/excel/sectionImportService';
import InnovativeTeachingForm from './forms/InnovativeTeachingForm';
import EContentsForm from './forms/EContentsForm';
import GuestLectureForm from './forms/GuestLectureForm';
import FdpOrganizedForm from './forms/FdpOrganizedForm';
import CourseFacilitatorForm from './forms/CourseFacilitatorForm';
import FacultyEventForm from './forms/FacultyEventForm';
import StudentEventForm from './forms/StudentEventForm';
import NptelMoocForm from './forms/NptelMoocForm';
import AcademicAchievementForm from './forms/AcademicAchievementForm';
import { pillar1Api } from '../../services/pillar1Api';

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

function rowHasValues(row) {
  return Object.values(row || {}).some((value) => String(value ?? '').trim() !== '');
}

function valueFromLookup(lookup, aliases) {
  return String(sectionImportService.pickByAliases(lookup, aliases) || '').trim();
}

async function importPillar1SectionRows(sectionId, file, selectedMonth, sectionName) {
  const rows = await sectionImportService.readFirstSheetRows(file);
  let inserted = 0;
  let failed = 0;

  for (const row of rows) {
    if (!rowHasValues(row)) {
      continue;
    }

    const lookup = sectionImportService.createRowLookup(row);

    try {
      if (sectionId === 'innovative') {
        const payload = new FormData();
        payload.append('department', valueFromLookup(lookup, ['Department']));
        payload.append('courseCode', valueFromLookup(lookup, ['Course Code']));
        payload.append('courseName', valueFromLookup(lookup, ['Course Name']));
        payload.append('topic', valueFromLookup(lookup, ['Topic']));
        payload.append('teachingMethod', valueFromLookup(lookup, ['Teaching Method']));
        payload.append('month', valueFromLookup(lookup, ['Month']) || selectedMonth);
        payload.append('academicYear', valueFromLookup(lookup, ['Academic Year']) || '1st year');
        const imagePath = valueFromLookup(lookup, ['Image Filename', 'Image Path', 'Image URL']);
        if (imagePath) {
          payload.append('imagePath', sectionImportService.normalizeAssetPath(imagePath));
        }
        await pillar1Api.createInnovativeTeaching(payload);
      } else if (sectionId === 'econtents') {
        const youtubeLinks = sectionImportService.splitCsv(valueFromLookup(lookup, [
          'YouTube Video Links (comma-separated)',
          'YouTube Links (comma separated)',
        ]));
        const otherTitles = sectionImportService.splitCsv(valueFromLookup(lookup, [
          'Other E-Contents Title',
          'Other E-Contents titles (comma separated)',
        ]));
        const payload = {
          branch: valueFromLookup(lookup, ['Branch']),
          youtubeVideoCount: sectionImportService.toNumber(valueFromLookup(lookup, ['YouTube Video Count'])) || 0,
          youtubeVideoLinks: youtubeLinks,
          otherEContents: otherTitles.map((title) => ({ title, link: '', type: 'other' })),
          month: valueFromLookup(lookup, ['Month']) || selectedMonth,
          academicYear: valueFromLookup(lookup, ['Academic Year']) || '1st year',
        };
        await pillar1Api.createEContents(payload);
      } else if (sectionId === 'guest') {
        const payload = new FormData();
        payload.append('department', valueFromLookup(lookup, ['Department']));
        payload.append('workshopTitle', valueFromLookup(lookup, ['Workshop Title', 'Workshop / Lecture Title']));
        payload.append('date', valueFromLookup(lookup, ['Date (YYYY-MM-DD)', 'Date']));
        payload.append('guestName', valueFromLookup(lookup, ['Guest Name']));
        payload.append('guestDesignation', valueFromLookup(lookup, ['Guest Designation']));
        payload.append('month', valueFromLookup(lookup, ['Month']) || selectedMonth);
        payload.append('academicYear', valueFromLookup(lookup, ['Academic Year']) || '1st year');
        const imagePath = valueFromLookup(lookup, ['Image Filename', 'Image Path', 'Image URL']);
        if (imagePath) {
          payload.append('imagePath', sectionImportService.normalizeAssetPath(imagePath));
        }
        await pillar1Api.createGuestLecture(payload);
      } else if (sectionId === 'fdp') {
        const payload = new FormData();
        payload.append('department', valueFromLookup(lookup, ['Department']));
        payload.append('fdpTitle', valueFromLookup(lookup, ['FDP Title']));
        payload.append('date', valueFromLookup(lookup, ['Date (YYYY-MM-DD)', 'Date']));
        payload.append('sponsoredAgency', valueFromLookup(lookup, ['Sponsored Agency']));
        payload.append('sponsoredAmount', valueFromLookup(lookup, ['Sponsored Amount']));
        payload.append('numberOfBeneficiaries', String(sectionImportService.toNumber(valueFromLookup(lookup, ['Number of Beneficiaries'])) || 0));
        payload.append('month', valueFromLookup(lookup, ['Month']) || selectedMonth);
        payload.append('academicYear', valueFromLookup(lookup, ['Academic Year']) || '1st year');
        const imagePath = valueFromLookup(lookup, ['Image Filename', 'Image Path', 'Image URL']);
        if (imagePath) {
          payload.append('imagePath', sectionImportService.normalizeAssetPath(imagePath));
        }
        await pillar1Api.createFdpOrganized(payload);
      } else if (sectionId === 'facilitator') {
        const payload = new FormData();
        payload.append('department', valueFromLookup(lookup, ['Department']));
        payload.append('courseName', valueFromLookup(lookup, ['Course Name']));
        payload.append('date', valueFromLookup(lookup, ['Date (YYYY-MM-DD)', 'Date']));
        payload.append('facilitatorName', valueFromLookup(lookup, ['Facilitator Name']));
        payload.append('facilitatorDesignation', valueFromLookup(lookup, ['Facilitator Designation']));
        payload.append('facilitatorInstitution', valueFromLookup(lookup, ['Facilitator Institution', 'Institution']));
        payload.append('numberOfStudents', String(sectionImportService.toNumber(valueFromLookup(lookup, ['Number of Students', 'No. of Students'])) || 0));
        payload.append('month', valueFromLookup(lookup, ['Month']) || selectedMonth);
        payload.append('academicYear', valueFromLookup(lookup, ['Academic Year']) || '1st year');
        const imagePath = valueFromLookup(lookup, ['Image Filename', 'Image Path', 'Image URL']);
        if (imagePath) {
          payload.append('imagePath', sectionImportService.normalizeAssetPath(imagePath));
        }
        await pillar1Api.createCourseFacilitatorSession(payload);
      } else if (sectionId === 'faculty') {
        const payload = new FormData();
        payload.append('facultyName', valueFromLookup(lookup, ['Faculty Name']));
        payload.append('department', valueFromLookup(lookup, ['Department']));
        payload.append('eventType', valueFromLookup(lookup, ['Event Type']) || 'Workshop');
        payload.append('eventTitle', valueFromLookup(lookup, ['Event Title']));
        payload.append('onlineOffline', valueFromLookup(lookup, ['Online/Offline', 'Online / Offline']) || 'Online');
        payload.append('organizerDetails', valueFromLookup(lookup, ['Organizer Details']));
        payload.append('placeOfEvent', valueFromLookup(lookup, ['Place of Event', 'Place']));
        payload.append('date', valueFromLookup(lookup, ['Date (YYYY-MM-DD)', 'Date']));
        payload.append('month', valueFromLookup(lookup, ['Month']) || selectedMonth);
        payload.append('academicYear', valueFromLookup(lookup, ['Academic Year']) || '1st year');
        const certificatePath = valueFromLookup(lookup, ['Certificate Filename', 'Certificate Path', 'Certificate URL']);
        if (certificatePath) {
          payload.append('certificatePath', sectionImportService.normalizeAssetPath(certificatePath));
        }
        await pillar1Api.createFacultyEvent(payload);
      } else if (sectionId === 'student') {
        const payload = {
          studentNames: sectionImportService.splitCsv(valueFromLookup(lookup, ['Student Names (comma-separated)', 'Student Names (comma separated)'])),
          department: valueFromLookup(lookup, ['Department']),
          eventType: valueFromLookup(lookup, ['Event Type']) || 'Workshop',
          eventTitle: valueFromLookup(lookup, ['Event Title']),
          onlineOffline: valueFromLookup(lookup, ['Online/Offline', 'Online / Offline']) || 'Online',
          organizerDetails: valueFromLookup(lookup, ['Organizer Details']),
          placeOfEvent: valueFromLookup(lookup, ['Place of Event', 'Place']),
          date: valueFromLookup(lookup, ['Date (YYYY-MM-DD)', 'Date']),
          numberOfStudentsAttended: sectionImportService.toNumber(valueFromLookup(lookup, ['Number of Students', 'No. of Students Attended'])) || 0,
          month: valueFromLookup(lookup, ['Month']) || selectedMonth,
          academicYear: valueFromLookup(lookup, ['Academic Year']) || '1st year',
        };
        await pillar1Api.createStudentEvent(payload);
      } else if (sectionId === 'nptel') {
        const payload = new FormData();
        payload.append('category', valueFromLookup(lookup, ['Category (Faculty/Student)', 'Category']) || 'Faculty');
        payload.append('nameOfPerson', valueFromLookup(lookup, ['Name of Person', 'Name']));
        payload.append('classOrDepartment', valueFromLookup(lookup, ['Department/Class', 'Class / Department']));
        payload.append('platform', valueFromLookup(lookup, ['Platform']));
        payload.append('courseName', valueFromLookup(lookup, ['Course Name']));
        payload.append('duration', valueFromLookup(lookup, ['Duration']));
        payload.append('scoreOrCompletionDate', valueFromLookup(lookup, ['Score/Completion Date', 'Score / Completed On']));
        payload.append('month', valueFromLookup(lookup, ['Month']) || selectedMonth);
        payload.append('academicYear', valueFromLookup(lookup, ['Academic Year']) || '1st year');
        const certificatePath = valueFromLookup(lookup, ['Certificate Filename', 'Certificate Path', 'Certificate URL']);
        if (certificatePath) {
          payload.append('certificatePath', sectionImportService.normalizeAssetPath(certificatePath));
        }
        await pillar1Api.createNptelMooc(payload);
      } else if (sectionId === 'achievement') {
        const payload = {
          branch: valueFromLookup(lookup, ['Branch']),
          semesterYear: valueFromLookup(lookup, ['Semester/Year', 'Semester / Year']),
          appeared: sectionImportService.toNumber(valueFromLookup(lookup, ['Appeared'])) || 0,
          graduated: sectionImportService.toNumber(valueFromLookup(lookup, ['Graduated'])) || 0,
          month: valueFromLookup(lookup, ['Month']) || selectedMonth,
        };
        await pillar1Api.createAcademicAchievement(payload);
      }

      inserted += 1;
    } catch {
      failed += 1;
    }
  }

  return {
    inserted,
    failed,
    message: `Imported ${inserted} records for ${sectionName}${failed ? ` (${failed} failed)` : ''}.`,
  };
}

export default function PillarOnePage() {
  const [activeTab, setActiveTab] = useState('entry');
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedEditSection, setSelectedEditSection] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const sectionImportHandler = (sectionId, sectionName) => async (file) =>
    importPillar1SectionRows(sectionId, file, selectedMonth, sectionName);

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

      {activeTab === 'entry' ? (
        <>
          <DownloadReportButton month={selectedMonth} />

          <SectionCard title="1. Innovative Teaching Methodologies" description="Best one per department.">
            <SectionExcelImportButton sectionTitle="1. Innovative Teaching Methodologies" onImport={sectionImportHandler('innovative', '1. Innovative Teaching Methodologies')} />
            <InnovativeTeachingForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="2. E-Contents Developed" description="Faculty and students content records.">
            <SectionExcelImportButton sectionTitle="2. E-Contents Developed" onImport={sectionImportHandler('econtents', '2. E-Contents Developed')} />
            <EContentsForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="3.1 Guest Lectures Organized" description="Workshops, seminars and guest lecture events.">
            <SectionExcelImportButton sectionTitle="3.1 Guest Lectures Organized" onImport={sectionImportHandler('guest', '3.1 Guest Lectures Organized')} />
            <GuestLectureForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="3.2 FDPs Organized" description="Sponsored FDP programs and beneficiary counts.">
            <SectionExcelImportButton sectionTitle="3.2 FDPs Organized" onImport={sectionImportHandler('fdp', '3.2 FDPs Organized')} />
            <FdpOrganizedForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="3.3 Course Facilitator Sessions" description="Course facilitator sessions organized.">
            <SectionExcelImportButton sectionTitle="3.3 Course Facilitator Sessions" onImport={sectionImportHandler('facilitator', '3.3 Course Facilitator Sessions')} />
            <CourseFacilitatorForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="4. Events Attended by Faculty" description="Workshop, seminar, guest lecture, FDP, others.">
            <SectionExcelImportButton sectionTitle="4. Events Attended by Faculty" onImport={sectionImportHandler('faculty', '4. Events Attended by Faculty')} />
            <FacultyEventForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="5. Events Attended by Students" description="Workshop, seminar, guest lecture, and facilitator sessions.">
            <SectionExcelImportButton sectionTitle="5. Events Attended by Students" onImport={sectionImportHandler('student', '5. Events Attended by Students')} />
            <StudentEventForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="6. NPTEL & MOOC Courses" description="Faculty and students course completion records.">
            <SectionExcelImportButton sectionTitle="6. NPTEL & MOOC Courses" onImport={sectionImportHandler('nptel', '6. NPTEL & MOOC Courses')} />
            <NptelMoocForm month={selectedMonth} />
          </SectionCard>

          <SectionCard title="7. Academic Achievements" description="Appeared, graduated and graduation percentage data.">
            <SectionExcelImportButton sectionTitle="7. Academic Achievements" onImport={sectionImportHandler('achievement', '7. Academic Achievements')} />
            <AcademicAchievementForm month={selectedMonth} />
          </SectionCard>
        </>
      ) : activeTab === 'edit' ? (
        <div style={{ padding: '20px' }}>
          <h2>Edit and Delete Records</h2>
          {selectedEditSection ? (
            <RecordsList 
              section={selectedEditSection} 
              selectedMonth={selectedMonth}
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
