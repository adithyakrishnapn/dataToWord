import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import StatusText from '../components/StatusText';
import { useSubmit } from '../../../hooks/useSubmit';
import { pillar1Api } from '../../../services/pillar1Api';

const initialState = {
  branch: '',
  semesterYear: '',
  appeared: '',
  graduated: '',
};

export default function AcademicAchievementForm({ month }) {
  const [form, setForm] = useState(initialState);
  const { isSubmitting, message, isError, wrapSubmit } = useSubmit();

  const onSubmit = (event) => {
    event.preventDefault();
    wrapSubmit(async () => {
      const payload = {
        ...form,
        appeared: Number(form.appeared),
        graduated: Number(form.graduated),
        month: month,
      };
      await pillar1Api.createAcademicAchievement(payload);
      setForm(initialState);
    });
  };

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  return (
    <form className="grid-form" onSubmit={onSubmit}>
      <Input label="Branch" name="branch" value={form.branch} onChange={onChange} required />
      <Input label="Semester / Year" name="semesterYear" value={form.semesterYear} onChange={onChange} required />
      <Input label="Appeared" name="appeared" type="number" value={form.appeared} onChange={onChange} required />
      <Input label="Graduated" name="graduated" type="number" value={form.graduated} onChange={onChange} required />
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Academic Achievement'}</Button>
      <StatusText message={message} isError={isError} />
    </form>
  );
}
