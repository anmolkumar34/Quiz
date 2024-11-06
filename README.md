# Quiz App API -
This project is a backend API for a quiz application that allows users to answer multiple-choice questions and receive feedback on their performance. It uses **Node.js**, **Express**, and **Docker** for containerization.

# Prerequisites -
Before you run this project, make sure you have the following installed:
1. docker
2. docker-compose
3. Node.js

# Setup:
1. Clone the entire repository to a new folder on desktop.
2. If running locally try installing all the dependencies using command - npm install
3. After installing all the dependencies, you can start the service by using - npm start.
3. If running with docker-compose use this command from root - docker-compose up --build

# Quiz Api's
1. Create Quiz -
- Method - POST /quiz
- Description - Creates a new quiz with a title and a list of questions.
- Request body
```json
{
    "title": "General Knowledge Quiz",
    "questions": [
        {
            "text": "What is 2 + 2?",
            "options": ["1", "2", "3", "4"],
            "correct_option": 3
        },
        {
            "text": "What is the capital of France?",
            "options": ["Berlin", "Madrid", "Paris", "Rome"],
            "correct_option": 2
        }
    ]
}
```
- Response body
```json
{
    "quizId": "c0d77e16-925b-4e16-99a4-a4cda490af26"
}
```

2. Get Quiz -
- Method - GET /quiz/:quizId
- Description - Retrieves the quiz by its ID. Does not include the correct answers.
- Response body

```json
{
    "id": "1",
    "title": "General Knowledge Quiz",
    "questions": [
        {
            "id": "1",
            "text": "What is 2 + 2?",
            "options": ["1", "2", "3", "4"]
        },
        {
            "id": "2",
            "text": "What is the capital of France?",
            "options": ["Berlin", "Madrid", "Paris", "Rome"]
        }
    ]
}
```

3. Submit Answer -
- Method - POST /quiz/:quizId/questions/:questionNumber/answer
- Description - Submits an answer for a specific question in the quiz. Returns feedback on whether the answer was correct.
- Request body
```json
{
  "selectedOption": 1,
  "userId": "anm123"
}
```
- Response body
```json
{
    "isCorrect": false,
    "feedback": "Incorrect. The correct answer is option 3"
}
```

4. Get Results -
- Method - GET /quiz/:quizId/results?userId=:userId
- Description - Retrieves the user's results for the quiz, including the score and summary of correct/incorrect answers.
- Response body

```json
{
    "quizId": "fbcb57e9-e2fe-4523-86b1-9e99dd6e58e5",
    "userId": "anm123",
    "score": 0,
    "answers": [
        {
            "questionId": "1",
            "selectedOption": 1,
            "isCorrect": false
        }
    ]
}
```