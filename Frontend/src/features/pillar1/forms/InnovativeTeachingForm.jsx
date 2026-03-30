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
};

export default function InnovativeTeachingForm() {
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
        <span>Image (optional)</span>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      </label>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Section 1'}</Button>
      <StatusText message={message} isError={isError} />
    </form>
  );
}
