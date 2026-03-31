import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import StatusText from '../components/StatusText';
import { useSubmit } from '../../../hooks/useSubmit';
import { pillar1Api } from '../../../services/pillar1Api';

const initialState = {
  department: '',
  courseCode: '',
  courseName: '',
  topic: '',
  teachingMethod: '',
  academicYear: '1st year',
};

export default function InnovativeTeachingForm({ month }) {
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
      await pillar1Api.createInnovativeTeaching(formData);
      setForm(initialState);
      setImage(null);
      event.target.reset();
    });
  };

  return (
    <form className="grid-form" onSubmit={onSubmit}>
      <Input label="Department" name="department" value={form.department} onChange={onChange} required />
      <Input label="Course Code" name="courseCode" value={form.courseCode} onChange={onChange} required />
      <Input label="Course Name" name="courseName" value={form.courseName} onChange={onChange} required />
      <Input label="Topic" name="topic" value={form.topic} onChange={onChange} required />
      <Input label="Teaching Method" name="teachingMethod" value={form.teachingMethod} onChange={onChange} required />
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
        <span>Image (optional)</span>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      </label>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Section 1'}</Button>
      <StatusText message={message} isError={isError} />
    </form>
  );
}
