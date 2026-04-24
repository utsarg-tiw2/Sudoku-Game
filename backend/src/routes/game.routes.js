const express      = require('express');
const router       = express.Router();
const ctrl         = require('../controllers/game.controller');
const authenticate = require('../middlewares/auth.middleware');
 
router.use(authenticate);   // all game routes require login
 
router.get   ('/new',                 ctrl.newGame);
router.get   ('/active/:difficulty',  ctrl.getGame);
router.put   ('/:id/move',            ctrl.saveMove);
router.post  ('/:id/complete',        ctrl.complete);
router.get   ('/history',             ctrl.history);
 
module.exports = router;
 
