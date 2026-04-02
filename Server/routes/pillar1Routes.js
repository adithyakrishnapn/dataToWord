import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import multer from 'multer';
import upload from '../config/multerConfig.js';
import InnovativeTeaching from '../models/InnovativeTeachingMethodology.js';
import EContent from '../models/EContent.js';
import GuestLecture from '../models/GuestLecture.js';
import FDPOrganized from '../models/FDPOrganized.js';
import CourseFacilitatorSession from '../models/CourseFacilitatorSession.js';
import FacultyEventAttended from '../models/FacultyEventAttended.js';
import StudentEventAttended from '../models/StudentEventAttended.js';
import NPTELMOOCCourse from '../models/NPTELMOOCCourse.js';
import AcademicAchievement from '../models/AcademicAchievement.js';
import PillarSectionRecord from '../models/PillarSectionRecord.js';
import DocumentGenerator from '../services/DocumentGenerator.js';
import TemplateDocumentGenerator from '../services/TemplateDocumentGenerator.js';
import TemplateExcelGenerator from '../services/TemplateExcelGenerator.js';
import ExcelImportParser from '../services/ExcelImportParser.js';
import MonthlySummaryService from '../services/MonthlySummaryService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reportsDir = path.join(__dirname, '..', 'public', 'reports');

const excelUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        const lowerName = String(file.originalname || '').toLowerCase();
        const validExtension = lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');
        if (allowedMimes.includes(file.mimetype) || validExtension) {
            cb(null, true);
            return;
        }
        cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
});

async function ensureReportsDir() {
    await fs.mkdir(reportsDir, { recursive: true });
}

function buildReportFileName() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `Annual_Report_Learning_Teaching_${yyyy}${mm}${dd}_${hh}${min}${ss}.docx`;
}

function sanitizeReportFileName(rawName = '') {
    const safeName = path.basename(String(rawName));
    if (!safeName.toLowerCase().endsWith('.docx')) {
        return null;
    }

    if (!/^[a-zA-Z0-9._-]+\.docx$/.test(safeName)) {
        return null;
    }

    return safeName;
}

function parseArrayField(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return [];
        }

        try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
        }
    }

    return [];
}

function escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildMonthFilter(month) {
    const normalized = String(month || '').trim();
    if (!normalized) {
        return {};
    }

    return {
        month: {
            $regex: `^${escapeRegex(normalized)}$`,
            $options: 'i'
        }
    };
}

// ==================== SECTION 1: INNOVATIVE TEACHING METHODOLOGIES ====================
router.post('/innovative-teaching', upload.single('image'), async (req, res) => {
    try {
        const { department, courseCode, courseName, topic, teachingMethod, month, academicYear, imagePath } = req.body;
        const resolvedImagePath = req.file ? `/uploads/${req.file.filename}` : String(imagePath || '').trim() || null;

        const teaching = new InnovativeTeaching({
            department,
            courseCode,
            courseName,
            topic,
            teachingMethod,
            month,
            academicYear,
            imagePath: resolvedImagePath
        });

        await teaching.save();
        res.status(201).json({ message: 'Innovative teaching methodology added', data: teaching });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/innovative-teaching', async (req, res) => {
    try {
        const data = await InnovativeTeaching.find(buildMonthFilter(req.query.month));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 2: E-CONTENTS ====================
router.post('/e-contents', async (req, res) => {
    try {
        const { branch, youtubeVideoCount, youtubeVideoLinks, otherEContents, month, academicYear } = req.body;

        const parsedYoutubeLinks = parseArrayField(youtubeVideoLinks).map((item) => String(item));
        const parsedOtherEContents = parseArrayField(otherEContents).map((item) => {
            if (typeof item === 'string') {
                return { title: item, link: '', type: 'other' };
            }

            return {
                title: item?.title || '',
                link: item?.link || '',
                type: item?.type || 'other'
            };
        });

        const eContent = new EContent({
            branch,
            youtubeVideoCount: Number(youtubeVideoCount || 0),
            youtubeVideoLinks: parsedYoutubeLinks,
            otherEContents: parsedOtherEContents,
            month,
            academicYear
        });

        await eContent.save();
        res.status(201).json({ message: 'E-content added', data: eContent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/e-contents', async (req, res) => {
    try {
        const data = await EContent.find(buildMonthFilter(req.query.month));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 3.1: GUEST LECTURES ORGANIZED ====================
router.post('/guest-lectures', upload.single('image'), async (req, res) => {
    try {
        const { department, workshopTitle, date, guestName, guestDesignation, month, academicYear, imagePath } = req.body;
        const resolvedImagePath = req.file ? `/uploads/${req.file.filename}` : String(imagePath || '').trim() || null;

        const lecture = new GuestLecture({
            department,
            workshopTitle,
            date,
            guestName,
            guestDesignation,
            month,
            academicYear,
            imagePath: resolvedImagePath
        });

        await lecture.save();
        res.status(201).json({ message: 'Guest lecture added', data: lecture });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/guest-lectures', async (req, res) => {
    try {
        const data = await GuestLecture.find(buildMonthFilter(req.query.month));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 3.2: FDPs ORGANIZED ====================
router.post('/fdps-organized', upload.single('image'), async (req, res) => {
    try {
        const { department, fdpTitle, date, sponsoredAgency, sponsoredAmount, numberOfBeneficiaries, month, academicYear, imagePath } = req.body;
        const resolvedImagePath = req.file ? `/uploads/${req.file.filename}` : String(imagePath || '').trim() || null;

        const fdp = new FDPOrganized({
            department,
            fdpTitle,
            date,
            sponsoredAgency,
            sponsoredAmount,
            numberOfBeneficiaries,
            month,
            academicYear,
            imagePath: resolvedImagePath
        });

        await fdp.save();
        res.status(201).json({ message: 'FDP added', data: fdp });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/fdps-organized', async (req, res) => {
    try {
        const data = await FDPOrganized.find(buildMonthFilter(req.query.month));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 3.3: COURSE FACILITATOR SESSIONS ====================
router.post('/course-facilitator-sessions', upload.single('image'), async (req, res) => {
    try {
        const { department, courseName, date, facilitatorName, facilitatorDesignation, facilitatorInstitution, numberOfStudents, month, academicYear, imagePath } = req.body;
        const resolvedImagePath = req.file ? `/uploads/${req.file.filename}` : String(imagePath || '').trim() || null;

        const session = new CourseFacilitatorSession({
            department,
            courseName,
            date,
            facilitatorName,
            facilitatorDesignation,
            facilitatorInstitution,
            numberOfStudents,
            month,
            academicYear,
            imagePath: resolvedImagePath
        });

        await session.save();
        res.status(201).json({ message: 'Course facilitator session added', data: session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/course-facilitator-sessions', async (req, res) => {
    try {
        const data = await CourseFacilitatorSession.find(buildMonthFilter(req.query.month));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 4: FACULTY EVENTS ATTENDED ====================
router.post('/faculty-events', upload.single('certificate'), async (req, res) => {
    try {
        const { facultyName, department, eventType, eventTitle, onlineOffline, organizerDetails, placeOfEvent, date, month, academicYear, certificatePath } = req.body;
        const resolvedCertificatePath = req.file ? `/uploads/${req.file.filename}` : String(certificatePath || '').trim() || null;

        const event = new FacultyEventAttended({
            facultyName,
            department,
            eventType,
            eventTitle,
            onlineOffline,
            organizerDetails,
            placeOfEvent,
            date,
            month,
            academicYear,
            certificatePath: resolvedCertificatePath
        });

        await event.save();
        res.status(201).json({ message: 'Faculty event added', data: event });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/faculty-events', async (req, res) => {
    try {
        const data = await FacultyEventAttended.find(buildMonthFilter(req.query.month));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 5: STUDENT EVENTS ATTENDED ====================
router.post('/student-events', async (req, res) => {
    try {
        const { studentNames, department, eventType, eventTitle, onlineOffline, organizerDetails, placeOfEvent, date, numberOfStudentsAttended, month, academicYear } = req.body;

        const event = new StudentEventAttended({
            studentNames,
            department,
            eventType,
            eventTitle,
            onlineOffline,
            organizerDetails,
            placeOfEvent,
            date,
            numberOfStudentsAttended,
            month,
            academicYear
        });

        await event.save();
        res.status(201).json({ message: 'Student event added', data: event });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/student-events', async (req, res) => {
    try {
        const data = await StudentEventAttended.find(buildMonthFilter(req.query.month));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 6: NPTEL/MOOC COURSES ====================
router.post('/nptel-mooc', upload.single('certificate'), async (req, res) => {
    try {
        const { category, nameOfPerson, classOrDepartment, platform, courseName, duration, scoreOrCompletionDate, month, academicYear, certificatePath } = req.body;
        const resolvedCertificatePath = req.file ? `/uploads/${req.file.filename}` : String(certificatePath || '').trim() || null;

        const course = new NPTELMOOCCourse({
            category,
            nameOfPerson,
            classOrDepartment,
            platform,
            courseName,
            duration,
            scoreOrCompletionDate,
            month,
            academicYear,
            certificatePath: resolvedCertificatePath
        });

        await course.save();
        res.status(201).json({ message: 'NPTEL/MOOC course added', data: course });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/nptel-mooc', async (req, res) => {
    try {
        const data = await NPTELMOOCCourse.find(buildMonthFilter(req.query.month));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 7: ACADEMIC ACHIEVEMENTS ====================
router.post('/academic-achievements', async (req, res) => {
    try {
        const { branch, semesterYear, appeared, graduated, month } = req.body;

        const achievement = new AcademicAchievement({
            branch,
            semesterYear,
            appeared,
            graduated,
            graduationPercentage: (graduated / appeared) * 100,
            month
        });

        await achievement.save();
        res.status(201).json({ message: 'Academic achievement added', data: achievement });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/academic-achievements', async (req, res) => {
    try {
        const data = await AcademicAchievement.find(buildMonthFilter(req.query.month));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== UPDATE & DELETE ENDPOINTS ====================

// Innovative Teaching - Update
router.put('/innovative-teaching/:id', upload.single('image'), async (req, res) => {
    try {
        const { department, courseCode, courseName, topic, teachingMethod, month, academicYear } = req.body;
        const updateData = { department, courseCode, courseName, topic, teachingMethod, month, academicYear };
        
        if (req.file) {
            updateData.imagePath = `/uploads/${req.file.filename}`;
        }

        const updated = await InnovativeTeaching.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Updated', data: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Innovative Teaching - Delete
router.delete('/innovative-teaching/:id', async (req, res) => {
    try {
        const deleted = await InnovativeTeaching.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// E-Content - Update
router.put('/e-contents/:id', async (req, res) => {
    try {
        const { branch, youtubeVideoCount, youtubeVideoLinks, otherEContents, month, academicYear } = req.body;
        
        const parsedYoutubeLinks = parseArrayField(youtubeVideoLinks).map((item) => String(item));
        const parsedOtherEContents = parseArrayField(otherEContents).map((item) => {
            if (typeof item === 'string') {
                return { title: item, link: '', type: 'other' };
            }
            return { title: item?.title || '', link: item?.link || '', type: item?.type || 'other' };
        });

        const updated = await EContent.findByIdAndUpdate(
            req.params.id,
            { branch, youtubeVideoCount: Number(youtubeVideoCount || 0), youtubeVideoLinks: parsedYoutubeLinks, otherEContents: parsedOtherEContents, month, academicYear },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Updated', data: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// E-Content - Delete
router.delete('/e-contents/:id', async (req, res) => {
    try {
        const deleted = await EContent.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Guest Lecture - Update
router.put('/guest-lectures/:id', upload.single('image'), async (req, res) => {
    try {
        const { department, workshopTitle, date, guestName, guestDesignation, month, academicYear } = req.body;
        const updateData = { department, workshopTitle, date, guestName, guestDesignation, month, academicYear };
        
        if (req.file) {
            updateData.imagePath = `/uploads/${req.file.filename}`;
        }

        const updated = await GuestLecture.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Updated', data: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Guest Lecture - Delete
router.delete('/guest-lectures/:id', async (req, res) => {
    try {
        const deleted = await GuestLecture.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// FDP Organized - Update
router.put('/fdps-organized/:id', upload.single('image'), async (req, res) => {
    try {
        const { department, fdpTitle, date, sponsoredAgency, sponsoredAmount, numberOfBeneficiaries, month, academicYear } = req.body;
        const updateData = { department, fdpTitle, date, sponsoredAgency, sponsoredAmount, numberOfBeneficiaries, month, academicYear };
        
        if (req.file) {
            updateData.imagePath = `/uploads/${req.file.filename}`;
        }

        const updated = await FDPOrganized.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Updated', data: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// FDP Organized - Delete
router.delete('/fdps-organized/:id', async (req, res) => {
    try {
        const deleted = await FDPOrganized.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Course Facilitator - Update
router.put('/course-facilitator-sessions/:id', upload.single('image'), async (req, res) => {
    try {
        const { department, courseName, date, facilitatorName, facilitatorDesignation, facilitatorInstitution, numberOfStudents, month, academicYear } = req.body;
        const updateData = { department, courseName, date, facilitatorName, facilitatorDesignation, facilitatorInstitution, numberOfStudents, month, academicYear };
        
        if (req.file) {
            updateData.imagePath = `/uploads/${req.file.filename}`;
        }

        const updated = await CourseFacilitatorSession.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Updated', data: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Course Facilitator - Delete
router.delete('/course-facilitator-sessions/:id', async (req, res) => {
    try {
        const deleted = await CourseFacilitatorSession.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Faculty Event - Update
router.put('/faculty-events/:id', upload.single('certificate'), async (req, res) => {
    try {
        const { facultyName, department, eventType, eventTitle, onlineOffline, organizerDetails, placeOfEvent, date, month, academicYear } = req.body;
        const updateData = { facultyName, department, eventType, eventTitle, onlineOffline, organizerDetails, placeOfEvent, date, month, academicYear };
        
        if (req.file) {
            updateData.certificatePath = `/uploads/${req.file.filename}`;
        }

        const updated = await FacultyEventAttended.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Updated', data: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Faculty Event - Delete
router.delete('/faculty-events/:id', async (req, res) => {
    try {
        const deleted = await FacultyEventAttended.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Student Event - Update
router.put('/student-events/:id', async (req, res) => {
    try {
        const { studentNames, department, eventType, eventTitle, onlineOffline, organizerDetails, placeOfEvent, date, numberOfStudentsAttended, month, academicYear } = req.body;
        const parsedNames = parseArrayField(studentNames);
        
        const updated = await StudentEventAttended.findByIdAndUpdate(
            req.params.id,
            { studentNames: parsedNames, department, eventType, eventTitle, onlineOffline, organizerDetails, placeOfEvent, date, numberOfStudentsAttended, month, academicYear },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Updated', data: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Student Event - Delete
router.delete('/student-events/:id', async (req, res) => {
    try {
        const deleted = await StudentEventAttended.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// NPTEL/MOOC - Update
router.put('/nptel-mooc/:id', upload.single('certificate'), async (req, res) => {
    try {
        const { category, nameOfPerson, classOrDepartment, platform, courseName, duration, scoreOrCompletionDate, month, academicYear } = req.body;
        const updateData = { category, nameOfPerson, classOrDepartment, platform, courseName, duration, scoreOrCompletionDate, month, academicYear };
        
        if (req.file) {
            updateData.certificatePath = `/uploads/${req.file.filename}`;
        }

        const updated = await NPTELMOOCCourse.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Updated', data: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// NPTEL/MOOC - Delete
router.delete('/nptel-mooc/:id', async (req, res) => {
    try {
        const deleted = await NPTELMOOCCourse.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Academic Achievement - Update
router.put('/academic-achievements/:id', async (req, res) => {
    try {
        const { branch, semesterYear, appeared, graduated, month } = req.body;
        const graduationPercentage = (graduated / appeared) * 100;
        
        const updated = await AcademicAchievement.findByIdAndUpdate(
            req.params.id,
            { branch, semesterYear, appeared, graduated, graduationPercentage, month },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Updated', data: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Academic Achievement - Delete
router.delete('/academic-achievements/:id', async (req, res) => {
    try {
        const deleted = await AcademicAchievement.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== DOCUMENT GENERATION ====================
router.get('/generate-report', async (req, res) => {
    try {
        const compatibility = String(req.query.compatibility || '').toLowerCase();
        const monthFilter = buildMonthFilter(req.query.month);
        const pillarRecordFilter = {
            pillarNumber: { $in: [2, 3, 4, 5] },
            ...monthFilter
        };

        // Fetch all data from all sections
        const [
            innovativeTeaching,
            eContents,
            guestLectures,
            fdpsOrganized,
            courseFacilitatorSessions,
            facultyEvents,
            studentEvents,
            nptelMooc,
            academicAchievements,
            pillarRecords
        ] = await Promise.all([
            InnovativeTeaching.find(monthFilter),
            EContent.find(monthFilter),
            GuestLecture.find(monthFilter),
            FDPOrganized.find(monthFilter),
            CourseFacilitatorSession.find(monthFilter),
            FacultyEventAttended.find(monthFilter),
            StudentEventAttended.find(monthFilter),
            NPTELMOOCCourse.find(monthFilter),
            AcademicAchievement.find(monthFilter),
            PillarSectionRecord.find(pillarRecordFilter)
        ]);

        const pillar1Data = {
            innovativeTeaching,
            eContents,
            guestLectures,
            fdpsOrganized,
            courseFacilitatorSessions,
            facultyEvents,
            studentEvents,
            nptelMooc,
            academicAchievements
        };

        const isWord2007Mode = compatibility === 'word2007' || compatibility === '2007' || compatibility === 'legacy';

        let docBuffer;
        if (isWord2007Mode) {
            docBuffer = await TemplateDocumentGenerator.generateDocument(pillar1Data);
        } else {
            const pillarRecordsByPillar = {
                2: pillarRecords.filter((item) => item.pillarNumber === 2),
                3: pillarRecords.filter((item) => item.pillarNumber === 3),
                4: pillarRecords.filter((item) => item.pillarNumber === 4),
                5: pillarRecords.filter((item) => item.pillarNumber === 5)
            };

            docBuffer = await DocumentGenerator.generateDocument(pillar1Data, pillarRecordsByPillar);
        }

        await ensureReportsDir();
        const generatedFileName = buildReportFileName();
        const outputPath = path.join(reportsDir, generatedFileName);
        await fs.writeFile(outputPath, docBuffer);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${generatedFileName}"`);
        res.setHeader('X-Report-Filename', generatedFileName);
        res.send(docBuffer);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/generate-report-word2007', async (req, res) => {
    try {
        const monthFilter = buildMonthFilter(req.query.month);
        const [
            innovativeTeaching,
            eContents,
            guestLectures,
            fdpsOrganized,
            courseFacilitatorSessions,
            facultyEvents,
            studentEvents,
            nptelMooc,
            academicAchievements
        ] = await Promise.all([
            InnovativeTeaching.find(monthFilter),
            EContent.find(monthFilter),
            GuestLecture.find(monthFilter),
            FDPOrganized.find(monthFilter),
            CourseFacilitatorSession.find(monthFilter),
            FacultyEventAttended.find(monthFilter),
            StudentEventAttended.find(monthFilter),
            NPTELMOOCCourse.find(monthFilter),
            AcademicAchievement.find(monthFilter)
        ]);

        const pillar1Data = {
            innovativeTeaching,
            eContents,
            guestLectures,
            fdpsOrganized,
            courseFacilitatorSessions,
            facultyEvents,
            studentEvents,
            nptelMooc,
            academicAchievements
        };

        const docBuffer = await TemplateDocumentGenerator.generateDocument(pillar1Data);
        await ensureReportsDir();
        const generatedFileName = `Annual_Report_Learning_Teaching_Word2007_${new Date().toISOString().slice(0, 10)}.docx`;
        const outputPath = path.join(reportsDir, generatedFileName);
        await fs.writeFile(outputPath, docBuffer);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${generatedFileName}"`);
        res.send(docBuffer);
    } catch (error) {
        console.error('Error generating Word 2007 compatible report:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/summary-report', async (req, res) => {
    try {
        const monthFilter = buildMonthFilter(req.query.month);
        const pillarRecordFilter = {
            pillarNumber: { $in: [2, 3, 4, 5] },
            ...monthFilter
        };

        const [
            innovativeTeaching,
            eContents,
            guestLectures,
            fdpsOrganized,
            courseFacilitatorSessions,
            facultyEvents,
            studentEvents,
            nptelMooc,
            academicAchievements,
            pillarRecords
        ] = await Promise.all([
            InnovativeTeaching.find(monthFilter),
            EContent.find(monthFilter),
            GuestLecture.find(monthFilter),
            FDPOrganized.find(monthFilter),
            CourseFacilitatorSession.find(monthFilter),
            FacultyEventAttended.find(monthFilter),
            StudentEventAttended.find(monthFilter),
            NPTELMOOCCourse.find(monthFilter),
            AcademicAchievement.find(monthFilter),
            PillarSectionRecord.find(pillarRecordFilter)
        ]);

        const result = await MonthlySummaryService.generate(req.query.month, {
            innovativeTeaching,
            eContents,
            guestLectures,
            fdpsOrganized,
            courseFacilitatorSessions,
            facultyEvents,
            studentEvents,
            nptelMooc,
            academicAchievements,
            pillarRecords
        }, {
            provider: req.query.provider
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/summary-report/download', async (req, res) => {
    try {
        const monthFilter = buildMonthFilter(req.query.month);
        const pillarRecordFilter = {
            pillarNumber: { $in: [2, 3, 4, 5] },
            ...monthFilter
        };

        const [
            innovativeTeaching,
            eContents,
            guestLectures,
            fdpsOrganized,
            courseFacilitatorSessions,
            facultyEvents,
            studentEvents,
            nptelMooc,
            academicAchievements,
            pillarRecords
        ] = await Promise.all([
            InnovativeTeaching.find(monthFilter),
            EContent.find(monthFilter),
            GuestLecture.find(monthFilter),
            FDPOrganized.find(monthFilter),
            CourseFacilitatorSession.find(monthFilter),
            FacultyEventAttended.find(monthFilter),
            StudentEventAttended.find(monthFilter),
            NPTELMOOCCourse.find(monthFilter),
            AcademicAchievement.find(monthFilter),
            PillarSectionRecord.find(pillarRecordFilter)
        ]);

        const result = await MonthlySummaryService.generate(req.query.month, {
            innovativeTeaching,
            eContents,
            guestLectures,
            fdpsOrganized,
            courseFacilitatorSessions,
            facultyEvents,
            studentEvents,
            nptelMooc,
            academicAchievements,
            pillarRecords
        }, {
            provider: req.query.provider
        });

        const docBuffer = await MonthlySummaryService.generateDocx(result.summaryMarkdown, result.month || req.query.month);
        const safeMonth = String(result.month || req.query.month || 'All_Months').replace(/\s+/g, '_');
        const fileName = `Monthly_Institutional_Summary_${safeMonth}.docx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(docBuffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/report-history', async (req, res) => {
    try {
        await ensureReportsDir();
        const entries = await fs.readdir(reportsDir, { withFileTypes: true });
        const docxFiles = entries
            .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.docx'))
            .map((entry) => entry.name);

        const history = await Promise.all(
            docxFiles.map(async (fileName) => {
                const fullPath = path.join(reportsDir, fileName);
                const stats = await fs.stat(fullPath);
                return {
                    fileName,
                    sizeBytes: stats.size,
                    createdAt: stats.birthtime,
                    updatedAt: stats.mtime
                };
            })
        );

        history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/report-history/download-all', async (req, res) => {
    try {
        await ensureReportsDir();
        const entries = await fs.readdir(reportsDir, { withFileTypes: true });
        const docxFiles = entries
            .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.docx'))
            .map((entry) => entry.name)
            .sort();

        if (!docxFiles.length) {
            return res.status(404).json({ error: 'No generated reports found.' });
        }

        const zip = new JSZip();
        for (const fileName of docxFiles) {
            const fullPath = path.join(reportsDir, fileName);
            const fileBuffer = await fs.readFile(fullPath);
            zip.file(fileName, fileBuffer);
        }

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        const zipName = `Generated_Reports_${new Date().toISOString().slice(0, 10)}.zip`;

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
        res.send(zipBuffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/report-history/:fileName', async (req, res) => {
    try {
        const decodedFileName = decodeURIComponent(req.params.fileName || '');
        const safeFileName = sanitizeReportFileName(decodedFileName);
        if (!safeFileName) {
            return res.status(400).json({ error: 'Invalid report file name.' });
        }

        await ensureReportsDir();
        const reportPath = path.join(reportsDir, safeFileName);
        await fs.unlink(reportPath);

        res.status(200).json({ message: 'Report deleted successfully.' });
    } catch {
        res.status(404).json({ error: 'Report file not found.' });
    }
});

router.get('/report-history/:fileName/download', async (req, res) => {
    try {
        const decodedFileName = decodeURIComponent(req.params.fileName || '');
        const safeFileName = sanitizeReportFileName(decodedFileName);
        if (!safeFileName) {
            return res.status(400).json({ error: 'Invalid report file name.' });
        }

        await ensureReportsDir();
        const reportPath = path.join(reportsDir, safeFileName);
        await fs.access(reportPath);

        res.download(reportPath, safeFileName);
    } catch {
        res.status(404).json({ error: 'Report file not found.' });
    }
});

// ==================== IMPORT/EXPORT FUNCTIONALITY ====================

// Download Excel Template
router.get('/template/download', async (req, res) => {
    try {
        const buffer = await TemplateExcelGenerator.generateTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Pillar1_ImportTemplate.xlsx"');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: `Failed to generate template: ${error.message}` });
    }
});

// Parse and Preview Excel Upload
router.post('/import/preview', excelUpload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const parsedData = ExcelImportParser.parseExcelFile(req.file.buffer);

        res.json({
            success: !parsedData.error,
            errors: parsedData.errors || [],
            data: {
                sheet1InnovativeTeaching: parsedData.sheet1InnovativeTeaching.length,
                sheet2EContents: parsedData.sheet2EContents.length,
                sheet3GuestLectures: parsedData.sheet3GuestLectures.length,
                sheet3FDP: parsedData.sheet3FDP.length,
                sheet3Facilitator: parsedData.sheet3Facilitator.length,
                sheet4Faculty: parsedData.sheet4Faculty.length,
                sheet5Student: parsedData.sheet5Student.length,
                sheet6NPTEL: parsedData.sheet6NPTEL.length,
                sheet7Academic: parsedData.sheet7Academic.length
            },
            preview: {
                innovativeTeaching: parsedData.sheet1InnovativeTeaching.slice(0, 3),
                eContents: parsedData.sheet2EContents.slice(0, 3),
                guestLectures: parsedData.sheet3GuestLectures.slice(0, 3),
                fdp: parsedData.sheet3FDP.slice(0, 3),
                facilitator: parsedData.sheet3Facilitator.slice(0, 3),
                faculty: parsedData.sheet4Faculty.slice(0, 3),
                student: parsedData.sheet5Student.slice(0, 3),
                nptel: parsedData.sheet6NPTEL.slice(0, 3),
                academic: parsedData.sheet7Academic.slice(0, 3)
            }
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to parse Excel: ${error.message}` });
    }
});

// Bulk Insert from Excel
router.post('/import/bulk-insert', excelUpload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const parsedData = ExcelImportParser.parseExcelFile(req.file.buffer);

        if (parsedData.errors && parsedData.errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors found',
                errors: parsedData.errors
            });
        }

        const transformed = ExcelImportParser.transformToModels(parsedData);
        const results = {
            inserted: 0,
            failed: 0,
            details: {}
        };
        const errors = [];

        // Insert Section 1
        if (transformed.innovativeTeaching.length > 0) {
            try {
                const inserted = await InnovativeTeaching.insertMany(transformed.innovativeTeaching);
                results.inserted += inserted.length;
                results.details.innovativeTeaching = `${inserted.length} rows inserted`;
            } catch (err) {
                results.failed++;
                results.details.innovativeTeaching = err.message;
                errors.push(`innovativeTeaching: ${err.message}`);
            }
        }

        // Insert Section 2
        if (transformed.eContents.length > 0) {
            try {
                const inserted = await EContent.insertMany(transformed.eContents);
                results.inserted += inserted.length;
                results.details.eContents = `${inserted.length} rows inserted`;
            } catch (err) {
                results.failed++;
                results.details.eContents = err.message;
                errors.push(`eContents: ${err.message}`);
            }
        }

        // Insert Section 3.1
        if (transformed.guestLectures.length > 0) {
            try {
                const inserted = await GuestLecture.insertMany(transformed.guestLectures);
                results.inserted += inserted.length;
                results.details.guestLectures = `${inserted.length} rows inserted`;
            } catch (err) {
                results.failed++;
                results.details.guestLectures = err.message;
                errors.push(`guestLectures: ${err.message}`);
            }
        }

        // Insert Section 3.2
        if (transformed.fdpOrganized.length > 0) {
            try {
                const inserted = await FDPOrganized.insertMany(transformed.fdpOrganized);
                results.inserted += inserted.length;
                results.details.fdpOrganized = `${inserted.length} rows inserted`;
            } catch (err) {
                results.failed++;
                results.details.fdpOrganized = err.message;
                errors.push(`fdpOrganized: ${err.message}`);
            }
        }

        // Insert Section 3.3
        if (transformed.courseFacilitator.length > 0) {
            try {
                const inserted = await CourseFacilitatorSession.insertMany(transformed.courseFacilitator);
                results.inserted += inserted.length;
                results.details.courseFacilitator = `${inserted.length} rows inserted`;
            } catch (err) {
                results.failed++;
                results.details.courseFacilitator = err.message;
                errors.push(`courseFacilitator: ${err.message}`);
            }
        }

        // Insert Section 4
        if (transformed.facultyEvents.length > 0) {
            try {
                const inserted = await FacultyEventAttended.insertMany(transformed.facultyEvents);
                results.inserted += inserted.length;
                results.details.facultyEvents = `${inserted.length} rows inserted`;
            } catch (err) {
                results.failed++;
                results.details.facultyEvents = err.message;
                errors.push(`facultyEvents: ${err.message}`);
            }
        }

        // Insert Section 5
        if (transformed.studentEvents.length > 0) {
            try {
                const inserted = await StudentEventAttended.insertMany(transformed.studentEvents);
                results.inserted += inserted.length;
                results.details.studentEvents = `${inserted.length} rows inserted`;
            } catch (err) {
                results.failed++;
                results.details.studentEvents = err.message;
                errors.push(`studentEvents: ${err.message}`);
            }
        }

        // Insert Section 6
        if (transformed.nptelMooc.length > 0) {
            try {
                const inserted = await NPTELMOOCCourse.insertMany(transformed.nptelMooc);
                results.inserted += inserted.length;
                results.details.nptelMooc = `${inserted.length} rows inserted`;
            } catch (err) {
                results.failed++;
                results.details.nptelMooc = err.message;
                errors.push(`nptelMooc: ${err.message}`);
            }
        }

        // Insert Section 7
        if (transformed.academicAchievements.length > 0) {
            try {
                const inserted = await AcademicAchievement.insertMany(transformed.academicAchievements);
                results.inserted += inserted.length;
                results.details.academicAchievements = `${inserted.length} rows inserted`;
            } catch (err) {
                results.failed++;
                results.details.academicAchievements = err.message;
                errors.push(`academicAchievements: ${err.message}`);
            }
        }

        const totalParsedRows =
            transformed.innovativeTeaching.length +
            transformed.eContents.length +
            transformed.guestLectures.length +
            transformed.fdpOrganized.length +
            transformed.courseFacilitator.length +
            transformed.facultyEvents.length +
            transformed.studentEvents.length +
            transformed.nptelMooc.length +
            transformed.academicAchievements.length;

        res.json({
            success: results.failed === 0,
            message:
                totalParsedRows === 0
                    ? 'No data rows found to insert. Please fill the template and try again.'
                    : results.failed === 0
                        ? `${results.inserted} records inserted successfully`
                        : `${results.inserted} records inserted, ${results.failed} section(s) failed`,
            results,
            errors
        });
    } catch (error) {
        res.status(500).json({ error: `Bulk insert failed: ${error.message}` });
    }
});

export default router;
