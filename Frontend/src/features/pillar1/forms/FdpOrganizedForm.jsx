import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import StatusText from '../components/StatusText';
import { useSubmit } from '../../../hooks/useSubmit';
import { pillar1Api } from '../../../services/pillar1Api';

const initialState = {
  serialNo: '',
  department: '',
  fdpTitle: '',
  date: '',
  sponsoredAgency: '',
  sponsoredAmount: '',
  numberOfBeneficiaries: '',
};

export default function FdpOrganizedForm() {
  const [form, setForm] = useState(initialState);
  const [image, setImage] = useState(null);
  const { isSubmitting, message, isError, wrapSubmit } = useSubmit();

  const onSubmit = (event) => {
    event.preventDefault();
    wrapSubmit(async () => {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (image) formData.append('image', image);
      await pillar1Api.createFdpOrganized(formData);
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
      <Input label="FDP Title" name="fdpTitle" value={form.fdpTitle} onChange={onChange} required />
      <Input label="Date" name="date" type="date" value={form.date} onChange={onChange} required />
      <Input label="Sponsored Agency" name="sponsoredAgency" value={form.sponsoredAgency} onChange={onChange} required />
      <Input label="Sponsored Amount" name="sponsoredAmount" value={form.sponsoredAmount} onChange={onChange} />
      <Input
        label="No. of Beneficiaries"
        name="numberOfBeneficiaries"
        type="number"
        value={form.numberOfBeneficiaries}
        onChange={onChange}
        required
      />
      <label className="field">
        <span>Image (optional)</span>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      </label>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save FDP'}</Button>
      <StatusText message={message} isError={isError} />
    </form>
  );
}
