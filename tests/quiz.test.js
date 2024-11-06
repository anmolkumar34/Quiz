const request = require('supertest');
const express = require('express');
const app = express();
const quizRoutes = require('../routes/quizRoutes');

// Mock the app and routes
app.use(express.json());
app.use('/api/quiz', quizRoutes);

describe("Quiz API", () => {
    // Test data
    const quizData = {
        title: "Sample Quiz",
        questions: [
            {
                text: "What is 2 + 2?",
                options: ["1", "2", "3", "4"],
                correctOption: 3
            },
            {
                text: "What is the capital of France?",
                options: ["Paris", "London", "Berlin", "Rome"],
                correctOption: 0
            }
        ]
    };

    let quizId;

    // Test the createQuiz endpoint
    describe("POST /api/quiz", () => {
        it("should create a new quiz and return its ID", async () => {
            const response = await request(app)
                .post('/api/quiz')
                .send(quizData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("quizId");
            quizId = response.body.quizId;
        });

        it("should fail to create a quiz with invalid data", async () => {
            const response = await request(app)
                .post('/api/quiz')
                .send({ title: "Incomplete Quiz" }); // Missing questions

            expect(response.status).toBe(422);
            expect(response.body.errors).toBeDefined();
        });
    });

    // Test the getQuiz endpoint
    describe("GET /api/quiz/:id", () => {
        it("should fetch the quiz without revealing correct answers", async () => {
            const response = await request(app).get(`/api/quiz/${quizId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id", quizId);
            expect(response.body).toHaveProperty("title", quizData.title);
            expect(response.body).toHaveProperty("questions");

            response.body.questions.forEach((question, index) => {
                expect(question).toHaveProperty("id");
                expect(question).toHaveProperty("text", quizData.questions[index].text);
                expect(question).toHaveProperty("options", quizData.questions[index].options);
                expect(question).not.toHaveProperty("correctOption"); // correctOption should not be exposed
            });
        });

        it("should return 404 for a non-existing quiz", async () => {
            const response = await request(app).get('/api/quiz/non-existing-id');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Quiz not found");
        });
    });

    // Test the submitAnswer endpoint
    describe("POST /api/quiz/:quizId/questions/:questionId/answer", () => {
        let questionId;

        beforeAll(async () => {
            // Fetch the quiz to get a question ID for testing
            const quizResponse = await request(app).get(`/api/quiz/${quizId}`);
            questionId = quizResponse.body.questions[0].id;
        });

        it("should return feedback for correct answers", async () => {
            const response = await request(app)
                .post(`/api/quiz/${quizId}/questions/${questionId}/answer`)
                .send({ selectedOption: 3, userId: "test-user" }); // 3 is the correct answer

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("isCorrect", true);
            expect(response.body).toHaveProperty("feedback", "Correct!");
        });

        it("should return feedback for incorrect answers", async () => {
            const response = await request(app)
                .post(`/api/quiz/${quizId}/questions/${questionId}/answer`)
                .send({ selectedOption: 0, userId: "test-user" }); // 0 is the wrong answer

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("isCorrect", false);
            expect(response.body.feedback).toContain("Incorrect");
        });

        it("should return 404 for a non-existing question", async () => {
            const response = await request(app)
                .post(`/api/quiz/${quizId}/questions/non-existing-id/answer`)
                .send({ selectedOption: 0, userId: "test-user" });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Question not found");
        });
    });

    // Test the getResults endpoint
    describe("GET /api/quiz/:quizId/results", () => {
        it("should return the user’s results for a quiz", async () => {
            const response = await request(app)
                .get(`/api/quiz/${quizId}/results`)
                .query({ userId: "test-user" });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("quizId", quizId);
            expect(response.body).toHaveProperty("userId", "test-user");
            expect(response.body).toHaveProperty("score");
            expect(response.body).toHaveProperty("answers");
        });

        it("should return 404 if no results found for the user", async () => {
            const response = await request(app)
                .get(`/api/quiz/${quizId}/results`)
                .query({ userId: "non-existing-user" });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "No results found for this user");
        });
    });
});
