var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* health check */
router.get('/api', function(req, res, next) {
  res.send('Backend runs successfully!');
});

router.get('/api/dogs', async (req, res) => {
  try {
    const db = req.app.locals.db;

    const [rows] = await db.execute(`
      SELECT
        d.name AS dog_name,
        d.size,
        u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);

    res.json(rows);

  } catch (err) {
    console.error('Error fetching /api/dogs:', err);
    res.status(500).json({ error: 'Failed to fetch dogs.' });
  }
});


module.exports = router;
