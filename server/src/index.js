require('dotenv/config');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const uploadRouter = require('./routes/upload');
const competitorsRouter = require('./routes/competitors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/upload', uploadRouter);
app.use('/api/competitors', competitorsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
