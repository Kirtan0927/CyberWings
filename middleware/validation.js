const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Membership registration validation rules
const memberValidation = [
  body('fullname').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('student_id').trim().notEmpty().withMessage('Student ID is required.'),
  body('academic_year')
    .isIn(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'])
    .withMessage('Valid academic year is required.'),
  body('major').trim().notEmpty().withMessage('Major is required.'),
  body('experience')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .withMessage('Invalid experience level.'),
  validate,
];

// Contact form validation rules
const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ min: 10 }).withMessage('Message must be at least 10 characters.'),
  validate,
];

// Speaker application validation rules
const speakerValidation = [
  body('fullname').trim().notEmpty().withMessage('Full name is required.'),
  body('email').trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('topic').trim().notEmpty().withMessage('Talk topic is required.'),
  validate,
];

// Event creation validation
const eventValidation = [
  body('title').trim().notEmpty().withMessage('Event title is required.'),
  body('event_date').isDate().withMessage('Valid event date is required.'),
  body('category')
    .optional()
    .isIn(['workshops', 'competitions', 'meetups', 'other'])
    .withMessage('Invalid category.'),
  validate,
];

module.exports = { memberValidation, contactValidation, speakerValidation, eventValidation };
