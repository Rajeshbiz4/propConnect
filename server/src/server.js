import app from './app.js';
import { connectDB } from './config/db.js';

const port = Number(process.env.PORT || 5000);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`PropConnect API running on http://localhost:${port}`);
      console.log(`Swagger UI: http://localhost:${port}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('Failed to start API:', error);
    process.exit(1);
  });
