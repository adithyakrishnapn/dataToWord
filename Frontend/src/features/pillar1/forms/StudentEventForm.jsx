import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import StatusText from '../components/StatusText';
import { useSubmit } from '../../../hooks/useSubmit';
import { pillar1Api } from '../../../services/pillar1Api';

const initialState = {
  studentNames: '',
  department: '',
  eventType: 'Workshop',
  eventTitle: '',
  onlineOffline: 'Online',
  organizerDetails: '',
  placeOfEvent: '',
  date: '',
  numberOfStudentsAttended: '',
  academicYear: '1st year',
};

export default function StudentEventForm({ month }) {
  const [form, setForm] = useState(initialState);
  const { isSubmitting, message, isError, wrapSubmit } = useSubmit();

  const onSubmit = (event) => {
    event.preventDefault();
    wrapSubmit(async () => {
      const payload = {
        ...form,
        numberOfStudentsAttended: Number(form.numberOfStudentsAttended),
        studentNames: form.studentNames.split(',').map((name) => name.trim()).filter(Boolean),
        month: month,
      };
      await pillar1Api.createStudentEvent(payload);
      setForm(initialState);
    });
  };

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  return (
    <form className="grid-form" onSubmit={onSubmit}>
      <Input label="Student Names (comma separated)" name="studentNames" value={form.studentNames} onChange={onChange} required />
      <Input label="Department" name="department" value={form.department} onChange={onChange} required />
      <label className="field">
        <span>Academic Year</span>
        <select name="academicYear" value={form.academicYear} onChange={onChange} required>
          <option value="1st year">1st year</option>
          <option value="2nd year">2nd year</option>
          <option value="3rd year">3rd year</option>
          <option value="final year">Final year</option>
        </select>
      </label>
      <label className="field">
        <span>Event Type</span>
        <select name="eventType" value={form.eventType} onChange={onChange}>
          <option>Workshop</option>
          <option>Seminar</option>
          <option>Guest Lecture</option>
          <option>Course Facilitator Session</option>
          <option>Others</option>
        </select>
      </label>
      <Input label="Event Title" name="eventTitle" value={form.eventTitle} onChange={onChange} required />
      <label className="field">
        <span>Online / Offline</span>
        <select name="onlineOffline" value={form.onlineOffline} onChange={onChange}>
          <option>Online</option>
          <option>Offline</option>
        </select>
      </label>
      <Input label="Organizer Details" name="organizerDetails" value={form.organizerDetails} onChange={onChange} required />
      <Input label="Place" name="placeOfEvent" value={form.placeOfEvent} onChange={onChange} />
      <Input label="Date" name="date" type="date" value={form.date} onChange={onChange} required />
      <Input
        label="No. of Students Attended"
        name="numberOfStudentsAttended"
        type="number"
        value={form.numberOfStudentsAttended}
        onChange={onChange}
        required
      />
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Student Event'}</Button>
      <StatusText message={message} isError={isError} />
    </form>
  );
}
