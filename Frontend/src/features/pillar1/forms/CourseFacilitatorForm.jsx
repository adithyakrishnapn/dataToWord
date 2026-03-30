import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import StatusText from '../components/StatusText';
import { useSubmit } from '../../../hooks/useSubmit';
import { pillar1Api } from '../../../services/pillar1Api';

const initialState = {
  serialNo: '',
  department: '',
  courseName: '',
  date: '',
  facilitatorName: '',
  facilitatorDesignation: '',
  facilitatorInstitution: '',
  numberOfStudents: '',
};

export default function CourseFacilitatorForm() {
  const [form, setForm] = useState(initialState);
  const [image, setImage] = useState(null);
  const { isSubmitting, message, isError, wrapSubmit } = useSubmit();

  const onSubmit = (event) => {
    event.preventDefault();
    wrapSubmit(async () => {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
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
      <Input label="S.No" name="serialNo" type="number" value={form.serialNo} onChange={onChange} required />
      <Input label="Department" name="department" value={form.department} onChange={onChange} required />
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
