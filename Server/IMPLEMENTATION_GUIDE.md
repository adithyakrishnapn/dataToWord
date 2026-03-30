# DataToWord System Architecture & Implementation Guide

## Overview
The DataToWord backend is built to handle data collection for college academic activities across 5 pillars, generate comprehensive Word (.docx) reports, and manage image uploads.

**Current Implementation:** Pillar 1 - "Center for Learning and Teaching" (Fully Implemented)

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | Latest |
| Framework | Express.js | 5.2.1 |
| Database | MongoDB + Mongoose | 9.3.3 |
| File Upload | Multer | Latest |
| Document Generation | docx | Latest |
| Environment Management | dotenv | 17.3.1 |
| Dev Tool | Nodemon | 3.1.14 |

---

## Architecture

### Layer Model

```
┌─────────────────────────────────────┐
│      Client/Frontend               │
│  (Forms, Image Upload UI)           │
└────────────────┬────────────────────┘
                 │ HTTP Requests
                 ▼
┌─────────────────────────────────────┐
│    Express.js Routes Layer         │
│  (/pillar1/... endpoints)           │
└────────────────┬────────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│ Multer  │ │ Handlers│ │Controllers
│(Uploads)│ │ Routes  │ │
└────┬────┘ └────┬────┘ └──────┬───┘
     │           │             │
     ▼           ▼             ▼
┌────────────────────────────────────┐
│     Services Layer                │
│  DocumentGenerator, etc.          │
└────────────────┬───────────────────┘
                 │
┌────────────────┴───────────────────┐
│     Data Layer                     │
│  ├─ MongoDB Models/Schemas        │
│  ├─ Database Queries              │
│  └─ Data Validation               │
└────────────────────────────────────┘

┌──────────────────────────────────────┐
│    File System Layer                 │
│  ├─ /public/uploads (Images)         │
│  └─ Generated Documents (.docx)      │
└──────────────────────────────────────┘
```

### Data Flow for Document Generation

```
User Uploads Data
        │
        ├─ Section 1 Data → InnovativeTeaching Model
        ├─ Section 2 Data → EContent Model
        ├─ Section 3 Data → GuestLecture, FDP, CourseFacilitator Models
        ├─ Section 4 Data → FacultyEventAttended Model
        ├─ Section 5 Data → StudentEventAttended Model
        ├─ Section 6 Data → NPTELMOOCCourse Model
        └─ Section 7 Data → AcademicAchievement Model
                │
                ▼
        MongoDB Database
                │
        /pillar1/generate-report
                │
        DocumentGenerator.generateDocument()
                │
        ├─ Fetch all section data
        ├─ Create formatted tables
        ├─ Build document structure
        └─ Generate .docx buffer
                │
                ▼
        Return .docx file to client
```

---

## Pillar 1 Schema Structure

### Section 1: Innovative Teaching Methodologies
```
├── Department (String, required)
├── Course Code & Name (String, required)
├── Topic (String, required)
├── Teaching Method (String, required)
└── Image (File, optional)
```

### Section 2: E-Contents Developed
```
├── S.No (Number, required)
├── Branch (String, required)
├── YouTube Videos (Array of URLs)
└── Other E-Contents (Array of objects with title, link, type)
```

### Section 3.1-3.3: Organized Events
```
├── Subsection 1: Guest Lectures
│   ├── S.No, Department, Title, Guest Name, Date, Image
├── Subsection 2: FDPs Organized
│   ├── S.No, Department, Title, Sponsored Agency, Beneficiaries, Image
└── Subsection 3: Course Facilitator Sessions
    ├── S.No, Department, Course, Facilitator, Date, Image
```

### Section 4: Faculty Events Attended
```
├── S.No (Number)
├── Faculty Name (String)
├── Department (String)
├── Event Type (Enum: Workshop, Seminar, Guest Lecture, FDP, Others)
├── Event Title (String)
├── Online/Offline (Enum)
├── Organizer Details (String)
├── Place (String)
├── Date (Date)
└── Certificate (File, optional)
```

### Section 5: Student Events Attended
```
├── S.No (Number)
├── Student Names (Array)
├── Department (String)
├── Event Type (Enum)
├── Event Title (String)
├── Online/Offline (Enum)
├── Organizer Details (String)
├── Place (String)
├── Date (Date)
└── Number of Students (Number)
```

### Section 6: NPTEL/MOOC Courses
```
├── Category (Enum: Faculty, Student)
├── S.No (Number)
├── Name of Person (String)
├── Department/Class (String)
├── Platform (String)
├── Course Name (String)
├── Duration (String)
├── Score/Completion Date (String)
└── Certificate (File, optional)
```

### Section 7: Academic Achievements
```
├── S.No (Number)
├── Branch (String)
├── Semester/Year (String)
├── Appeared (Number)
├── Graduated (Number)
└── Graduation % (Calculated)
```

---

## Document Generation Process

### DocumentGenerator Service

The `DocumentGenerator.js` service handles all .docx creation:

1. **Table Creation Methods**
   - `createSection1Table()`: Innovative Teaching table
   - `createSection2Table()`: E-Contents table
   - `createSection3GuestLecturesTable()`: Guest Lectures table
   - `createSection3FDPTable()`: FDPs table
   - `createSection4Table()`: Faculty Events table
   - `createSection5Table()`: Student Events table
   - `createSection6Table()`: NPTEL/MOOC table
   - `createSection7Table()`: Academic Achievements table

2. **Main Method: `generateDocument(pillar1Data)`**
   - Fetches all section data
   - Creates formatted section headings
   - Generates tables for each section
   - Builds document with proper spacing and formatting
   - Returns .docx buffer

3. **Document Structure**
   - Title: "ANNUAL REPORT - CENTER FOR LEARNING AND TEACHING"
   - 7 numbered sections with headers
   - Each section has formatted table with headers
   - Proper spacing between sections
   - Professional formatting (bold headers, centered titles)

---

## File Upload System

### Multer Configuration (`multerConfig.js`)

```
Upload Flow:
┌──────────────┐
│  Client File │◄──────┐
└──────┬───────┘       │
       │               │ Form Data
       ▼               │
┌──────────────────┐   │
│ Multer Middleware├───┤
│ - Validates file │   │
│ - Stores to disk │   │
│ - Renames file   │   │
└──────┬───────────┘   │
       │               │
       ▼               │
/public/uploads/   ◄───┘
[timestamp-random].jpg
       │
       ▼
Path Stored in
MongoDB Document
```

**Configuration Details:**
- **Storage Location:** `Server/public/uploads/`
- **File Naming:** `fieldname-timestamp-random.extension`
- **Size Limit:** 5MB per file
- **Allowed Types:** JPEG, PNG, GIF, WebP
- **Access URL:** `/uploads/{filename}`

---

## API Response Patterns

### Success Response (201 Created)
```json
{
  "message": "Resource added successfully",
  "data": {
    "_id": "ObjectId",
    "field1": "value1",
    "field2": "value2",
    "createdAt": "2024-03-30T10:00:00Z"
  }
}
```

### Success Response (200 OK - GET)
```json
[
  {
    "_id": "ObjectId",
    "field1": "value1",
    "createdAt": "2024-03-30T10:00:00Z"
  },
  {
    "_id": "ObjectId",
    "field1": "value2",
    "createdAt": "2024-03-30T10:05:00Z"
  }
]
```

### Error Response (500 Server Error)
```json
{
  "error": "Database connection failed"
}
```

---

## Deployment Considerations

### Environment Variables Required
```
DB_URL=mongodb+srv://user:password@cluster.mongodb.net/?appName=Cluster0
PORT=5000
NODE_ENV=production (optional)
```

### Folder Prerequisites
- `/public/uploads/` - Created automatically by multerConfig.js
- `/node_modules/` - Created by npm install
- `/models/` - Mongoose schemas
- `/services/` - Business logic

### Database Setup
1. Create MongoDB Atlas account
2. Create cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Add to .env file

---

## Scaling for Additional Pillars

To add Pillar 2, 3, 4, 5:

1. **Create Models**
   ```javascript
   // models/Pillar2_Section1.js
   // Create schema for each section
   ```

2. **Create Routes**
   ```javascript
   // routes/pillar2Routes.js
   // Create endpoints following pattern
   ```

3. **Update Main Routes**
   ```javascript
   // routes/index.js
   import pillar2Routes from './pillar2Routes.js';
   router.use('/pillar2', pillar2Routes);
   ```

4. **Update Document Generator**
   ```javascript
   // DocumentGenerator.js - Add new sections
   static createPillar2Table() { ... }
   ```

---

## Performance Optimization Notes

1. **Database Indexing**
   - Add indexes on frequently queried fields
   - Example: `department`, `eventType`, `date`

2. **Pagination**
   - For large datasets, implement pagination in GET endpoints
   - Add `limit` and `skip` parameters

3. **Caching**
   - Cache generated documents
   - Use Redis for session management

4. **File Optimization**
   - Compress images before storage
   - Set image size limits

5. **Document Generation**
   - For large reports, use streaming
   - Generate in background for very large datasets

---

## Future Enhancements

1. **User Authentication**
   - JWT-based auth
   - Role-based access control

2. **Data Export**
   - Export to Excel, PDF
   - Schedule automatic exports

3. **Analytics**
   - Dashboard for metrics
   - Charts for trends

4. **Notifications**
   - Email alerts for submissions
   - WebSocket for real-time updates

5. **Cloud Storage**
   - Move uploads to AWS S3
   - CDN for better performance
