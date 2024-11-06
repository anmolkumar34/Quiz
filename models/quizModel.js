const { v4: uuidv4 } = require('uuid');

// In-memory storage for quizzes and results
const quizzes = {};
const results = {};

class Quiz {
    constructor(title, questions) {
        this.id = uuidv4();
        this.title = title;
        this.questions = questions.map((q, index) => ({
            id: index + 1,
            text: q.text,
            options: q.options,
            correctOption: q.correctOption
        }));
    }
}

module.exports = { quizzes, results, Quiz };
