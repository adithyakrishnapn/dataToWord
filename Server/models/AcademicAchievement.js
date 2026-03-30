import mongoose from 'mongoose';

const academicAchievementSchema = new mongoose.Schema({
    serialNo: {
        type: Number,
        required: true
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('AcademicAchievement', academicAchievementSchema);
