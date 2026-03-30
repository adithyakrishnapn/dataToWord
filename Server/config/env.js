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

export default {
    dbUrl,
    port
}