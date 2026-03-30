import { useState } from 'react';

export function useSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const wrapSubmit = async (submitFn) => {
    setIsSubmitting(true);
    setMessage('');
    setIsError(false);
    try {
      await submitFn();
      setMessage('Saved successfully.');
    } catch (error) {
      const details = error?.response?.data?.error || error?.message || 'Failed to save data.';
      setMessage(details);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, message, isError, wrapSubmit, setMessage };
}
