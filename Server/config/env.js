import dotenv from "dotenv";
dotenv.config();

function required(name) {
    const value = process.env[name];
    if(!value) {
        throw new Error(`Missing env var ${name}`);
    }
    return value;
}


const dbUrl = required("DB_URL");
const port = required("PORT");
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const geminiApiUrl = process.env.GEMINI_API_URL || '';
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const summaryProvider = process.env.SUMMARY_PROVIDER || 'local';

export default {
    dbUrl,
    port,
    geminiApiKey,
    geminiApiUrl,
    geminiModel,
    summaryProvider
}