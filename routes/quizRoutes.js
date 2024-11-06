const express = require('express');
const { body, param, query, validationResult} = require('express-validator');
const router = express.Router();
const quizController = require('../controllers/quizController');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next()
    }
    let errorArray = errors.array() || [];
    let errorMessage = (errorArray[0] && errorArray[0].msg) || "Some error occurred due to failing in validation.";
    return res.status(422).json({ errors: errorMessage });
};

// Validation rules for creating a new quiz
const quizValidation = [
    body('title').notEmpty().withMessage('Title is required'),
    body('questions').isArray({ min: 1 }).withMessage('Questions must be a non-empty array'),
    body('questions.*.text').notEmpty().withMessage('Question text is required'),
    body('questions.*.options').isArray({ min: 4, max: 4 }).withMessage('Each question must have exactly 4 options'),
    body('questions.*.correctOption').isInt({ min: 0, max: 3 }).withMessage('Correct option must be an index between 0 and 3')
];

// Validation rules for submitting an answer
const answerValidation = [
    param('quizId').isUUID().withMessage('Quiz ID must be a valid UUID'),
    param('questionId').isUUID().withMessage('Question ID must be a valid UUID'),
    body('selectedOption').isInt({ min: 0, max: 3 }).withMessage('Selected option must be an index between 0 and 3'),
    body('userId').notEmpty().withMessage('User ID is required')
];

// Validation rules for getting a quiz by ID
const getQuizValidation = [
    param('id').isUUID().withMessage('Quiz ID must be a valid UUID')
];

// Validation rules for getting quiz results
const getResultsValidation = [
    param('quizId').isUUID().withMessage('Quiz ID must be a valid UUID'),
    query('userId').notEmpty().withMessage('User ID is required')
];

// Routes
router.post('/', quizValidation, handleValidationErrors, quizController.createQuiz);
router.get('/:id', getQuizValidation, quizController.getQuiz);
router.post('/:quizId/questions/:questionId/answer', answerValidation, quizController.submitAnswer);
router.get('/:quizId/results', getResultsValidation, quizController.getResults);

module.exports = router;
