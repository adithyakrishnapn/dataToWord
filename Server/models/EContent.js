import mongoose from 'mongoose';

const otherEContentItemSchema = new mongoose.Schema(
    {
        title: { type: String, default: '' },
        link: { type: String, default: '' },
        type: { type: String, default: 'other' }
    },
    { _id: false }
);

const eContentSchema = new mongoose.Schema({
    serialNo: {
        type: Number,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    youtubeVideoCount: {
        type: Number,
        default: 0
    },
    youtubeVideoLinks: {
        type: [String],
        default: []
    },
    otherEContents: {
        type: [otherEContentItemSchema],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('EContent', eContentSchema);
