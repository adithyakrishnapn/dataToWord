import mongoose from 'mongoose';

const PillarSectionRecordSchema = new mongoose.Schema(
  {
    pillarNumber: {
      type: Number,
      required: true,
      enum: [2, 3, 4, 5],
    },
    pillarName: {
      type: String,
      required: true,
      trim: true,
    },
    sectionKey: {
      type: String,
      required: true,
      trim: true,
    },
    sectionTitle: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    month: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: String,
      enum: ['1st year', '2nd year', '3rd year', 'final year'],
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    imagePath: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

PillarSectionRecordSchema.index({ pillarNumber: 1, sectionKey: 1, month: 1 });

export default mongoose.model('PillarSectionRecord', PillarSectionRecordSchema);
