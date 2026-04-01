import React, { useState } from 'react';

const FormSection = ({ title, icon, fields, onSubmit, loading = false, showSuccessMessage = false }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        Object.keys(fields).forEach(fieldName => {
            const field = fields[fieldName];
            const value = formData[fieldName];

            if (field.required && (!value || value === '')) {
                newErrors[fieldName] = `${field.label} is required`;
            }

            if (value && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                newErrors[fieldName] = 'Invalid email format';
            }

            if (value && field.type === 'number' && isNaN(value)) {
                newErrors[fieldName] = 'Must be a number';
            }

            if (value && field.type === 'date' && isNaN(new Date(value).getTime())) {
                newErrors[fieldName] = 'Invalid date';
            }
        });

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        setMessage('');

        try {
            await onSubmit(formData);
            setMessage('✓ Data saved successfully!');
            setFormData({});
            
            if (showSuccessMessage) {
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            setMessage(`✗ Error: ${error.message}`);
        }
    };

    return (
        <div className="form-section">
            <div className="section-header">
                <h2>{icon} {title}</h2>
            </div>

            {message && (
                <div className={`message-box ${message.startsWith('✓') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-grid">
                    {Object.entries(fields).map(([fieldName, field]) => (
                        <div key={fieldName} className={`form-group ${field.type === 'textarea' ? 'full-width' : ''}`}>
                            <label>
                                {field.label}
                                {field.required && <span>*</span>}
                            </label>

                            {field.type === 'textarea' ? (
                                <textarea
                                    name={fieldName}
                                    value={formData[fieldName] || ''}
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder || ''}
                                    disabled={loading}
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    name={fieldName}
                                    value={formData[fieldName] || ''}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                >
                                    <option value="">-- Select {field.label} --</option>
                                    {field.options && field.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type || 'text'}
                                    name={fieldName}
                                    value={formData[fieldName] || ''}
                                    onChange={handleInputChange}
                                    accept={field.accept || ''}
                                    placeholder={field.placeholder || ''}
                                    disabled={loading}
                                />
                            )}

                            {errors[fieldName] && (
                                <small className="error-text">{errors[fieldName]}</small>
                            )}
                        </div>
                    ))}
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            setFormData({});
                            setErrors({});
                        }}
                        disabled={loading}
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? '⏳ Saving...' : '✓ Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormSection;
