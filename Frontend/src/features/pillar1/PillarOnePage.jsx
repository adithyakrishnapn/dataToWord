import SectionCard from './components/SectionCard';
import DownloadReportButton from './components/DownloadReportButton';
import InnovativeTeachingForm from './forms/InnovativeTeachingForm';
import EContentsForm from './forms/EContentsForm';
import GuestLectureForm from './forms/GuestLectureForm';
import FdpOrganizedForm from './forms/FdpOrganizedForm';
import CourseFacilitatorForm from './forms/CourseFacilitatorForm';
import FacultyEventForm from './forms/FacultyEventForm';
import StudentEventForm from './forms/StudentEventForm';
import NptelMoocForm from './forms/NptelMoocForm';
import AcademicAchievementForm from './forms/AcademicAchievementForm';

export default function PillarOnePage() {
  return (
    <main className="page-wrap">
      <header className="hero-panel">
        <p className="eyebrow">DataToWord</p>
        <h1>Center for Learning & Teaching</h1>
        <p>
          Industrial workflow for pillar data entry and one-click annual report generation.
          All forms below map directly to your backend APIs.
        </p>
      </header>

      <DownloadReportButton />

      <SectionCard title="1. Innovative Teaching Methodologies" description="Best one per department.">
        <InnovativeTeachingForm />
      </SectionCard>

      <SectionCard title="2. E-Contents Developed" description="Faculty and students content records.">
        <EContentsForm />
      </SectionCard>

      <SectionCard title="3.1 Guest Lectures Organized" description="Workshops, seminars and guest lecture events.">
        <GuestLectureForm />
      </SectionCard>

      <SectionCard title="3.2 FDPs Organized" description="Sponsored FDP programs and beneficiary counts.">
        <FdpOrganizedForm />
      </SectionCard>

      <SectionCard title="3.3 Course Facilitator Sessions" description="Course facilitator sessions organized.">
        <CourseFacilitatorForm />
      </SectionCard>

      <SectionCard title="4. Events Attended by Faculty" description="Workshop, seminar, guest lecture, FDP, others.">
        <FacultyEventForm />
      </SectionCard>

      <SectionCard title="5. Events Attended by Students" description="Workshop, seminar, guest lecture, and facilitator sessions.">
        <StudentEventForm />
      </SectionCard>

      <SectionCard title="6. NPTEL & MOOC Courses" description="Faculty and students course completion records.">
        <NptelMoocForm />
      </SectionCard>

      <SectionCard title="7. Academic Achievements" description="Appeared, graduated and graduation percentage data.">
        <AcademicAchievementForm />
      </SectionCard>
    </main>
  );
}
