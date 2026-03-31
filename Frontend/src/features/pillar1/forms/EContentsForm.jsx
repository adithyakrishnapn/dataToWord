import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import StatusText from '../components/StatusText';
import { useSubmit } from '../../../hooks/useSubmit';
import { pillar1Api } from '../../../services/pillar1Api';

const initialState = {
  branch: '',
  youtubeVideoCount: '',
  youtubeVideoLinks: '',
  otherEContents: '',
  academicYear: '1st year',
};

export default function EContentsForm({ month }) {
  const [form, setForm] = useState(initialState);
  const { isSubmitting, message, isError, wrapSubmit } = useSubmit();

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    wrapSubmit(async () => {
      const payload = {
        branch: form.branch,
        youtubeVideoCount: Number(form.youtubeVideoCount || 0),
        youtubeVideoLinks: form.youtubeVideoLinks
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        otherEContents: form.otherEContents
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((title) => ({ title, link: '', type: 'other' })),
        academicYear: form.academicYear,
        month: month,
      };
      await pillar1Api.createEContents(payload);
      setForm(initialState);
    });
  };

  return (
    <form className="grid-form" onSubmit={onSubmit}>
      <Input label="Branch" name="branch" value={form.branch} onChange={onChange} required />
      <label className="field">
        <span>Academic Year</span>
        <select name="academicYear" value={form.academicYear} onChange={onChange} required>
          <option value="1st year">1st year</option>
          <option value="2nd year">2nd year</option>
          <option value="3rd year">3rd year</option>
          <option value="final year">Final year</option>
        </select>
      </label>
      <Input
        label="YouTube Video Count"
        name="youtubeVideoCount"
        type="number"
        value={form.youtubeVideoCount}
        onChange={onChange}
      />
      <Input
        label="YouTube Links (comma separated)"
        name="youtubeVideoLinks"
        value={form.youtubeVideoLinks}
        onChange={onChange}
      />
      <Input
        label="Other E-Contents titles (comma separated)"
        name="otherEContents"
        value={form.otherEContents}
        onChange={onChange}
      />
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Section 2'}</Button>
      <StatusText message={message} isError={isError} />
    </form>
  );
}
