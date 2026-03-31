import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import StatusText from '../components/StatusText';
import { useSubmit } from '../../../hooks/useSubmit';
import { pillar1Api } from '../../../services/pillar1Api';

const initialState = {
  facultyName: '',
  department: '',
  eventType: 'Workshop',
  eventTitle: '',
  onlineOffline: 'Online',
  organizerDetails: '',
  placeOfEvent: '',
  date: '',
  academicYear: '1st year',
};

export default function FacultyEventForm({ month }) {
  const [form, setForm] = useState(initialState);
  const [certificate, setCertificate] = useState(null);
  const { isSubmitting, message, isError, wrapSubmit } = useSubmit();

  const onSubmit = (event) => {
    event.preventDefault();
    wrapSubmit(async () => {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append('month', month);
      if (certificate) formData.append('certificate', certificate);
      await pillar1Api.createFacultyEvent(formData);
      setForm(initialState);
      setCertificate(null);
      event.target.reset();
    });
  };

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  return (
    <form className="grid-form" onSubmit={onSubmit}>
      <Input label="Faculty Name" name="facultyName" value={form.facultyName} onChange={onChange} required />
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
          <option>FDP</option>
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
      <label className="field">
        <span>Certificate / Image (optional)</span>
        <input type="file" accept="image/*" onChange={(e) => setCertificate(e.target.files?.[0] || null)} />
      </label>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Faculty Event'}</Button>
      <StatusText message={message} isError={isError} />
    </form>
  );
}
