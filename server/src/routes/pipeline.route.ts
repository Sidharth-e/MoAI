import express from 'express';
import Pipeline from '../models/pipeline';

const router = express.Router();

// Create pipeline
router.post('/', async (req, res) => {
  try {
    const pipeline = new Pipeline(req.body);
    await pipeline.save();
    res.status(201).json(pipeline);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Get all pipelines
router.get('/', async (req, res) => {
  try {
    const pipelines = await Pipeline.find().populate('steps');
    res.json(pipelines);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get pipeline by ID
router.get('/:id', async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id).populate('steps');
    if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });
    res.json(pipeline);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Update pipeline
router.put('/:id', async (req, res) => {
  try {
    const pipeline = await Pipeline.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('steps');
    if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });
    res.json(pipeline);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Delete pipeline
router.delete('/:id', async (req, res) => {
  try {
    const pipeline = await Pipeline.findByIdAndDelete(req.params.id);
    if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });
    res.json({ message: 'Pipeline deleted' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router; 