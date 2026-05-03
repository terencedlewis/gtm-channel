const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const ExcelJS = require('exceljs');
const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/json',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const ALLOWED_EXTENSIONS = ['.csv', '.json', '.xlsx', '.xls'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Unsupported file type: ${ext}. Allowed: .csv, .json, .xlsx, .xls`));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Parse CSV file into array of objects
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Parse XLSX/XLS file into array of objects
async function parseExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  const rows = [];
  let headers = [];

  worksheet.eachRow((row, rowNumber) => {
    const values = row.values.slice(1); // ExcelJS row.values[0] is undefined
    if (rowNumber === 1) {
      headers = values.map(String);
    } else {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] !== undefined ? values[i] : null;
      });
      rows.push(obj);
    }
  });
  return rows;
}

// POST /api/upload
router.post('/', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  let parsedData = [];

  try {
    if (ext === '.csv') {
      parsedData = await parseCSV(filePath);
    } else if (ext === '.json') {
      const raw = fs.readFileSync(filePath, 'utf-8');
      parsedData = JSON.parse(raw);
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }
    } else if (ext === '.xlsx' || ext === '.xls') {
      parsedData = await parseExcel(filePath);
    }

    // Clean up uploaded temp file
    fs.unlinkSync(filePath);

    const insight = await prisma.customerInsight.create({
      data: {
        fileName: req.file.originalname,
        persona: req.body.persona || null,
        rawData: JSON.stringify(parsedData),
      },
    });

    res.status(201).json({
      message: 'File uploaded and processed successfully.',
      insightId: insight.id,
      rowCount: parsedData.length,
      data: parsedData,
    });
  } catch (err) {
    // Clean up file if parsing fails
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    next(err);
  }
});

// GET /api/upload (list all insights)
router.get('/', async (_req, res, next) => {
  try {
    const insights = await prisma.customerInsight.findMany({
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        persona: true,
        uploadedAt: true,
        rawData: true,
      },
    });

    const result = insights.map((insight) => ({
      ...insight,
      data: JSON.parse(insight.rawData),
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
