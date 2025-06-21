var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* health check */
router.get('/api', function(req, res, next) {
  res.send('index', { title: 'Express' });
});

module.exports = router;
