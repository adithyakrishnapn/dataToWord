import mongoose from 'mongoose';

const academicAchievementSchema = new mongoose.Schema({
    serialNo: {
        type: Number,
        required: false,
        default: null
    },
    branch: {
        type: String,
        required: true
    },
    semesterYear: {
        type: String,
        required: true
    },
    appeared: {
        type: Number,
        required: true
    },
    graduated: {
        type: Number,
        required: true
    },
    graduationPercentage: {
        type: Number,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('AcademicAchievement', academicAchievementSchema);
