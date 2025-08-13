// The Case of the Missing Dependencies - Game Logic
class DetectiveGame {
    constructor() {
        this.gameState = {
            timeRemaining: 300, // 5 minutes in seconds
            evidenceCollected: [],
            cluesInvestigated: [],
            gameActive: true,
            culprit: this.selectRandomCulprit(),
            accusationMade: false
        };
        
        this.timer = null;
        this.initializeGame();
    }

    selectRandomCulprit() {
        const suspects = ['alex', 'morgan', 'jordan'];
        return suspects[Math.floor(Math.random() * suspects.length)];
    }

    initializeGame() {
        this.setupEventListeners();
        this.startTimer();
        this.updateDisplay();
        console.log(`🕵️ DEBUG: The culprit is ${this.gameState.culprit}`);
    }

    setupEventListeners() {
        // Clue area clicks
        document.querySelectorAll('.clue-area').forEach(area => {
            area.addEventListener('click', (e) => this.investigateClue(e.target.closest('.clue-area')));
        });

        // Suspect card clicks
        document.querySelectorAll('.suspect-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectSuspect(e.target.closest('.suspect-card')));
        });

        // Modal controls - bind to ALL close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeModal());
        });
        document.getElementById('collect-evidence').addEventListener('click', () => this.collectCurrentEvidence());
        
        // Game controls
        document.getElementById('make-accusation').addEventListener('click', () => this.makeAccusation());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('restart-game').addEventListener('click', () => this.restartGame());

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            try {
                // Check if clicked element is the modal backdrop (not modal content)
                if (e.target.classList.contains('modal')) {
                    console.log('🖱️ DEBUG: Modal backdrop clicked, closing modal');
                    this.closeModal();
                }
            } catch (error) {
                console.error('❌ ERROR: Failed to handle modal backdrop click:', error);
            }
        });

        // Add ESC key support for closing modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                console.log('⌨️ DEBUG: ESC key pressed, closing modal');
                this.closeModal();
            }
        });
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.gameState.timeRemaining--;
            this.updateTimer();
            
            if (this.gameState.timeRemaining <= 0) {
                this.endGame(false, "Time's up! The CEO discovered the outage and you're in trouble!");
            }
        }, 1000);
    }

    updateTimer() {
        const minutes = Math.floor(this.gameState.timeRemaining / 60);
        const seconds = this.gameState.timeRemaining % 60;
        const timerElement = document.getElementById('timer');

        timerElement.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Add warning classes based on time remaining
        timerElement.classList.remove('warning', 'critical');
        if (this.gameState.timeRemaining <= 60) {
            timerElement.classList.add('critical');
        } else if (this.gameState.timeRemaining <= 120) {
            timerElement.classList.add('warning');
        }
    }

    updateDisplay() {
        document.getElementById('evidence-count').textContent = 
            `${this.gameState.evidenceCollected.length}/7`;
        
        // Update make accusation button
        const accusationBtn = document.getElementById('make-accusation');
        accusationBtn.disabled = this.gameState.evidenceCollected.length < 4;
    }

    investigateClue(clueArea) {
        if (!this.gameState.gameActive) return;

        const clueType = clueArea.dataset.clue;
        if (this.gameState.cluesInvestigated.includes(clueType)) {
            this.showModal('Already Investigated', 'You\'ve already thoroughly investigated this area.');
            this.showSoundEffect('🔍');
            return;
        }

        const clueData = this.getClueData(clueType);
        this.showClueModal(clueData);
        clueArea.classList.add('investigated', 'discovered');
        this.gameState.cluesInvestigated.push(clueType);
        this.showSoundEffect('📋');
    }

    getClueData(clueType) {
        const clues = {
            logs: {
                title: '🗂️ System Audit Logs',
                content: `<p><strong>Registry Cleanup Log - $(date)</strong></p>
                         <pre>
[INFO] Automated cleanup initiated by user: ${this.gameState.culprit === 'alex' ? 'alex.chen' : this.gameState.culprit === 'morgan' ? 'morgan.davis' : 'automation-bot'}
[INFO] Scanning for images older than 30 days...
[WARN] Found 47 "unused" images
[INFO] Deleted: company/legacy-api:v2.1.4
[INFO] Deleted: company/auth-service:v1.8.2
[ERROR] Build dependency missing: company/legacy-api:v2.1.4
                         </pre>`,
                evidence: this.gameState.culprit === 'alex' ? 'Alex Chen initiated the cleanup that deleted critical legacy images' : 
                         this.gameState.culprit === 'morgan' ? 'Cleanup was triggered by security policy enforcement' :
                         'Automated script deleted images without checking dependencies'
            },
            slack: {
                title: '💬 Team Slack History',
                content: `<div class="slack-messages">
                         <div class="message"><strong>Alex Chen</strong> - Yesterday 2:47 PM<br>
                         "Registry is at 89% capacity again 😤 Time for another cleanup!"</div>
                         <div class="message"><strong>Morgan Davis</strong> - Yesterday 3:15 PM<br>
                         "Found 12 CVEs in old images. Security policy requires immediate removal."</div>
                         <div class="message"><strong>Jordan Kim</strong> - Yesterday 4:22 PM<br>
                         "Updated the cleanup automation. Now removes anything unused for 30+ days."</div>
                         </div>`,
                evidence: 'Team members discussed cleanup activities yesterday - timing matches the incident'
            },
            registry: {
                title: '🐳 Docker Registry History',
                content: `<p><strong>Registry Deletion History</strong></p>
                         <table style="width:100%; color:#e0e0e0;">
                         <tr><th>Image</th><th>Deleted By</th><th>Timestamp</th></tr>
                         <tr><td>company/legacy-api:v2.1.4</td><td>${this.gameState.culprit === 'alex' ? 'alex.chen' : this.gameState.culprit === 'morgan' ? 'security-scanner' : 'cleanup-bot'}</td><td>Yesterday 16:45</td></tr>
                         <tr><td>company/auth-service:v1.8.2</td><td>${this.gameState.culprit === 'alex' ? 'alex.chen' : this.gameState.culprit === 'morgan' ? 'security-scanner' : 'cleanup-bot'}</td><td>Yesterday 16:47</td></tr>
                         </table>`,
                evidence: `Critical images were deleted by ${this.gameState.culprit === 'alex' ? 'Alex Chen manually' : this.gameState.culprit === 'morgan' ? 'automated security scanner' : 'Jordan\'s cleanup automation'}`
            },
            scripts: {
                title: '📜 Automation Scripts',
                content: `<p><strong>cleanup-registry.sh</strong> (Last modified by: ${this.gameState.culprit === 'jordan' ? 'jordan.kim' : 'alex.chen'})</p>
                         <pre>
#!/bin/bash
# Registry cleanup automation
# ${this.gameState.culprit === 'jordan' ? 'Modified by Jordan Kim - removed dependency checking!' : 'Standard cleanup script'}

for image in $(docker images --filter "dangling=false" --format "table {{.Repository}}:{{.Tag}}" | grep -v REPOSITORY); do
    last_used=$(docker image inspect $image --format='{{.Metadata.LastTagTime}}')
    if [[ $(date -d "$last_used" +%s) -lt $(date -d "30 days ago" +%s) ]]; then
        echo "Deleting unused image: $image"
        docker rmi $image ${this.gameState.culprit === 'jordan' ? '# YOLO - no dependency check' : ''}
    fi
done
                         </pre>`,
                evidence: this.gameState.culprit === 'jordan' ? 'Jordan modified the script to skip dependency checking' : 'Script shows standard cleanup logic'
            },
            tickets: {
                title: '🎫 Recent Support Tickets',
                content: `<div class="tickets">
                         <div class="ticket">
                         <strong>Ticket #4521</strong> - Filed by: ${this.gameState.culprit === 'morgan' ? 'Morgan Davis' : 'Alex Chen'}<br>
                         Subject: ${this.gameState.culprit === 'morgan' ? 'Security: Remove vulnerable legacy images' : 'Storage: Registry cleanup required'}<br>
                         Priority: ${this.gameState.culprit === 'morgan' ? 'HIGH' : 'MEDIUM'}<br>
                         Status: Completed Yesterday
                         </div>
                         </div>`,
                evidence: `${this.gameState.culprit === 'morgan' ? 'Morgan' : 'Alex'} filed a ticket requesting the cleanup that caused the issue`
            },
            monitoring: {
                title: '📊 System Monitoring',
                content: `<p><strong>Registry Storage Alerts</strong></p>
                         <div class="alert">⚠️ Registry storage: 89% full (Yesterday 14:30)</div>
                         <div class="alert">🔴 Build failure spike detected (Today 09:15)</div>
                         <div class="alert">📉 Registry size dropped 23% (Yesterday 16:50)</div>
                         <p><strong>User Activity Spike:</strong> ${this.gameState.culprit === 'alex' ? 'alex.chen' : this.gameState.culprit === 'morgan' ? 'security-scanner' : 'automation-bot'} - Yesterday 16:45-17:00</p>`,
                evidence: 'Monitoring shows suspicious activity during the time window when images were deleted'
            },
            backup: {
                title: '💾 Backup Recovery Options',
                content: `<p><strong>Available Backups</strong></p>
                         <div class="backup-list">
                         <div class="backup-item">✅ Weekly backup from 5 days ago (contains legacy-api:v2.1.4)</div>
                         <div class="backup-item">✅ Daily backup from 2 days ago (contains auth-service:v1.8.2)</div>
                         <div class="backup-item">❌ Yesterday's backup failed due to ${this.gameState.culprit === 'alex' ? 'storage cleanup in progress' : this.gameState.culprit === 'morgan' ? 'security scan interference' : 'automation script conflict'}</div>
                         </div>
                         <p><strong>Recovery Status:</strong> Images can be restored from backup!</p>`,
                evidence: 'Backup failure coincides with cleanup activity - images can be recovered'
            }
        };
        
        return clues[clueType];
    }

    showClueModal(clueData) {
        try {
            console.log('🔍 DEBUG: Opening clue modal for:', clueData.title);

            const modalTitle = document.getElementById('modal-title');
            const modalBody = document.getElementById('modal-body');
            const clueModal = document.getElementById('clue-modal');

            if (modalTitle && modalBody && clueModal) {
                modalTitle.textContent = clueData.title;
                modalBody.innerHTML = clueData.content;
                clueModal.style.display = 'block';
                this.currentEvidence = clueData.evidence;

                console.log('✅ DEBUG: Clue modal opened successfully');
            } else {
                console.error('❌ ERROR: Modal elements not found');
            }
        } catch (error) {
            console.error('❌ ERROR: Failed to show clue modal:', error);
        }
    }

    collectCurrentEvidence() {
        if (this.currentEvidence && !this.gameState.evidenceCollected.includes(this.currentEvidence)) {
            this.gameState.evidenceCollected.push(this.currentEvidence);
            this.addEvidenceToBoard(this.currentEvidence);
            this.updateDisplay();
            this.showSoundEffect('✅');
        }
        this.closeModal();
    }

    addEvidenceToBoard(evidence) {
        const evidenceList = document.getElementById('evidence-list');
        const evidenceItem = document.createElement('div');
        evidenceItem.className = 'evidence-item';
        evidenceItem.textContent = `📋 ${evidence}`;
        evidenceList.appendChild(evidenceItem);
    }

    selectSuspect(suspectCard) {
        if (!this.gameState.gameActive || this.gameState.accusationMade) return;
        
        // Remove previous selection
        document.querySelectorAll('.suspect-card').forEach(card => {
            card.classList.remove('accused');
        });
        
        // Select new suspect
        suspectCard.classList.add('accused');
        this.selectedSuspect = suspectCard.dataset.suspect;
    }

    makeAccusation() {
        if (!this.selectedSuspect) {
            alert('Please select a suspect first!');
            this.showSoundEffect('❌');
            return;
        }

        this.gameState.accusationMade = true;
        const isCorrect = this.selectedSuspect === this.gameState.culprit;

        if (isCorrect) {
            this.showSoundEffect('🎉');
            this.endGame(true, `Excellent detective work! You correctly identified ${this.getSuspectName(this.gameState.culprit)} as the culprit. The missing dependencies have been restored from backup and builds are working again!`);
        } else {
            this.showSoundEffect('💥');
            this.endGame(false, `Wrong accusation! ${this.getSuspectName(this.selectedSuspect)} was innocent. The real culprit was ${this.getSuspectName(this.gameState.culprit)}. The outage continues...`);
        }
    }

    showSoundEffect(emoji) {
        const soundEffect = document.createElement('div');
        soundEffect.className = 'sound-effect';
        soundEffect.textContent = emoji;
        document.body.appendChild(soundEffect);

        setTimeout(() => {
            document.body.removeChild(soundEffect);
        }, 1000);
    }

    getSuspectName(suspect) {
        const names = {
            alex: 'Alex "Cleanup" Chen',
            morgan: 'Morgan "Security" Davis',
            jordan: 'Jordan "Automation" Kim'
        };
        return names[suspect];
    }

    endGame(won, message) {
        this.gameState.gameActive = false;
        clearInterval(this.timer);
        
        document.getElementById('game-result-title').textContent = won ? '🎉 Case Solved!' : '💥 Investigation Failed!';
        document.getElementById('game-result-message').textContent = message;
        document.getElementById('game-over-modal').style.display = 'block';
        
        // Update build status
        document.getElementById('build-status').textContent = won ? 'PASSING' : 'FAILING';
        document.getElementById('build-status').className = won ? 'build-status passing' : 'build-status failing';
    }

    closeModal() {
        try {
            // Close clue modal
            const clueModal = document.getElementById('clue-modal');
            if (clueModal) {
                clueModal.style.display = 'none';
                console.log('🔒 DEBUG: Clue modal closed');
            }

            // Close game over modal
            const gameOverModal = document.getElementById('game-over-modal');
            if (gameOverModal) {
                gameOverModal.style.display = 'none';
                console.log('🔒 DEBUG: Game over modal closed');
            }

            // Clear current evidence when closing clue modal
            this.currentEvidence = null;

            console.log('✅ DEBUG: All modals closed successfully');
        } catch (error) {
            console.error('❌ ERROR: Failed to close modal:', error);
        }
    }

    // Helper function to check if any modal is open
    isModalOpen() {
        const clueModal = document.getElementById('clue-modal');
        const gameOverModal = document.getElementById('game-over-modal');

        const clueOpen = clueModal && clueModal.style.display === 'block';
        const gameOverOpen = gameOverModal && gameOverModal.style.display === 'block';

        return clueOpen || gameOverOpen;
    }

    // Debug function to test modal functionality
    testModalFunctionality() {
        console.log('🧪 DEBUG: Testing modal functionality...');

        // Test close buttons
        const closeButtons = document.querySelectorAll('.close');
        console.log(`🔍 Found ${closeButtons.length} close buttons`);

        // Test modal elements
        const clueModal = document.getElementById('clue-modal');
        const gameOverModal = document.getElementById('game-over-modal');

        console.log('📋 Clue modal exists:', !!clueModal);
        console.log('🎮 Game over modal exists:', !!gameOverModal);
        console.log('🔓 Any modal currently open:', this.isModalOpen());

        return {
            closeButtons: closeButtons.length,
            clueModal: !!clueModal,
            gameOverModal: !!gameOverModal,
            modalOpen: this.isModalOpen()
        };
    }

    restartGame() {
        // Reset game state
        this.gameState = {
            timeRemaining: 300,
            evidenceCollected: [],
            cluesInvestigated: [],
            gameActive: true,
            culprit: this.selectRandomCulprit(),
            accusationMade: false
        };
        
        // Reset UI
        document.querySelectorAll('.clue-area').forEach(area => area.classList.remove('investigated'));
        document.querySelectorAll('.suspect-card').forEach(card => card.classList.remove('accused'));
        document.getElementById('evidence-list').innerHTML = '';
        document.getElementById('build-status').textContent = 'FAILING';
        document.getElementById('build-status').className = 'build-status failing';
        
        this.selectedSuspect = null;
        this.currentEvidence = null;
        
        // Restart timer and update display
        clearInterval(this.timer);
        this.startTimer();
        this.updateDisplay();
        this.closeModal();
        
        console.log(`🕵️ DEBUG: New culprit is ${this.gameState.culprit}`);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DetectiveGame();
});
