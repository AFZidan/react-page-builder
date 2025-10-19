import { useForm } from 'react-hook-form';
import { useState } from 'react';

export default function FormWithValidation({ component, children }) {
  const { handleSubmit, formState: { errors } } = useForm();
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const onSubmit = async (data) => {
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await fetch(component.action || '/api/forms/submit', {
        method: component.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: component.successMessage || 'Form submitted successfully!',
        });
        // Reset form if needed
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: component.errorMessage || 'Failed to submit form. Please try again.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={component.className}>
      {submitStatus.message && (
        <div className={`alert ${submitStatus.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
          <span>{submitStatus.message}</span>
        </div>
      )}

      {children}

      {errors && Object.keys(errors).length > 0 && (
        <div className="alert alert-error mb-4">
          <span>Please fix the errors above</span>
        </div>
      )}
    </form>
  );
}

