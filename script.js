// Password Strength Tester
document.addEventListener('DOMContentLoaded', function() {
    // Password tester
    const passwordInput = document.getElementById('password');
    const testButton = document.getElementById('test-password');
    const resultDiv = document.getElementById('strength-result');

    if (testButton) {
        testButton.addEventListener('click', function() {
            const password = passwordInput.value.trim();
            const result = evaluatePasswordStrength(password);

            resultDiv.innerHTML = `<p>Password Strength: <strong>${result.strength}</strong></p>`;
            if (result.warning) {
                resultDiv.innerHTML += `<p><em>${result.warning}</em></p>`;
            }
            if (result.suggestions.length > 0) {
                resultDiv.innerHTML += "<p>Suggestions:</p><ul>";
                result.suggestions.forEach(item => {
                    resultDiv.innerHTML += `<li>${item}</li>`;
                });
                resultDiv.innerHTML += "</ul>";
            }
        });
    }

    function evaluatePasswordStrength(password) {
        const suggestions = [];
        let score = 0;

        if (password.length >= 12) score += 2;
        else if (password.length >= 8) score += 1;
        else suggestions.push("Use at least 8 characters.");

        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
        else suggestions.push("Mix upper and lower case letters.");

        if (/\d/.test(password)) score += 1;
        else suggestions.push("Add numbers.");

        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        else suggestions.push("Add symbols like !@#$%.");

        if (/^(password|123456|qwerty|letmein|admin)$/i.test(password)) {
            return {
                strength: "Very Weak",
                warning: "This password is too common.",
                suggestions: ["Choose a less common password."]
            };
        }

        if (password.length === 0) {
            return {
                strength: "Very Weak",
                warning: "Enter a password to test its strength.",
                suggestions
            };
        }

        let strength = "Very Weak";
        if (score >= 5) strength = "Strong";
        else if (score >= 4) strength = "Medium";
        else if (score >= 2) strength = "Weak";

        return { strength, warning: "", suggestions };
    }

    // Phishing challenge
    const checkAnswersButton = document.getElementById('check-answers');
    const resultsDiv = document.getElementById('results');

    if (checkAnswersButton) {
        checkAnswersButton.addEventListener('click', function() {
            let score = 0;
            const answers = {
                email1: 'phishing',
                email2: 'phishing',
                email3: 'legitimate'
            };

            for (let email in answers) {
                const selected = document.querySelector(`input[name="${email}"]:checked`);
                if (selected && selected.value === answers[email]) {
                    score++;
                }
            }

            resultsDiv.innerHTML = `<p>You got ${score} out of 3 correct!</p>`;
            if (score === 3) {
                resultsDiv.innerHTML += "<p>Great job! You're good at spotting phishing attempts.</p>";
            } else {
                resultsDiv.innerHTML += "<p>Keep practicing! Remember to check sender addresses and look for suspicious links.</p>";
            }
        });
    }

    // Quiz functionality
    const submitQuizButton = document.getElementById('submit-quiz');
    const quizResultsDiv = document.getElementById('quiz-results');
    const errorNotification = document.getElementById('error-notification');

    if (submitQuizButton) {
        submitQuizButton.addEventListener('click', function() {
            const quizAnswers = {
                q1: 'correct',
                q2: 'correct',
                q3: 'correct',
                q4: 'correct',
                q5: 'correct',
                q6: 'correct',
                q7: 'correct',
                q8: 'correct',
                q9: 'correct',
                q10: 'correct'
            };

            let score = 0;
            let wrongAnswersCount = 0;

            // Check each answer
            for (let questionId in quizAnswers) {
                const selected = document.querySelector(`input[name="${questionId}"]:checked`);
                
                if (!selected) {
                    showErrorFeedback();
                    wrongAnswersCount++;
                } else if (selected.value === quizAnswers[questionId]) {
                    score++;
                } else {
                    showErrorFeedback();
                    wrongAnswersCount++;
                }
            }

            // Display results
            displayQuizResults(score, wrongAnswersCount);
        });
    }

    function showErrorFeedback() {
        // Screen shake
        document.body.classList.remove('shake');
        void document.body.offsetWidth; // Trigger reflow to restart animation
        document.body.classList.add('shake');

        // Show error notification
        if (errorNotification) {
            errorNotification.classList.remove('show', 'hide');
            void errorNotification.offsetWidth; // Trigger reflow
            errorNotification.classList.add('show');

            // Hide after 1 second
            setTimeout(() => {
                errorNotification.classList.remove('show');
                errorNotification.classList.add('hide');
            }, 1000);
        }
    }

    function displayQuizResults(score, wrongCount) {
        const totalQuestions = 10;
        const percentage = Math.round((score / totalQuestions) * 100);
        let message = '';
        let backgroundColor = '';
        let passed = percentage >= 70;

        if (!passed) {
            // FAIL condition
            message = '❌ You Failed! You need 70% to pass. Study more and try again!';
            backgroundColor = '#f8d7da';
        } else if (score === totalQuestions) {
            message = '🎉 Perfect Score! You\'re a cybersecurity expert!';
            backgroundColor = '#d4edda';
        } else if (score >= 9) {
            message = '🌟 Great job! You really know your stuff!';
            backgroundColor = '#d4edda';
        } else if (score >= 8) {
            message = '🎊 Excellent work! You passed!';
            backgroundColor = '#d4edda';
        } else if (score >= 7) {
            message = '💯 You passed! Nice job!';
            backgroundColor = '#d4edda';
        } else {
            message = '💪 Keep practicing! Cybersecurity is important.';
            backgroundColor = '#f8d7da';
        }

        quizResultsDiv.style.backgroundColor = backgroundColor;
        quizResultsDiv.innerHTML = `
            <h3>Quiz Complete!</h3>
            <p><strong>Your Score: ${score} out of ${totalQuestions} (${percentage}%)</strong></p>
            <p style="font-size: 1.1rem;">${message}</p>
            <p style="margin-top: 1rem; font-size: 0.95rem;">Questions you missed: ${wrongCount}</p>
            <button id="retake-quiz" class="button" style="margin-top: 1rem;">Retake Quiz</button>
        `;

        // Scroll to results
        quizResultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Show confetti if passed (70% or above)
        if (passed) {
            triggerConfetti();
        }

        // Add retake functionality
        document.getElementById('retake-quiz').addEventListener('click', function() {
            location.reload();
        });
    }

    function triggerConfetti() {
        // Create confetti effect
        const canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9998';
        document.body.appendChild(canvas);

        const confettiSettings = {
            target: 'confetti-canvas',
            max: 100,
            size: 1,
            animate: true,
            props: ['circle', 'square'],
            colors: [[165, 104, 246], [230, 61, 135], [0, 199, 228], [253, 214, 20]],
            clock: 50,
            rotate: true,
            width: window.innerWidth,
            height: window.innerHeight
        };

        try {
            const confetti = new ConfettiGenerator(confettiSettings);
            confetti.render();

            // Stop confetti after 4 seconds
            setTimeout(() => {
                confetti.clear();
                canvas.remove();
            }, 4000);
        } catch (e) {
            // Fallback if confetti library doesn't load - use simple CSS animation
            createSimpleConfetti();
        }
    }

    function createSimpleConfetti() {
        const confetti = [];
        const confettiPieces = 50;

        for (let i = 0; i < confettiPieces; i++) {
            const piece = document.createElement('div');
            piece.style.position = 'fixed';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.top = '-10px';
            piece.style.width = '10px';
            piece.style.height = '10px';
            piece.style.backgroundColor = ['#ff6b6b', '#4ecdc4', '#ffd93d', '#6bcf7f', '#c44569'][Math.floor(Math.random() * 5)];
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
            piece.style.pointerEvents = 'none';
            piece.style.zIndex = '9998';
            piece.style.opacity = '1';
            piece.style.animation = `confettiFall ${2 + Math.random() * 2}s linear forwards`;
            document.body.appendChild(piece);

            setTimeout(() => {
                piece.remove();
            }, 4000);
        }
    }
});
