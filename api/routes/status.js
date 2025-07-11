const express = require('express');
const router = express.Router();
const redisClient = require('../queue/redisClient');

router.get('/:id', async (req, res) => {
  const jobId = req.params.id;

  try {
    const data = await redisClient.hget('jobStatus', jobId);

    if (!data) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.status(200).json(JSON.parse(data));
  } catch (err) {
    console.error('Error fetching job status:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
