import connectDB from '../config/db.js';
import app from './app.js';
import env from '../config/env.js';


async function startServer() {
    await connectDB();
    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);
    });
}

startServer().catch((err) => {
    console.error('Error starting server:', err);
});