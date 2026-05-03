const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /api/competitors
router.get('/', async (_req, res, next) => {
  try {
    const competitors = await prisma.competitor.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const result = competitors.map((c) => ({
      ...c,
      features: JSON.parse(c.features),
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/competitors
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Competitor name is required.'),
    body('pricing')
      .isFloat({ min: 0 })
      .withMessage('Pricing must be a non-negative number.'),
    body('features')
      .isArray({ min: 1 })
      .withMessage('Features must be a non-empty array of strings.'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, pricing, features } = req.body;
      const competitor = await prisma.competitor.create({
        data: {
          name,
          pricing: parseFloat(pricing),
          features: JSON.stringify(features),
        },
      });
      res.status(201).json({ ...competitor, features });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/competitors/:id
router.delete('/:id', async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID.' });

  try {
    await prisma.competitor.delete({ where: { id } });
    res.json({ message: 'Competitor deleted.' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Competitor not found.' });
    }
    next(err);
  }
});

module.exports = router;
