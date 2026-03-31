import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
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
import DocumentGenerator from '../services/DocumentGenerator.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reportsDir = path.join(__dirname, '..', 'public', 'reports');

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

// ==================== SECTION 1: INNOVATIVE TEACHING METHODOLOGIES ====================
router.post('/innovative-teaching', upload.single('image'), async (req, res) => {
    try {
        const { department, courseCode, courseName, topic, teachingMethod, month, academicYear } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const teaching = new InnovativeTeaching({
            department,
            courseCode,
            courseName,
            topic,
            teachingMethod,
            month,
            academicYear,
            imagePath
        });

        await teaching.save();
        res.status(201).json({ message: 'Innovative teaching methodology added', data: teaching });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/innovative-teaching', async (req, res) => {
    try {
        const data = await InnovativeTeaching.find();
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
        const data = await EContent.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 3.1: GUEST LECTURES ORGANIZED ====================
router.post('/guest-lectures', upload.single('image'), async (req, res) => {
    try {
        const { department, workshopTitle, date, guestName, guestDesignation, month, academicYear } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const lecture = new GuestLecture({
            department,
            workshopTitle,
            date,
            guestName,
            guestDesignation,
            month,
            academicYear,
            imagePath
        });

        await lecture.save();
        res.status(201).json({ message: 'Guest lecture added', data: lecture });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/guest-lectures', async (req, res) => {
    try {
        const data = await GuestLecture.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 3.2: FDPs ORGANIZED ====================
router.post('/fdps-organized', upload.single('image'), async (req, res) => {
    try {
        const { department, fdpTitle, date, sponsoredAgency, sponsoredAmount, numberOfBeneficiaries, month, academicYear } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const fdp = new FDPOrganized({
            department,
            fdpTitle,
            date,
            sponsoredAgency,
            sponsoredAmount,
            numberOfBeneficiaries,
            month,
            academicYear,
            imagePath
        });

        await fdp.save();
        res.status(201).json({ message: 'FDP added', data: fdp });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/fdps-organized', async (req, res) => {
    try {
        const data = await FDPOrganized.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 3.3: COURSE FACILITATOR SESSIONS ====================
router.post('/course-facilitator-sessions', upload.single('image'), async (req, res) => {
    try {
        const { department, courseName, date, facilitatorName, facilitatorDesignation, facilitatorInstitution, numberOfStudents, month, academicYear } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

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
            imagePath
        });

        await session.save();
        res.status(201).json({ message: 'Course facilitator session added', data: session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/course-facilitator-sessions', async (req, res) => {
    try {
        const data = await CourseFacilitatorSession.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 4: FACULTY EVENTS ATTENDED ====================
router.post('/faculty-events', upload.single('certificate'), async (req, res) => {
    try {
        const { facultyName, department, eventType, eventTitle, onlineOffline, organizerDetails, placeOfEvent, date, month, academicYear } = req.body;
        const certificatePath = req.file ? `/uploads/${req.file.filename}` : null;

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
            certificatePath
        });

        await event.save();
        res.status(201).json({ message: 'Faculty event added', data: event });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/faculty-events', async (req, res) => {
    try {
        const data = await FacultyEventAttended.find();
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
        const data = await StudentEventAttended.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 6: NPTEL/MOOC COURSES ====================
router.post('/nptel-mooc', upload.single('certificate'), async (req, res) => {
    try {
        const { category, nameOfPerson, classOrDepartment, platform, courseName, duration, scoreOrCompletionDate, month, academicYear } = req.body;
        const certificatePath = req.file ? `/uploads/${req.file.filename}` : null;

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
            certificatePath
        });

        await course.save();
        res.status(201).json({ message: 'NPTEL/MOOC course added', data: course });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/nptel-mooc', async (req, res) => {
    try {
        const data = await NPTELMOOCCourse.find();
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
        const data = await AcademicAchievement.find();
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
            academicAchievements
        ] = await Promise.all([
            InnovativeTeaching.find(),
            EContent.find(),
            GuestLecture.find(),
            FDPOrganized.find(),
            CourseFacilitatorSession.find(),
            FacultyEventAttended.find(),
            StudentEventAttended.find(),
            NPTELMOOCCourse.find(),
            AcademicAchievement.find()
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

        const docBuffer = await DocumentGenerator.generateDocument(pillar1Data);
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

export default router;
