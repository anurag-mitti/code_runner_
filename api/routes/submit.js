const express = require('express');
const router = express.Router();

const validateJob = require('../utils/validateJob');
const pushJobToQueue = require('../queue/producer');
const { v4: uuidv4 } = require('uuid');


router.post('/', async (req, res) => {
  const jobData = req.body;
  const validation = validateJob(jobData);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const jobId = uuidv4();
  const job = {
    id: jobId,
    ...jobData,
    status: 'queued',
    submittedAt: Date.now(),
  };

  try {
    await pushJobToQueue(job);
    return res.status(200).json({ jobId, status: 'queued' });
  } catch (err) {
    console.error('Error pushing job to queue:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
