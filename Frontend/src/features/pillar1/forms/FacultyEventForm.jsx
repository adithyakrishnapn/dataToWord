import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import StatusText from '../components/StatusText';
import { useSubmit } from '../../../hooks/useSubmit';
import { pillar1Api } from '../../../services/pillar1Api';

const initialState = {
  serialNo: '',
  facultyName: '',
  department: '',
  eventType: 'Workshop',
  eventTitle: '',
  onlineOffline: 'Online',
  organizerDetails: '',
  placeOfEvent: '',
  date: '',
};

export default function FacultyEventForm() {
  const [form, setForm] = useState(initialState);
  const [certificate, setCertificate] = useState(null);
  const { isSubmitting, message, isError, wrapSubmit } = useSubmit();

  const onSubmit = (event) => {
    event.preventDefault();
    wrapSubmit(async () => {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
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
      <Input label="S.No" name="serialNo" type="number" value={form.serialNo} onChange={onChange} required />
      <Input label="Faculty Name" name="facultyName" value={form.facultyName} onChange={onChange} required />
      <Input label="Department" name="department" value={form.department} onChange={onChange} required />
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
