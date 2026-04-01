import React, { useState, useCallback } from 'react';
import FormSection from '../forms/FormSection.jsx';
import ImportExportModal from '../modals/ImportExportModal.jsx';
import apiClient from '../../services/api/apiClient.js';
import {
    SECTION_1_FIELDS, SECTION_2_FIELDS, SECTION_3_1_FIELDS, SECTION_3_2_FIELDS,
    SECTION_3_3_FIELDS, SECTION_4_FIELDS, SECTION_5_FIELDS, SECTION_6_FIELDS, SECTION_7_FIELDS,
    SECTIONS
} from '../../constants/formConstants.js';
import '../../styles/components.css';

const Pillar1Page = () => {
    const [activeSection, setActiveSection] = useState(1);
    const [loadingSection, setLoadingSection] = useState(null);
    const [importModalOpen, setImportModalOpen] = useState(false);

    // Generic submit handler factory
    const createSubmitHandler = useCallback((endpoint, messagePrefix = '') => {
        return async (formData) => {
            setLoadingSection(endpoint);
            try {
                // Find file fields
                const fileFields = ['image', 'certificate'];
                let fileField = null;
                Object.keys(formData).forEach(key => {
                    if (fileFields.includes(key) && formData[key]) {
                        fileField = key;
                    }
                });

                // Call appropriate API method
                let result;
                const file = fileField ? formData[fileField] : null;

                // Create data without files
                const dataWithoutFile = {};
                Object.keys(formData).forEach(key => {
                    if (!fileFields.includes(key)) {
                        dataWithoutFile[key] = formData[key];
                    }
                });

                switch (endpoint) {
                    case 'innovative-teaching':
                        result = await apiClient.addInnovativeTeaching(dataWithoutFile, file);
                        break;
                    case 'e-contents':
                        result = await apiClient.addEContent(dataWithoutFile);
                        break;
                    case 'guest-lectures':
                        result = await apiClient.addGuestLecture(dataWithoutFile, file);
                        break;
                    case 'fdps-organized':
                        result = await apiClient.addFDPOrganized(dataWithoutFile, file);
                        break;
                    case 'course-facilitator':
                        result = await apiClient.addCourseFacilitatorSession(dataWithoutFile, file);
                        break;
                    case 'faculty-events':
                        result = await apiClient.addFacultyEvent(dataWithoutFile, file);
                        break;
                    case 'student-events':
                        result = await apiClient.addStudentEvent(dataWithoutFile);
                        break;
                    case 'nptel-mooc':
                        result = await apiClient.addNPTELMOOC(dataWithoutFile, file);
                        break;
                    case 'academic-achievements':
                        result = await apiClient.addAcademicAchievement(dataWithoutFile);
                        break;
                    default:
                        throw new Error('Unknown endpoint');
                }

                if (!result || !result.data) {
                    throw new Error('Invalid response from server');
                }

                return result;
            } finally {
                setLoadingSection(null);
            }
        };
    }, []);

    const handleImportSuccess = () => {
        setImportModalOpen(false);
        // Optionally refresh data or show success message
    };

    return (
        <div className="pillar-page">
            {/* Header with Import/Export buttons */}
            <div className="page-header">
                <div className="header-content">
                    <h1>📚 Pillar 1 - Center for Learning and Teaching</h1>
                    <p>Enter data for all 7 sections below or use Import/Export for bulk operations</p>
                </div>

                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setImportModalOpen(true)}
                    >
                        📥 Import / Export
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => apiClient.generateReport()}
                    >
                        📤 Download Report
                    </button>
                </div>
            </div>

            {/* Tabbed Navigation */}
            <div className="tabs-container" role="tablist">
                {SECTIONS.map(section => (
                    <button
                        key={section.id}
                        role="tab"
                        aria-selected={activeSection === section.id}
                        className={`tab-button ${activeSection === section.id ? 'active' : ''}`}
                        onClick={() => setActiveSection(section.id)}
                    >
                        <span className="section-icon">{section.icon}</span>
                        <span className="section-name">{section.name}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tabs-content">
                {/* Section 1: Innovative Teaching */}
                {activeSection === 1 && (
                    <FormSection
                        title="Innovative Teaching Methodologies"
                        icon="📚"
                        fields={SECTION_1_FIELDS}
                        onSubmit={createSubmitHandler('innovative-teaching')}
                        loading={loadingSection === 'innovative-teaching'}
                        showSuccessMessage={true}
                    />
                )}

                {/* Section 2: E-Contents */}
                {activeSection === 2 && (
                    <FormSection
                        title="E-Contents Developed"
                        icon="💻"
                        fields={SECTION_2_FIELDS}
                        onSubmit={createSubmitHandler('e-contents')}
                        loading={loadingSection === 'e-contents'}
                        showSuccessMessage={true}
                    />
                )}

                {/* Section 3.1: Guest Lectures */}
                {activeSection === '3.1' && (
                    <FormSection
                        title="Guest Lectures Organized"
                        icon="🎤"
                        fields={SECTION_3_1_FIELDS}
                        onSubmit={createSubmitHandler('guest-lectures')}
                        loading={loadingSection === 'guest-lectures'}
                        showSuccessMessage={true}
                    />
                )}

                {/* Section 3.2: FDPs */}
                {activeSection === '3.2' && (
                    <FormSection
                        title="FDPs Organized"
                        icon="📖"
                        fields={SECTION_3_2_FIELDS}
                        onSubmit={createSubmitHandler('fdps-organized')}
                        loading={loadingSection === 'fdps-organized'}
                        showSuccessMessage={true}
                    />
                )}

                {/* Section 3.3: Course Facilitator */}
                {activeSection === '3.3' && (
                    <FormSection
                        title="Course Facilitator Sessions Organized"
                        icon="👨‍🏫"
                        fields={SECTION_3_3_FIELDS}
                        onSubmit={createSubmitHandler('course-facilitator')}
                        loading={loadingSection === 'course-facilitator'}
                        showSuccessMessage={true}
                    />
                )}

                {/* Section 4: Faculty Events */}
                {activeSection === 4 && (
                    <FormSection
                        title="Faculty Events Attended"
                        icon="👥"
                        fields={SECTION_4_FIELDS}
                        onSubmit={createSubmitHandler('faculty-events')}
                        loading={loadingSection === 'faculty-events'}
                        showSuccessMessage={true}
                    />
                )}

                {/* Section 5: Student Events */}
                {activeSection === 5 && (
                    <FormSection
                        title="Student Events Attended"
                        icon="🎓"
                        fields={SECTION_5_FIELDS}
                        onSubmit={createSubmitHandler('student-events')}
                        loading={loadingSection === 'student-events'}
                        showSuccessMessage={true}
                    />
                )}

                {/* Section 6: NPTEL/MOOC */}
                {activeSection === 6 && (
                    <FormSection
                        title="NPTEL/MOOC Courses"
                        icon="🌐"
                        fields={SECTION_6_FIELDS}
                        onSubmit={createSubmitHandler('nptel-mooc')}
                        loading={loadingSection === 'nptel-mooc'}
                        showSuccessMessage={true}
                    />
                )}

                {/* Section 7: Academic Achievements */}
                {activeSection === 7 && (
                    <FormSection
                        title="Academic Achievements"
                        icon="🏆"
                        fields={SECTION_7_FIELDS}
                        onSubmit={createSubmitHandler('academic-achievements')}
                        loading={loadingSection === 'academic-achievements'}
                        showSuccessMessage={true}
                    />
                )}
            </div>

            {/* Import/Export Modal */}
            <ImportExportModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onImportSuccess={handleImportSuccess}
            />
        </div>
    );
};

export default Pillar1Page;
