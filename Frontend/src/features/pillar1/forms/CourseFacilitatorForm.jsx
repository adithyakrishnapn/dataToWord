import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import StatusText from '../components/StatusText';
import { useSubmit } from '../../../hooks/useSubmit';
import { pillar1Api } from '../../../services/pillar1Api';

const initialState = {
  department: '',
  courseName: '',
  date: '',
  facilitatorName: '',
  facilitatorDesignation: '',
  facilitatorInstitution: '',
  numberOfStudents: '',
  academicYear: '1st year',
};

export default function CourseFacilitatorForm({ month }) {
  const [form, setForm] = useState(initialState);
  const [image, setImage] = useState(null);
  const { isSubmitting, message, isError, wrapSubmit } = useSubmit();

  const onSubmit = (event) => {
    event.preventDefault();
    wrapSubmit(async () => {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append('month', month);
      if (image) formData.append('image', image);
      await pillar1Api.createCourseFacilitatorSession(formData);
      setForm(initialState);
      setImage(null);
      event.target.reset();
    });
  };

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

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
      <Input label="Course Name" name="courseName" value={form.courseName} onChange={onChange} required />
      <Input label="Date" name="date" type="date" value={form.date} onChange={onChange} required />
      <Input label="Facilitator Name" name="facilitatorName" value={form.facilitatorName} onChange={onChange} required />
      <Input label="Facilitator Designation" name="facilitatorDesignation" value={form.facilitatorDesignation} onChange={onChange} />
      <Input label="Institution" name="facilitatorInstitution" value={form.facilitatorInstitution} onChange={onChange} />
      <Input label="No. of Students" name="numberOfStudents" type="number" value={form.numberOfStudents} onChange={onChange} />
      <label className="field">
        <span>Image (optional)</span>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      </label>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Course Facilitator Session'}</Button>
      <StatusText message={message} isError={isError} />
    </form>
  );
}
