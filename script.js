// ====== NAVBAR HIDE/SHOW ON SCROLL ======
let lastScrollTop = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling DOWN - hide header
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling UP - show header
        header.style.transform = 'translateY(0)';
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// ====== GAMIFICATION SYSTEM ======
class GameState {
    constructor() {
        this.level = 1;
        this.xp = 0;
        this.maxXp = 100;
        this.achievements = [];
        this.challengesCompleted = 0;
        this.quizzesCompleted = 0;
        this.phishingScore = 0;
        this.passwordStrength = 0;
    }

    static load() {
        const saved = localStorage.getItem('cyberSafeGameState');
        if (saved) {
            const data = JSON.parse(saved);
            const state = new GameState();
            Object.assign(state, data);
            return state;
        }
        return new GameState();
    }

    save() {
        localStorage.setItem('cyberSafeGameState', JSON.stringify(this));
    }

    addXP(amount) {
        this.xp += amount;
        if (this.xp >= this.maxXp) {
            this.levelUp();
        }
        this.save();
        updateGameUI();
    }

    levelUp() {
        this.level++;
        this.xp = 0;
        this.maxXp = Math.floor(100 * (1.1 ** this.level));
        this.unlockAchievement('level_' + this.level);
        this.save();
        showLevelUpNotification(this.level);
    }

    unlockAchievement(id) {
        if (!this.achievements.includes(id)) {
            this.achievements.push(id);
            this.save();
            return true;
        }
        return false;
    }

    getProgress() {
        return (this.xp / this.maxXp) * 100;
    }
}

let gameState = GameState.load();

function updateGameUI() {
    const profileDiv = document.getElementById('game-profile');
    if (profileDiv) {
        const progress = gameState.getProgress();
        profileDiv.innerHTML = `
            <div class="profile-header">
                <h3>🎮 Level ${gameState.level}</h3>
                <p class="xp-text">${gameState.xp} / ${gameState.maxXp} XP</p>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="achievements-display">
                <span class="achievement-count">🏆 ${gameState.achievements.length} Achievements</span>
            </div>
        `;
    }
}

function showLevelUpNotification(level) {
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
        <div class="level-up-content">
            <h2>🎉 LEVEL UP!</h2>
            <p>You reached Level ${level}!</p>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

function showRewardPopup(xpAmount, rewardName) {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = '#d4edda';
    popup.style.border = '3px solid #28a745';
    popup.style.borderRadius = '12px';
    popup.style.padding = '2rem';
    popup.style.textAlign = 'center';
    popup.style.zIndex = '10000';
    popup.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
    popup.style.minWidth = '300px';
    popup.innerHTML = `
        <p style="margin: 0; font-size: 1.4rem; color: #28a745;"><strong>🎯 Rewards Claimed!</strong></p>
        <p style="margin: 0.5rem 0; font-size: 2rem; color: #155724;">+${xpAmount} XP</p>
        <p style="margin: 0.5rem 0; font-size: 0.9rem; color: #666;">From: ${rewardName}</p>
    `;
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => popup.remove(), 500);
    }, 2000);
}

// Password Strength Tester
document.addEventListener('DOMContentLoaded', function() {
    updateGameUI();

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

            // Award XP for testing
            if (result.strength === 'Strong' || result.strength === 'Medium') {
                const xpReward = result.strength === 'Strong' ? 50 : 25;
                
                const xpDisplay = document.createElement('div');
                xpDisplay.className = 'xp-popup';
                xpDisplay.style.position = 'relative';
                xpDisplay.style.marginTop = '1rem';
                xpDisplay.style.padding = '1rem';
                xpDisplay.style.backgroundColor = '#d4edda';
                xpDisplay.style.border = '2px solid #28a745';
                xpDisplay.style.borderRadius = '8px';
                xpDisplay.innerHTML = `
                    <p style="margin: 0.5rem 0;"><strong>🎯 Rewards Available!</strong></p>
                    <p style="margin: 0.5rem 0; font-size: 1.2rem;">+${xpReward} XP</p>
                    <button id="claim-password-rewards" class="button" style="background: #4CAF50; margin-top: 0.5rem; width: 100%;">✓ Claim Rewards</button>
                `;
                resultDiv.appendChild(xpDisplay);
                
                // Add claim functionality
                document.getElementById('claim-password-rewards').addEventListener('click', function() {
                    gameState.passwordStrength++;
                    gameState.addXP(xpReward);
                    
                    this.disabled = true;
                    this.innerHTML = '✓ Rewards Claimed!';
                    this.style.opacity = '0.7';
                    showRewardPopup(xpReward, 'Password Test Rewards');
                    
                    if (gameState.passwordStrength === 1) {
                        gameState.unlockAchievement('first_strong_password');
                    }
                });
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

            const xpReward = score * 25;
            gameState.phishingScore = Math.max(gameState.phishingScore, Math.round((score / 3) * 100));
            gameState.challengesCompleted++;

            resultsDiv.innerHTML = `
                <div class="challenge-result">
                    <p>You got ${score} out of 3 correct!</p>
                    <p class="xp-reward">+${xpReward} XP 🎯</p>
            `;
            if (score === 3) {
                resultsDiv.innerHTML += "<p>🏆 Perfect! You're a phishing expert!</p>";
                gameState.unlockAchievement('phishing_master');
            } else if (score === 2) {
                resultsDiv.innerHTML += "<p>⭐ Great work! Keep practicing those detective skills.</p>";
            } else {
                resultsDiv.innerHTML += "<p>💪 Keep practicing! Remember to check sender addresses and look for suspicious links.</p>";
                gameState.unlockAchievement('first_challenge');
            }
            resultsDiv.innerHTML += `
                <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                    <button id="claim-challenge-rewards" class="button" style="flex: 1; background: #4CAF50;">✓ Claim Rewards</button>
                    <button id="retry-challenge" class="button" style="flex: 1;">Try Again</button>
                </div>
            </div>`;

            // Add claim rewards functionality
            document.getElementById('claim-challenge-rewards').addEventListener('click', function() {
                gameState.addXP(xpReward);
                this.disabled = true;
                this.innerHTML = '✓ Rewards Claimed!';
                this.style.opacity = '0.7';
                showRewardPopup(xpReward, 'Phishing Challenge Rewards');
            });

            // Add retry functionality
            document.getElementById('retry-challenge').addEventListener('click', function() {
                // Reset radio buttons
                document.querySelectorAll('input[name="email1"], input[name="email2"], input[name="email3"]').forEach(el => el.checked = false);
                resultsDiv.innerHTML = '';
                checkAnswersButton.disabled = false;
            });
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

        // Award XP based on performance
        let xpReward = 0;
        if (passed) {
            xpReward = score === totalQuestions ? 150 : Math.round(score * 12);
            gameState.quizzesCompleted++;
        } else {
            xpReward = score * 5;
        }

        if (!passed) {
            // FAIL condition
            message = '❌ You Failed! You need 70% to pass. Study more and try again!';
            backgroundColor = '#f8d7da';
        } else if (score === totalQuestions) {
            message = '🎉 Perfect Score! You\'re a cybersecurity expert!';
            backgroundColor = '#d4edda';
            gameState.unlockAchievement('perfect_quiz');
        } else if (score >= 9) {
            message = '🌟 Great job! You really know your stuff!';
            backgroundColor = '#d4edda';
        } else if (score >= 8) {
            message = '🎊 Excellent work! You passed!';
            backgroundColor = '#d4edda';
        } else if (score >= 7) {
            message = '💯 You passed! Nice job!';
            backgroundColor = '#d4edda';
            gameState.unlockAchievement('quiz_passed');
        } else {
            message = '💪 Keep practicing! Cybersecurity is important.';
            backgroundColor = '#f8d7da';
        }

        quizResultsDiv.style.backgroundColor = backgroundColor;
        quizResultsDiv.innerHTML = `
            <h3>Quiz Complete!</h3>
            <p><strong>Your Score: ${score} out of ${totalQuestions} (${percentage}%)</strong></p>
            <p style="font-size: 1.1rem;">${message}</p>
            <p class="xp-reward" style="margin-top: 1rem; font-size: 1.2rem;">+${xpReward} XP 🎯</p>
            <p style="margin-top: 1rem; font-size: 0.95rem;">Questions you missed: ${wrongCount}</p>
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                <button id="claim-quiz-rewards" class="button" style="flex: 1; background: #4CAF50;">✓ Claim Rewards</button>
                <button id="retake-quiz" class="button" style="flex: 1;">Retake Quiz</button>
            </div>
        `;

        // Scroll to results
        quizResultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Show confetti if passed (70% or above)
        if (passed) {
            triggerConfetti();
        }

        // Add claim rewards functionality
        document.getElementById('claim-quiz-rewards').addEventListener('click', function() {
            gameState.addXP(xpReward);
            this.disabled = true;
            this.innerHTML = '✓ Rewards Claimed!';
            this.style.opacity = '0.7';
            showRewardPopup(xpReward, 'Quiz Rewards');
            
            // After 2 seconds, allow retaking
            setTimeout(() => {
                document.getElementById('retake-quiz').disabled = false;
            }, 2000);
        });

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
