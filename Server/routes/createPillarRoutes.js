import express from 'express';
import PillarSectionRecord from '../models/PillarSectionRecord.js';
import upload from '../config/multerConfig.js';

function toSafeValue(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function parseDataField(data) {
  if (data === null || data === undefined) {
    return {};
  }

  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) {
      return {};
    }
    try {
      const parsed = JSON.parse(trimmed);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }

  if (typeof data === 'object') {
    return data;
  }

  return {};
}

export default function createPillarRoutes(pillarNumber, pillarName) {
  const router = express.Router();

  router.get('/records/:sectionKey', async (req, res) => {
    try {
      const { sectionKey } = req.params;
      const query = {
        pillarNumber,
        sectionKey,
      };

      if (req.query.month) {
        query.month = req.query.month;
      }

      const records = await PillarSectionRecord.find(query).sort({ department: 1, createdAt: -1 });
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/records', upload.single('image'), async (req, res) => {
    try {
      const { sectionKey, sectionTitle, department, month, academicYear, data } = req.body;
      const parsedData = parseDataField(data);
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

      const created = await PillarSectionRecord.create({
        pillarNumber,
        pillarName,
        sectionKey: toSafeValue(sectionKey),
        sectionTitle: toSafeValue(sectionTitle),
        department: toSafeValue(department) || '',
        month: toSafeValue(month),
        academicYear: toSafeValue(academicYear),
        data: parsedData,
        imagePath,
      });

      res.status(201).json({ message: 'Created', data: created });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/records/:id', upload.single('image'), async (req, res) => {
    try {
      const { id } = req.params;
      const { department, month, academicYear, data } = req.body;
      const parsedData = parseDataField(data);

      const updateData = {
        data: parsedData,
      };

      if (department !== undefined) {
        updateData.department = toSafeValue(department) || '';
      }
      if (month !== undefined) {
        updateData.month = toSafeValue(month);
      }
      if (academicYear !== undefined) {
        updateData.academicYear = toSafeValue(academicYear);
      }
      if (req.file) {
        updateData.imagePath = `/uploads/${req.file.filename}`;
      }

      const updated = await PillarSectionRecord.findOneAndUpdate(
        { _id: id, pillarNumber },
        updateData,
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Record not found' });
      }

      res.status(200).json({ message: 'Updated', data: updated });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/records/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await PillarSectionRecord.findOneAndDelete({ _id: id, pillarNumber });

      if (!deleted) {
        return res.status(404).json({ error: 'Record not found' });
      }

      res.status(200).json({ message: 'Deleted', data: deleted });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
