import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import StatusText from '../components/StatusText';
import { useSubmit } from '../../../hooks/useSubmit';
import { pillar1Api } from '../../../services/pillar1Api';

const initialState = {
  department: '',
  workshopTitle: '',
  date: '',
  guestName: '',
  guestDesignation: '',
  academicYear: '1st year',
};

export default function GuestLectureForm({ month }) {
  const [form, setForm] = useState(initialState);
  const [image, setImage] = useState(null);
  const { isSubmitting, message, isError, wrapSubmit } = useSubmit();

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    wrapSubmit(async () => {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append('month', month);
      if (image) formData.append('image', image);
      await pillar1Api.createGuestLecture(formData);
      setForm(initialState);
      setImage(null);
      event.target.reset();
    });
  };

  return (
    <form className="grid-form" onSubmit={onSubmit}>
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
      <Input label="Workshop / Lecture Title" name="workshopTitle" value={form.workshopTitle} onChange={onChange} required />
      <Input label="Date" name="date" type="date" value={form.date} onChange={onChange} required />
      <Input label="Guest Name" name="guestName" value={form.guestName} onChange={onChange} required />
      <Input label="Guest Designation" name="guestDesignation" value={form.guestDesignation} onChange={onChange} />
      <label className="field">
        <span>Image (optional)</span>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      </label>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Guest Lecture'}</Button>
      <StatusText message={message} isError={isError} />
    </form>
  );
}
