// Form field constants for all sections
export const SECTION_1_FIELDS = {
    department: { label: 'Department', type: 'text', required: true },
    courseCode: { label: 'Course Code', type: 'text', required: true },
    courseName: { label: 'Course Name', type: 'text', required: true },
    topic: { label: 'Topic', type: 'text', required: true },
    teachingMethod: { label: 'Teaching Method', type: 'text', required: true },
    image: { label: 'Image', type: 'file', accept: 'image/*', required: false }
};

export const SECTION_2_FIELDS = {
    branch: { label: 'Branch', type: 'text', required: true },
    youtubeVideoCount: { label: 'YouTube Video Count', type: 'number', required: false },
    youtubeVideoLinks: { label: 'YouTube Links (comma-separated)', type: 'textarea', required: false },
    otherEContents: { label: 'Other E-Contents', type: 'textarea', required: false }
};

export const SECTION_3_1_FIELDS = {
    department: { label: 'Department', type: 'text', required: true },
    workshopTitle: { label: 'Workshop Title', type: 'text', required: true },
    date: { label: 'Date', type: 'date', required: true },
    guestName: { label: 'Guest Name', type: 'text', required: true },
    guestDesignation: { label: 'Guest Designation', type: 'text', required: false },
    image: { label: 'Image', type: 'file', accept: 'image/*', required: false }
};

export const SECTION_3_2_FIELDS = {
    department: { label: 'Department', type: 'text', required: true },
    fdpTitle: { label: 'FDP Title', type: 'text', required: true },
    date: { label: 'Date', type: 'date', required: true },
    sponsoredAgency: { label: 'Sponsored Agency', type: 'text', required: true },
    sponsoredAmount: { label: 'Sponsored Amount', type: 'text', required: false },
    numberOfBeneficiaries: { label: 'Number of Beneficiaries', type: 'number', required: true },
    image: { label: 'Image', type: 'file', accept: 'image/*', required: false }
};

export const SECTION_3_3_FIELDS = {
    department: { label: 'Department', type: 'text', required: true },
    courseName: { label: 'Course Name', type: 'text', required: true },
    date: { label: 'Date', type: 'date', required: true },
    facilitatorName: { label: 'Facilitator Name', type: 'text', required: true },
    facilitatorDesignation: { label: 'Facilitator Designation', type: 'text', required: false },
    facilitatorInstitution: { label: 'Facilitator Institution', type: 'text', required: false },
    numberOfStudents: { label: 'Number of Students', type: 'number', required: false },
    image: { label: 'Image', type: 'file', accept: 'image/*', required: false }
};

export const SECTION_4_FIELDS = {
    facultyName: { label: 'Faculty Name', type: 'text', required: true },
    department: { label: 'Department', type: 'text', required: true },
    eventType: { 
        label: 'Event Type', 
        type: 'select', 
        required: true,
        options: ['Workshop', 'Seminar', 'Guest Lecture', 'FDP', 'Others']
    },
    eventTitle: { label: 'Event Title', type: 'text', required: true },
    onlineOffline: { 
        label: 'Online/Offline', 
        type: 'select', 
        required: true,
        options: ['Online', 'Offline']
    },
    organizerDetails: { label: 'Organizer Details', type: 'textarea', required: true },
    placeOfEvent: { label: 'Place of Event', type: 'text', required: false },
    date: { label: 'Date', type: 'date', required: true },
    certificate: { label: 'Certificate', type: 'file', accept: '.pdf,.jpg,.png', required: false }
};

export const SECTION_5_FIELDS = {
    studentNames: { label: 'Student Names (comma-separated)', type: 'textarea', required: true },
    department: { label: 'Department', type: 'text', required: true },
    eventType: { 
        label: 'Event Type', 
        type: 'select', 
        required: true,
        options: ['Workshop', 'Seminar', 'Guest Lecture', 'Course Facilitator Session', 'Others']
    },
    eventTitle: { label: 'Event Title', type: 'text', required: true },
    onlineOffline: { 
        label: 'Online/Offline', 
        type: 'select', 
        required: true,
        options: ['Online', 'Offline']
    },
    organizerDetails: { label: 'Organizer Details', type: 'textarea', required: true },
    placeOfEvent: { label: 'Place of Event', type: 'text', required: false },
    date: { label: 'Date', type: 'date', required: true },
    numberOfStudentsAttended: { label: 'Number of Students', type: 'number', required: true }
};

export const SECTION_6_FIELDS = {
    category: { 
        label: 'Category', 
        type: 'select', 
        required: true,
        options: ['Faculty', 'Student']
    },
    nameOfPerson: { label: 'Name of Person', type: 'text', required: true },
    classOrDepartment: { label: 'Department/Class', type: 'text', required: true },
    platform: { label: 'Platform', type: 'text', required: true },
    courseName: { label: 'Course Name', type: 'text', required: true },
    duration: { label: 'Duration', type: 'text', required: false },
    scoreOrCompletionDate: { label: 'Score/Completion Date', type: 'text', required: true },
    certificate: { label: 'Certificate', type: 'file', accept: '.pdf,.jpg,.png', required: false }
};

export const SECTION_7_FIELDS = {
    branch: { label: 'Branch', type: 'text', required: true },
    semesterYear: { label: 'Semester/Year', type: 'text', required: true },
    appeared: { label: 'Appeared', type: 'number', required: true },
    graduated: { label: 'Graduated', type: 'number', required: true }
};

// Validation error messages
export const VALIDATION_MESSAGES = {
    required: ' is required',
    email: ' must be a valid email',
    numeric: ' must be numeric',
    date: ' must be a valid date',
    url: ' must be a valid URL',
    phone: ' must be a valid phone number'
};

// Tab/Section information
export const SECTIONS = [
    { id: 1, name: 'Innovative Teaching', icon: '📚' },
    { id: 2, name: 'E-Contents', icon: '💻' },
    { id: '3.1', name: 'Guest Lectures', icon: '🎤' },
    { id: '3.2', name: 'FDPs Organized', icon: '📖' },
    { id: '3.3', name: 'Course Facilitator', icon: '👨‍🏫' },
    { id: 4, name: 'Faculty Events', icon: '👥' },
    { id: 5, name: 'Student Events', icon: '🎓' },
    { id: 6, name: 'NPTEL/MOOC', icon: '🌐' },
    { id: 7, name: 'Academic Achievements', icon: '🏆' }
];

// API endpoints
export const API_ENDPOINTS = {
    template: '/template/download',
    preview: '/import/preview',
    bulkInsert: '/import/bulk-insert',
    generateReport: '/generate-report',
    innovativeTeaching: '/innovative-teaching',
    eContents: '/e-contents',
    guestLectures: '/guest-lectures',
    fdpsOrganized: '/fdps-organized',
    courseFacilitator: '/course-facilitator-sessions',
    facultyEvents: '/faculty-events',
    studentEvents: '/student-events',
    nptelMooc: '/nptel-mooc',
    academicAchievements: '/academic-achievements'
};
