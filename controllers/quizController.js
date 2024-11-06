const { quizzes, results, Quiz } = require('../models/quizModel');

// Create a new quiz
exports.createQuiz = (req, res) => {
    const { title, questions } = req.body;
    if (!title || !questions || !questions.length) {
        return res.status(400).json({ error: "Title and questions are required" });
    }

    const quiz = new Quiz(title, questions);
    quizzes[quiz.id] = quiz;
    res.status(201).json({ quizId: quiz.id });
};

// Get quiz by ID (without answers)
exports.getQuiz = (req, res) => {
    const quizId = req.params.id;
    const quiz = quizzes[quizId];
    if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
    }

    const questions = quiz.questions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options
    }));

    res.json({ id: quiz.id, title: quiz.title, questions });
};

// Submit an answer to a quiz question
exports.submitAnswer = (req, res) => {
    const { quizId, questionId } = req.params;
    const { selectedOption } = req.body;

    const quiz = quizzes[quizId];
    if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
    }

    const question = quiz.questions.find(q => q.id == questionId);
    if (!question) {
        return res.status(404).json({ error: "Question not found" });
    }

    const isCorrect = question.correctOption === selectedOption;
    const feedback = isCorrect
        ? "Correct!"
        : `Incorrect. The correct answer is option ${question.correctOption}`;

    // Store the answer in the results
    if (!results[quizId]) {
        results[quizId] = {};
    }
    if (!results[quizId][req.body.userId]) {
        results[quizId][req.body.userId] = { score: 0, answers: [] };
    }

    results[quizId][req.body.userId].answers.push({
        questionId,
        selectedOption,
        isCorrect
    });

    if (isCorrect) results[quizId][req.body.userId].score += 1;

    res.json({ isCorrect, feedback });
};

// Get results for a quiz
exports.getResults = (req, res) => {
    const { quizId } = req.params;
    const { userId } = req.query;

    const userResults = results[quizId] && results[quizId][userId];
    if (!userResults) {
        return res.status(404).json({ error: "No results found for this user" });
    }

    res.json({
        quizId,
        userId,
        score: userResults.score,
        answers: userResults.answers
    });
};
