import React, { useState } from 'react';
import '../../styles/components.css';
import excelService from '../../services/excel/excelService.js';
import apiClient from '../../services/api/apiClient.js';

const ImportExportModal = ({ isOpen, selectedMonth, onClose, onImportSuccess }) => {
    const [activeTab, setActiveTab] = useState('import');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState([]);
    const [summary, setSummary] = useState(null);
    const [step, setStep] = useState('upload'); // upload, preview, confirm
    const [word2007Mode, setWord2007Mode] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(null);
            setErrors([]);
            setSummary(null);
        }
    };

    const handleDownloadTemplate = async () => {
        setLoading(true);
        try {
            const result = await excelService.downloadTemplate();
            if (!result.success) {
                setErrors([result.error]);
            }
        } catch (error) {
            setErrors([error.message]);
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewFile = async () => {
        if (!file) {
            setErrors(['Please select a file']);
            return;
        }

        setLoading(true);
        try {
            const result = await excelService.parseAndPreviewExcel(file);
            
            if (!result.success) {
                setErrors([result.error]);
                return;
            }

            setErrors(result.errors);
            setSummary(result.summary);
            setPreview(result.preview);
            setStep('preview');
        } catch (error) {
            setErrors([error.message]);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkInsert = async () => {
        if (!file) {
            setErrors(['No file selected']);
            return;
        }

        setLoading(true);
        try {
            const result = await excelService.bulkInsertFromExcel(file);

            if (!result.success) {
                const fallbackError = result.message || result.error || 'Bulk insert failed. Please check the uploaded data and try again.';
                setErrors(result.errors && result.errors.length > 0 ? result.errors : [fallbackError]);
                return;
            }

            // Success
            setErrors([]);
            setSummary({
                success: true,
                message: result.message,
                results: result.results
            });
            setStep('confirm');

            // Callback to parent
            if (onImportSuccess) {
                setTimeout(() => {
                    onImportSuccess();
                }, 1500);
            }
        } catch (error) {
            setErrors([error.message]);
        } finally {
            setLoading(false);
        }
    };

    const handleExportReport = async () => {
        setLoading(true);
        try {
            await apiClient.generateReport(selectedMonth, {
                compatibility: word2007Mode ? 'word2007' : undefined,
            });
            setErrors([]);
        } catch (error) {
            setErrors([error.message]);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreview(null);
        setErrors([]);
        setSummary(null);
        setStep('upload');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content import-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Import / Export Data</h2>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>

                <div className="modal-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
                        onClick={() => {setActiveTab('import'); setStep('upload');}}
                    >
                        📥 Import from Excel
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
                        onClick={() => setActiveTab('export')}
                    >
                        📤 Export Report
                    </button>
                </div>

                <div className="modal-body">
                    {activeTab === 'import' && (
                        <div className="import-section">
                            {step === 'upload' && (
                                <>
                                    <div className="info-box">
                                        <h3>📋 Import Data from Excel</h3>
                                        <p>Download the template, fill it with your data, and upload it here.</p>
                                    </div>

                                    <button 
                                        className="btn btn-secondary"
                                        onClick={handleDownloadTemplate}
                                        disabled={loading}
                                    >
                                        📥 Download Template
                                    </button>

                                    <div className="file-upload-section">
                                        <h4>Select Excel File</h4>
                                        <div className="file-input-wrapper">
                                            <input
                                                type="file"
                                                id="excelFile"
                                                accept=".xlsx,.xls"
                                                onChange={handleFileChange}
                                                disabled={loading}
                                            />
                                            <label htmlFor="excelFile" className="file-label">
                                                {file ? file.name : 'Click to select file or drag & drop'}
                                            </label>
                                        </div>
                                        <small>Supported formats: .xlsx, .xls (Max 5MB)</small>
                                    </div>

                                    {file && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={handlePreviewFile}
                                            disabled={loading}
                                        >
                                            {loading ? 'Parsing...' : '✓ Preview & Validate'}
                                        </button>
                                    )}
                                </>
                            )}

                            {step === 'preview' && (
                                <>
                                    <div className="preview-section">
                                        <h3>📊 Import Preview</h3>
                                        
                                        {summary && (
                                            <div className="summary-box">
                                                <h4>Summary of Data</h4>
                                                <table className="summary-table">
                                                    <tbody>
                                                        { summary.sheet1InnovativeTeaching > 0 && <tr><td>Innovative Teaching</td><td>{summary.sheet1InnovativeTeaching} rows</td></tr> }
                                                        { summary.sheet2EContents > 0 && <tr><td>E-Contents</td><td>{summary.sheet2EContents} rows</td></tr> }
                                                        { summary.sheet3GuestLectures > 0 && <tr><td>Guest Lectures</td><td>{summary.sheet3GuestLectures} rows</td></tr> }
                                                        { summary.sheet3FDP > 0 && <tr><td>FDPs Organized</td><td>{summary.sheet3FDP} rows</td></tr> }
                                                        { summary.sheet3Facilitator > 0 && <tr><td>Course Facilitator</td><td>{summary.sheet3Facilitator} rows</td></tr> }
                                                        { summary.sheet4Faculty > 0 && <tr><td>Faculty Events</td><td>{summary.sheet4Faculty} rows</td></tr> }
                                                        { summary.sheet5Student > 0 && <tr><td>Student Events</td><td>{summary.sheet5Student} rows</td></tr> }
                                                        { summary.sheet6NPTEL > 0 && <tr><td>NPTEL/MOOC</td><td>{summary.sheet6NPTEL} rows</td></tr> }
                                                        { summary.sheet7Academic > 0 && <tr><td>Academic Achievements</td><td>{summary.sheet7Academic} rows</td></tr> }
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {errors.length > 0 && (
                                            <div className="errors-box">
                                                <h4>⚠️ Validation Errors</h4>
                                                <ul>
                                                    {errors.slice(0, 10).map((err, idx) => (
                                                        <li key={idx}>{err}</li>
                                                    ))}
                                                </ul>
                                                {errors.length > 10 && <li>... and {errors.length - 10} more errors</li>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setStep('upload')}
                                        >
                                            ← Back
                                        </button>
                                        {errors.length === 0 && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleBulkInsert}
                                                disabled={loading}
                                            >
                                                {loading ? 'Inserting...' : '✓ Insert All Data'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            {step === 'confirm' && summary && summary.success && (
                                <div className="success-section">
                                    <div className="success-box">
                                        <h3>✓ Import Successful!</h3>
                                        <p>{summary.message}</p>
                                        <div className="results-box">
                                            {Object.entries(summary.results.details || {}).map(([key, value], idx) => (
                                                <div key={idx} className="result-item">
                                                    <span className="label">{key}:</span>
                                                    <span className="value">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleClose}
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'export' && (
                        <div className="export-section">
                            <div className="info-box">
                                <h3>📤 Export Report</h3>
                                <p>Generate a comprehensive Word document (.docx) report with all your data.</p>
                            </div>

                            <div className="report-info">
                                <h4>Report Includes:</h4>
                                <p><strong>Selected month:</strong> {selectedMonth}</p>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '8px 0 12px' }}>
                                    <input
                                        type="checkbox"
                                        checked={word2007Mode}
                                        onChange={(e) => setWord2007Mode(e.target.checked)}
                                        disabled={loading}
                                    />
                                    Use Word 2007 compatible mode (best for old MS Office)
                                </label>
                                <ul>
                                    <li>✓ All 7 sections of Center for Learning and Teaching</li>
                                    <li>✓ Formatted tables with all data</li>
                                    <li>✓ Professional document layout</li>
                                    <li>✓ Ready for printing and submission</li>
                                </ul>
                            </div>

                            <button
                                className="btn btn-primary btn-large"
                                onClick={handleExportReport}
                                disabled={loading}
                            >
                                {loading ? '⏳ Generating...' : '📥 Download Report'}
                            </button>
                        </div>
                    )}
                </div>

                {errors.length > 0 && activeTab === 'export' && (
                    <div className="error-box">
                        {errors.map((err, idx) => (
                            <p key={idx}>⚠️ {err}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportExportModal;
