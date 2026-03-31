import mongoose from 'mongoose';

const innovativeTeachingSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    courseCode: {
        type: String,
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    teachingMethod: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        enum: ['1st year', '2nd year', '3rd year', 'final year'],
        required: true
    },
    month: {
        type: String,
        required: true
    },
    imagePath: {
        type: String, // path to uploaded image
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('InnovativeTeachingMethodology', innovativeTeachingSchema);
