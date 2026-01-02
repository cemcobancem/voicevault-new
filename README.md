# VoiceVault - Voice Recorder Web App

A modern, mobile-optimized voice recorder web application with real-time transcription capabilities.

## Features

- 🎤 **Record Audio**: Start and stop audio recordings using your microphone
- 📝 **Real-time Transcription**: Live transcription while recording using Web Speech API
- 💾 **Local Storage**: Recordings are saved to your browser's localStorage
- ✏️ **Edit Names**: Customize recording names to organize your library
- 📱 **Mobile Optimized**: Beautiful, responsive design optimized for Android and iOS
- ⬇️ **Download**: Download recordings as WebM audio files
- 🗑️ **Delete**: Remove recordings you no longer need
- 🎨 **Beautiful UI**: Modern design with Tailwind CSS, glassmorphism effects, and smooth animations
- 🔐 **Safe Areas**: Optimized for modern mobile devices with notches and rounded corners

## How to Use

### Starting the App

1. Open `index.html` in a modern web browser (Chrome or Edge recommended for best transcription support)
2. Allow microphone permissions when prompted

### Recording

1. Click **Start Recording** button (🎤)
2. The button will turn red and pulse while recording
3. Speak clearly - your words will appear in the Live Transcript panel in real-time
4. Click **Stop** (⏹️) when you're done
5. Your recording will appear in the recordings list with the saved transcript

### Playing & Viewing Recordings

- Tap any recording card to expand it
- Audio player and transcript appear below when expanded
- Tap again to collapse

### Transcribing

- Transcription happens **automatically** during recording
- You'll see your words appear in the Live Transcript panel as you speak
- Interim (preliminary) text appears in gray
- Finalized text appears in white
- The complete transcript is saved with the recording

### Editing Recording Names

1. Click on the recording name or the ✏️ edit icon
2. Enter a new name in the popup
3. Click OK to save

### Downloading

1. Expand the recording by tapping it
2. Click the **Download** button
3. The recording will be saved as a `.webm` file

### Deleting

1. Expand the recording by tapping it
2. Click the **Delete** button
3. Confirm deletion in the popup

## Technical Details

### Technology Stack

- **Frontend Framework**: Vanilla JavaScript
- **Styling**: Tailwind CSS (via CDN)
- **Speech Recognition**: Web Speech API
- **Audio Recording**: MediaRecorder API
- **Storage**: localStorage

### Storage

Recordings are stored as base64 encoded audio data in browser's localStorage:
- Recordings persist across browser sessions
- Storage is limited by your browser's localStorage quota (typically 5-10MB)
- For longer recordings, consider downloading them to free up space

### Transcription

The app uses Web Speech API for real-time transcription:
- **Browser Support**: Chrome, Edge, and Safari (partial support)
- **Language**: Currently set to English (en-US)
- **Process**: Speech is recognized in real-time while recording
- **Limitations**:
  - Requires a supported browser (Chrome recommended)
  - Accuracy depends on audio quality and speech clarity
  - May not work well with background noise

### Audio Format

- **Format**: WebM (Web Media)
- **Codec**: Opus
- **Compatibility**: Plays in most modern browsers

## Browser Compatibility

| Feature | Chrome | Edge | Safari | Firefox |
|---------|---------|------|--------|----------|
| Recording | ✅ | ✅ | ✅ | ✅ |
| Transcription | ✅ | ✅ | ⚠️ | ❌ |
| UI | ✅ | ✅ | ✅ | ✅ |

**Recommended**: Use Chrome or Edge for the best experience, especially for transcription.

## Mobile Optimization

### Android
- Optimized for touch interactions
- Smooth tap feedback
- Material Design-inspired UI elements
- Works great with Chrome or Edge

### iOS
- Safe area support for iPhone X and newer
- Optimized for Safari
- Smooth touch interactions
- Proper handling of viewport and scaling

## Troubleshooting

### Microphone not working
- Check that you've granted microphone permissions
- Ensure no other app is using the microphone
- Try refreshing the page and granting permissions again

### Transcription not working
- Make sure you're using Chrome or Edge
- Speak clearly and close to the microphone
- Check that JavaScript is enabled
- Try restarting the browser

### Storage quota exceeded
- Download some recordings and delete them from the app
- Clear old recordings you no longer need
- Check your browser's localStorage usage in developer tools

### Recording playback issues
- Ensure your browser supports WebM format
- Try downloading the file and playing it in a media player
- Check your system audio settings

## Future Enhancements

Potential features for future versions:
- Export transcripts as text files
- Edit and correct transcripts manually
- Support for multiple languages
- Upload to cloud storage
- Better transcription accuracy with API integration
- Recording trimming and editing
- Search functionality within transcripts
- Dark/light theme toggle
- Recording folders and organization
- Share recordings and transcripts

## License

MIT License - Feel free to use and modify as needed.

## Credits

Built with:
- [Tailwind CSS](https://tailwindcss.com/) for beautiful, responsive UI
- Web Speech API for transcription
- MediaRecorder API for audio recording