# DataToWord Frontend

Production-style React frontend for Pillar 1 data entry and annual report download.

## Stack
- React + Vite
- Axios for API calls
- Feature-driven folder structure

## Folder Structure

```text
src/
	app/
	routes/
	services/
	hooks/
	utils/
	components/ui/
	features/pillar1/
		components/
		forms/
	styles/
```

## Environment

Create `.env` in `Frontend` if backend URL differs:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Features Included
- Full Pillar 1 section forms mapped to backend endpoints
- Upload support for images/certificates
- Reusable API layer (`src/services/pillar1Api.js`)
- One-click `.docx` report download from `/pillar1/generate-report`

## Backend Requirements
- Backend server running at `http://localhost:5000`
- CORS enabled on backend
- MongoDB connection working

## Download Flow
1. Enter data in required sections.
2. Click `Download .docx Report`.
3. Browser downloads `Annual_Report_Learning_Teaching.docx`.
