import express, { Application } from 'express';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import logger from './utils/logger.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;