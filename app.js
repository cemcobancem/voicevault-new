class VoiceRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordings = JSON.parse(localStorage.getItem('voiceRecordings') || '[]');
        this.currentTranscript = [];
        this.interimTranscript = '';
        this.speechRecognition = null;
        
        this.recordBtn = document.getElementById('recordBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.recordingStatus = document.getElementById('recordingStatus');
        this.recordingsList = document.getElementById('recordingsList');
        this.recordingCount = document.getElementById('recordingCount');
        this.splashScreen = document.getElementById('splashScreen');
        this.liveTranscript = document.getElementById('liveTranscript');
        this.liveTranscriptText = document.getElementById('liveTranscriptText');
        
        this.init();
    }

    init() {
        this.showSplashScreen();
        this.recordBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        this.renderRecordings();
    }

    showSplashScreen() {
        setTimeout(() => {
            this.splashScreen.classList.add('hidden');
        }, 2500);
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.currentTranscript = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.saveRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.updateUI();
            this.startTimer();
            this.startSpeechRecognition();
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please allow microphone permissions.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.stopSpeechRecognition();
            this.isRecording = false;
            this.updateUI();
            this.stopTimer();
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            this.recordingStatus.textContent = `Recording... ${minutes}:${seconds}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.recordingStatus.textContent = '';
        }
    }

    updateUI() {
        this.recordBtn.disabled = this.isRecording;
        this.stopBtn.disabled = !this.isRecording;
        
        if (this.isRecording) {
            this.recordBtn.classList.remove('from-green-600', 'to-green-700');
            this.recordBtn.classList.add('from-red-600', 'to-red-700', 'animate-pulse');
            this.recordBtn.querySelector('span:last-child').textContent = 'Recording...';
            this.recordingStatus.classList.remove('hidden');
            this.liveTranscript.classList.remove('hidden');
        } else {
            this.recordBtn.classList.add('from-green-600', 'to-green-700');
            this.recordBtn.classList.remove('from-red-600', 'to-red-700', 'animate-pulse');
            this.recordBtn.querySelector('span:last-child').textContent = 'Start Recording';
            this.recordingStatus.classList.add('hidden');
            this.liveTranscript.classList.add('hidden');
        }
    }

    async saveRecording() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const transcriptText = this.currentTranscript.join(' ').trim();
        const defaultName = `VoiceVault ${this.recordings.length + 1}`;
        
        const recording = {
            id: Date.now(),
            name: defaultName,
            date: new Date().toLocaleString(),
            audioData: await this.blobToBase64(audioBlob),
            transcript: transcriptText || null
        };
        
        this.recordings.unshift(recording);
        this.saveToLocalStorage();
        this.updateRecordingCount();
        this.clearLiveTranscript();
        this.renderRecordings();
    }

    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    startSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.log('Web Speech API not supported, transcription disabled');
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            
            this.speechRecognition.lang = 'en-US';
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = true;
            this.speechRecognition.maxAlternatives = 1;
            
            this.speechRecognition.onresult = (event) => {
                this.interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        this.currentTranscript.push(transcript);
                    } else {
                        this.interimTranscript += transcript;
                    }
                }
                
                this.updateLiveTranscript();
            };
            
            this.speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                
                // Don't show errors for these cases
                if (event.error === 'no-speech' || event.error === 'aborted') {
                    return;
                }
                
                // Handle network errors more gracefully
                if (event.error === 'network') {
                    console.warn('Speech recognition service unavailable, recording continues...');
                    // Don't add error to transcript, just log it
                    return;
                }
                
                // Handle not-allowed errors
                if (event.error === 'not-allowed') {
                    console.warn('Microphone permission denied');
                    this.currentTranscript.push('[Microphone permission denied. Check browser settings.]');
                    this.updateLiveTranscript();
                    return;
                }
                
                // Handle service not available
                if (event.error === 'service-not-allowed') {
                    console.warn('Speech recognition service not available');
                    this.currentTranscript.push('[Speech recognition service unavailable. Recording continues without transcription.]');
                    this.updateLiveTranscript();
                    return;
                }
                
                // For other errors, show them but continue recording
                this.currentTranscript.push(`[Transcription issue: ${event.error}]`);
                this.updateLiveTranscript();
            };
            
            this.speechRecognition.onend = () => {
                console.log('Speech recognition ended, isRecording:', this.isRecording);
                if (this.isRecording) {
                    try {
                        this.speechRecognition.start();
                        console.log('Speech recognition restarted');
                    } catch (e) {
                        console.error('Failed to restart speech recognition:', e);
                        // Retry after delay
                        setTimeout(() => {
                            if (this.isRecording) {
                                try {
                                    this.speechRecognition.start();
                                } catch (retryError) {
                                    console.error('Retry failed:', retryError);
                                }
                            }
                        }, 1000);
                    }
                }
            };
            
            this.speechRecognition.onstart = () => {
                console.log('Speech recognition started');
            };
            
            this.speechRecognition.start();
            console.log('Speech recognition initialized');
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            console.warn('Recording will continue without transcription');
        }
    }

    updateLiveTranscript() {
        const finalText = this.currentTranscript.join(' ');
        const displayText = this.interimTranscript 
            ? finalText + ' <span class="interim-text">' + this.interimTranscript + '</span>'
            : finalText;
        
        this.liveTranscriptText.innerHTML = displayText;
        
        this.liveTranscriptText.scrollTop = this.liveTranscriptText.scrollHeight;
    }

    clearLiveTranscript() {
        this.currentTranscript = [];
        this.interimTranscript = '';
        this.liveTranscriptText.innerHTML = '';
    }

    stopSpeechRecognition() {
        if (this.speechRecognition) {
            try {
                this.speechRecognition.stop();
                this.speechRecognition = null;
            } catch (error) {
                console.error('Error stopping speech recognition:', error);
            }
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('voiceRecordings', JSON.stringify(this.recordings));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            alert('Storage quota exceeded. Some recordings may not be saved.');
        }
    }

    updateRecordingCount() {
        this.recordingCount.textContent = this.recordings.length;
    }

    renderRecordings() {
        this.updateRecordingCount();
        console.log('Rendering recordings:', this.recordings.length);
        
        if (this.recordings.length === 0) {
            this.recordingsList.innerHTML = `
                <div class="text-center py-16 px-6">
                    <div class="text-6xl mb-4">🎙️</div>
                    <p class="text-gray-400 text-lg">No recordings yet. Start recording!</p>
                </div>
            `;
            return;
        }
        
        this.recordingsList.innerHTML = this.recordings.map(recording => {
            const transcriptClass = recording.transcript ? '' : 'hidden';
            const transcriptContent = recording.transcript || 'No transcript available. Transcription happens automatically during recording.';
            
            return `
                <div class="recording-item bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-700/70 transition-all duration-300 hover:shadow-lg active:scale-[0.99]" data-id="${recording.id}" onclick="recorder.toggleRecording(${recording.id})">
                    <div class="recording-header p-4 md:p-5">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <div class="font-semibold text-white text-base md:text-lg truncate flex-1 cursor-pointer hover:text-gray-300 transition-colors" onclick="event.stopPropagation(); recorder.editRecordingName(${recording.id})">${recording.name}</div>
                                    <button class="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-600 transition-colors text-gray-400 hover:text-white" onclick="event.stopPropagation(); recorder.editRecordingName(${recording.id})" title="Edit name">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div class="text-sm text-gray-400">${recording.date}</div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button class="tap-effect bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm" onclick="event.stopPropagation(); recorder.downloadRecording(${recording.id})">
                                    <span>💾</span> Download
                                </button>
                                <button class="tap-effect bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm" onclick="event.stopPropagation(); recorder.deleteRecording(${recording.id})">
                                    <span>🗑️</span> Delete
                                </button>
                                <div class="expand-icon flex items-center justify-center p-2 text-gray-400 transition-transform duration-300">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M6 9l6 6 6-6"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="recording-details max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
                        <div class="px-4 md:px-5 pb-4 md:pb-5">
                            <audio controls src="${recording.audioData}" class="mt-4"></audio>
                            <div class="recording-transcript ${transcriptClass} mt-4 bg-white/5 backdrop-blur-sm border border-gray-600 rounded-xl p-4">
                                <h3 class="text-gray-300 font-semibold mb-2 flex items-center gap-2 text-sm">📝 Transcript:</h3>
                                <div class="transcript-text text-gray-200 leading-relaxed text-sm whitespace-pre-wrap">${transcriptContent}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    downloadRecording(recordingId) {
        const recording = this.recordings.find(r => r.id === recordingId);
        if (!recording) return;
        
        const link = document.createElement('a');
        link.href = recording.audioData;
        link.download = `${recording.name.replace(/\s+/g, '_')}.webm`;
        link.click();
    }

    deleteRecording(recordingId) {
        if (confirm('Are you sure you want to delete this recording?')) {
            this.recordings = this.recordings.filter(r => r.id !== recordingId);
            this.saveToLocalStorage();
            this.updateRecordingCount();
            this.renderRecordings();
        }
    }

    editRecordingName(recordingId) {
        const recording = this.recordings.find(r => r.id === recordingId);
        if (!recording) return;
        
        const newName = prompt('Enter new name for this recording:', recording.name);
        
        if (newName && newName.trim() !== '') {
            recording.name = newName.trim();
            this.saveToLocalStorage();
            this.renderRecordings();
        }
    }

    toggleRecording(recordingId) {
        const recordingElement = document.querySelector(`[data-id="${recordingId}"]`);
        if (!recordingElement) return;
        
        const isExpanded = recordingElement.classList.toggle('expanded');
        const expandIcon = recordingElement.querySelector('.expand-icon');
        const details = recordingElement.querySelector('.recording-details');
        
        if (expandIcon) {
            expandIcon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
        }
        
        if (details) {
            details.style.maxHeight = isExpanded ? '1000px' : '0';
        }
    }
}

const recorder = new VoiceRecorder();