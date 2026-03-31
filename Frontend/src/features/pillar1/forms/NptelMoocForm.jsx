import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import StatusText from '../components/StatusText';
import { useSubmit } from '../../../hooks/useSubmit';
import { pillar1Api } from '../../../services/pillar1Api';

const initialState = {
  category: 'Faculty',
  nameOfPerson: '',
  classOrDepartment: '',
  platform: '',
  courseName: '',
  duration: '',
  scoreOrCompletionDate: '',
  academicYear: '1st year',
};

export default function NptelMoocForm({ month }) {
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
      await pillar1Api.createNptelMooc(formData);
      setForm(initialState);
      setCertificate(null);
      event.target.reset();
    });
  };

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  return (
    <form className="grid-form" onSubmit={onSubmit}>
      <label className="field">
        <span>Category</span>
        <select name="category" value={form.category} onChange={onChange}>
          <option>Faculty</option>
          <option>Student</option>
        </select>
      </label>
      <label className="field">
        <span>Academic Year</span>
        <select name="academicYear" value={form.academicYear} onChange={onChange} required>
          <option value="1st year">1st year</option>
          <option value="2nd year">2nd year</option>
          <option value="3rd year">3rd year</option>
          <option value="final year">Final year</option>
        </select>
      </label>
      <Input label="Name" name="nameOfPerson" value={form.nameOfPerson} onChange={onChange} required />
      <Input label="Class / Department" name="classOrDepartment" value={form.classOrDepartment} onChange={onChange} required />
      <Input label="Platform" name="platform" value={form.platform} onChange={onChange} required />
      <Input label="Course Name" name="courseName" value={form.courseName} onChange={onChange} required />
      <Input label="Duration" name="duration" value={form.duration} onChange={onChange} />
      <Input
        label="Score / Completed On"
        name="scoreOrCompletionDate"
        value={form.scoreOrCompletionDate}
        onChange={onChange}
        required
      />
      <label className="field">
        <span>Certificate (optional)</span>
        <input type="file" accept="image/*" onChange={(e) => setCertificate(e.target.files?.[0] || null)} />
      </label>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save NPTEL/MOOC'}</Button>
      <StatusText message={message} isError={isError} />
    </form>
  );
}
