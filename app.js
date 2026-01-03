class VoiceRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordings = JSON.parse(localStorage.getItem('voiceRecordings') || '[]');
        this.currentTranscript = [];
        this.interimTranscript = '';
        this.speechRecognition = null;
        this.searchQuery = '';
        this.isMobile = this.detectMobile();
        this.browserInfo = this.getBrowserInfo();
        this.speechRecognitionSupported = this.checkSpeechRecognitionSupport();
        
        this.recordBtn = document.getElementById('recordBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.recordingStatus = document.getElementById('recordingStatus');
        this.recordingsList = document.getElementById('recordingsList');
        this.recordingCount = document.getElementById('recordingCount');
        this.splashScreen = document.getElementById('splashScreen');
        this.liveTranscript = document.getElementById('liveTranscript');
        this.liveTranscriptText = document.getElementById('liveTranscriptText');
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearchBtn');
        this.searchResults = document.getElementById('searchResults');
        
        this.init();
    }

    detectMobile() {
        return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               /Android/i.test(navigator.userAgent) && window.innerWidth <= 768;
    }

    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browser = 'unknown';
        let version = 'unknown';
        
        if (userAgent.indexOf('Chrome') > -1) {
            browser = 'Chrome';
        } else if (userAgent.indexOf('Safari') > -1) {
            browser = 'Safari';
        } else if (userAgent.indexOf('Firefox') > -1) {
            browser = 'Firefox';
        } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
            browser = 'IE';
        }
        
        console.log('Browser Info:', { browser, userAgent, isMobile: this.isMobile });
        return { browser, isMobile: this.isMobile };
    }

    checkSpeechRecognitionSupport() {
        return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
    }

    init() {
        this.showSplashScreen();
        this.recordBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.renderRecordings();
        
        if (!this.speechRecognitionSupported) {
            console.warn('Speech Recognition not supported in this browser');
            this.showTranscriptionWarning();
        }
    }

    showTranscriptionWarning() {
        const warningMsg = document.createElement('div');
        warningMsg.className = 'bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-xl px-5 py-4 mb-4 text-center';
        warningMsg.innerHTML = `
            <p class="font-semibold mb-2">⚠️ Speech Recognition Not Available</p>
            <p class="text-sm mb-2">Your browser (${this.browserInfo.browser}) doesn't support speech recognition. Audio recording will still work, but transcription requires a supported browser.</p>
            <p class="text-sm mb-2"><strong>Recommended browsers:</strong> Chrome, Edge</p>
            <p class="text-sm"><a href="https://caniuse.com/speech-recognition-api" target="_blank" class="underline hover:text-yellow-600">Learn more about browser support</a></p>
        `;
        
        const infoNote = document.querySelector('.info-note');
        if (infoNote) {
            infoNote.insertAdjacentElement('afterend', warningMsg);
        }
    }

    showSplashScreen() {
        setTimeout(() => {
            this.splashScreen.classList.add('hidden');
        }, 2500);
    }

    async startRecording() {
        try {
            // Request microphone access with specific mobile considerations
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
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
            
            // Mobile-specific error handling
            let errorMessage = 'Could not access microphone. Please allow microphone permissions.';
            
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = this.isMobile 
                    ? 'Microphone access denied. On mobile: Go to Settings > Privacy > Microphone and enable it.'
                    : 'Could not access microphone. Please allow microphone permissions in your browser settings.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No microphone found. Please ensure your device has a microphone and it is connected.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Microphone is being used by another application. Please close other apps and try again.';
            }
            
            alert(errorMessage);
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
        if (!this.speechRecognitionSupported) {
            console.log('Web Speech API not supported in this browser, transcription disabled');
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            
            // Mobile-specific configuration
            this.speechRecognition.lang = 'en-US';
            
            // Safari/iOS doesn't support continuous speech recognition well
            if (this.browserInfo.browser === 'Safari' && this.isMobile) {
                this.speechRecognition.continuous = false;
                console.log('Safari mobile detected: disabling continuous mode for better compatibility');
            } else {
                this.speechRecognition.continuous = true;
            }
            
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
                
                // Mobile-specific error handling
                if (event.error === 'network') {
                    console.warn('Speech recognition service unavailable, recording continues...');
                    this.liveTranscriptText.innerHTML += '<br><span class="text-xs text-gray-400">⚠️ Network issue on mobile. Transcription paused.</span>';
                    return;
                }
                
                if (event.error === 'not-allowed') {
                    console.warn('Microphone permission denied');
                    if (this.isMobile) {
                        this.currentTranscript.push('[⚠️ Mobile: Check Settings > Privacy > Microphone]');
                    } else {
                        this.currentTranscript.push('[⚠️ Microphone permission denied. Check browser settings.]');
                    }
                    this.updateLiveTranscript();
                    return;
                }
                
                // Handle service not available
                if (event.error === 'service-not-allowed') {
                    console.warn('Speech recognition service not available');
                    this.currentTranscript.push('[Speech recognition service unavailable on this device.]');
                    this.updateLiveTranscript();
                    return;
                }
                
                // Safari/iOS specific errors
                if (this.browserInfo.browser === 'Safari' && this.isMobile) {
                    if (event.error === 'no-speech') {
                        console.warn('Safari mobile no-speech is normal, continuing');
                        return;
                    }
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
                        }, 1500);
                    }
                }
            };
            
            this.speechRecognition.onstart = () => {
                console.log('Speech recognition started');
                this.liveTranscriptText.innerHTML = '';
            };
            
            this.speechRecognition.start();
            console.log('Speech recognition initialized', {
                browser: this.browserInfo.browser,
                isMobile: this.isMobile,
                mode: this.speechRecognition.continuous ? 'continuous' : 'single-shot'
            });
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            console.warn('Recording will continue without transcription');
            this.liveTranscriptText.innerHTML = '<span class="text-yellow-300 text-sm">⚠️ Speech recognition not available on this browser. Recording continues.</span>';
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

    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.renderRecordings();
    }

    clearSearch() {
        this.searchQuery = '';
        this.searchInput.value = '';
        this.renderRecordings();
    }

    filterRecordings() {
        if (!this.searchQuery) {
            return this.recordings;
        }
        
        return this.recordings.filter(recording => {
            const searchLower = this.searchQuery.toLowerCase();
            const nameMatch = recording.name.toLowerCase().includes(searchLower);
            const dateMatch = recording.date.toLowerCase().includes(searchLower);
            const transcriptMatch = recording.transcript && recording.transcript.toLowerCase().includes(searchLower);
            
            return nameMatch || dateMatch || transcriptMatch;
        });
    }

    renderRecordings() {
        const filteredRecordings = this.filterRecordings();
        this.updateRecordingCount();
        console.log('Rendering recordings:', this.recordings.length, 'Search query:', this.searchQuery, 'Filtered:', filteredRecordings.length);
        
        if (filteredRecordings.length === 0) {
            this.recordingsList.innerHTML = `
                <div class="text-center py-16 px-6">
                    <div class="text-6xl mb-4">🎙️</div>
                    <p class="text-gray-400 text-lg">${this.searchQuery ? `No recordings match "${this.searchQuery}"` : 'No recordings yet. Start recording!'}</p>
                </div>
            `;
            this.clearSearchBtn.classList.add('hidden');
            this.updateSearchResults(filteredRecordings.length, this.searchQuery);
            return;
        }
        
        if (filteredRecordings.length > 0) {
            this.clearSearchBtn.classList.remove('hidden');
        }
        
        this.updateSearchResults(filteredRecordings.length, this.searchQuery);
        
        this.recordingsList.innerHTML = filteredRecordings.map(recording => {
            const transcriptClass = recording.transcript ? '' : 'hidden';
            const transcriptContent = recording.transcript || 'No transcript available. Transcription happens automatically during recording.';
            
            return `
                <div class="recording-item bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-700/70 transition-all duration-300 hover:shadow-lg active:scale-[0.99]" data-id="${recording.id}" onclick="recorder.toggleRecording(${recording.id})">
                    <div class="recording-header p-4 md:p-5">
                        <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div class="flex-1 min-w-0 w-full">
                                <div class="flex items-center justify-between mb-1">
                                    <div class="font-semibold text-white text-base md:text-lg truncate cursor-pointer hover:text-gray-300 transition-colors" onclick="event.stopPropagation(); recorder.editRecordingName(${recording.id})">${recording.name}</div>
                                    <button class="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-600 transition-colors text-gray-400 hover:text-white" onclick="event.stopPropagation(); recorder.editRecordingName(${recording.id})" title="Edit name">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div class="text-sm text-gray-400">${recording.date}</div>
                            </div>
                            <div class="flex items-center gap-2 w-full sm:w-auto">
                                <button class="tap-effect bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm flex-1 sm:flex-none" onclick="event.stopPropagation(); recorder.downloadRecording(${recording.id})">
                                    <span>💾</span> Download
                                </button>
                                <button class="tap-effect bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm flex-1 sm:flex-none" onclick="event.stopPropagation(); recorder.deleteRecording(${recording.id})">
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