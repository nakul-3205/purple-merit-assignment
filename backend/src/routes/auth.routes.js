const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authCtrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/login', loginLimiter, loginValidation, validate, authCtrl.login);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', authenticate, authCtrl.logout);
router.get('/me', authenticate, authCtrl.me);

module.exports = router;
