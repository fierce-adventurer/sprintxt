import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

try {
  const swaggerDocument = YAML.load(path.join(__dirname, './docs/swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(`📖 Swagger UI initialized at http://localhost:${PORT}/api-docs`);
} catch (error) {
  console.error('⚠️ Failed to load Swagger documentation:', error);
}

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 ProWriter Backend Proxy running on port ${PORT}`);
});