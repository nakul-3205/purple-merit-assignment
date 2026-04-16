const router = require('express').Router();
const { body, param } = require('express-validator');
const userCtrl = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../constants/roles');

const idParam = param('id').isMongoId().withMessage('Invalid user ID');

const createValidation = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
];

const updateValidation = [
  idParam,
  body('name').optional().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
];

// All routes require authentication
router.use(authenticate);

router.get('/stats', authorize(ROLES.ADMIN, ROLES.MANAGER), userCtrl.getStats);
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), userCtrl.listUsers);
router.post('/', authorize(ROLES.ADMIN), createValidation, validate, userCtrl.createUser);

router.get('/:id', [idParam, validate], userCtrl.getUser);
router.put('/:id', updateValidation, validate, userCtrl.updateUser);
router.delete('/:id', authorize(ROLES.ADMIN), [idParam, validate], userCtrl.deleteUser);
router.patch('/:id/status', authorize(ROLES.ADMIN), [idParam, validate], userCtrl.toggleUserStatus);

module.exports = router;
