# 🎙️ VoiceVault - Voice Recorder with AI Transcription

<div align="center">

![VoiceVault](https://img.shields.io/badge/VoiceVault-v1.0.0-success?style=for-the-badge)
![Mobile](https://img.shields.io/badge/Mobile-Optimized-green?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Record. Transcribe. Remember.**

A modern, mobile-optimized voice recorder web application with real-time transcription using Web Speech API.

[Live Demo](https://cemcobancem.github.io/voicevault-new/) • [Features](#-features) • [Getting Started](#-getting-started)

</div>

---

## 🌟 Features

| Feature | Description |
|----------|-------------|
| 🎤 **Real-time Recording** | Capture audio with high-quality MediaRecorder API |
| 📝 **Live Transcription** | Automatic speech-to-text while recording using Web Speech API |
| 💾 **Local Storage** | Recordings saved to browser's localStorage - no cloud required |
| 📱 **Mobile-Optimized** | Perfect for Android and iOS with touch-friendly interface |
| ✨ **Beautiful UI** | Modern design with Tailwind CSS and glassmorphism effects |
| ✏️ **Custom Names** | Edit recording names to organize your library |
| 🔄 **Tap to Expand** | Compact view with expandable recording cards |
| ⬇️ **Download Audio** | Save recordings as WebM files |
| 🗑️ **Easy Deletion** | Remove recordings with one tap |
| 🔐 **Safe Areas** | Optimized for notched devices (iPhone X+) |

---

## 🚀 Live Demo

Try VoiceVault right now: **https://cemcobancem.github.io/voicevault-new/**

---

## 📸 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/800x400/1f2937/ffffff?text=VoiceVault+App+Screenshot" alt="VoiceVault App" width="600"/>
</div>

---

## 🎯 Getting Started

### Prerequisites

- Modern web browser (Chrome, Edge, or Safari)
- Microphone access permission
- JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cemcobancem/voicevault-new.git
   cd voicevault-new
   ```

2. **Open in browser**
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Or simply open index.html in your browser
   open index.html  # macOS
   xdg-open index.html  # Linux
   start index.html  # Windows
   ```

3. **Allow microphone permissions** when prompted

That's it! No build process or dependencies required.

---

## 📖 Usage

### Recording Audio

1. Click **Start Recording** (🎤)
2. Speak clearly - transcription appears in real-time
3. Click **Stop** (⏹️) when finished
4. Recording is saved automatically with transcript

### Managing Recordings

- **View Recording**: Tap any recording card to expand
- **Edit Name**: Click recording name or ✏️ icon
- **Download**: Click 💾 to save as WebM file
- **Delete**: Click 🗑️ to remove

### Transcription

Transcription happens **automatically** during recording:
- **Live Panel**: Shows text as you speak
- **Interim Text**: Gray text (preliminary recognition)
- **Final Text**: White text (confirmed words)
- **Saved**: Complete transcript saved with recording

---

## 🎨 Technology Stack

- **Frontend**: Vanilla JavaScript
- **Styling**: Tailwind CSS (via CDN)
- **Speech Recognition**: Web Speech API
- **Audio Recording**: MediaRecorder API
- **Storage**: localStorage API
- **Icons**: SVG inline (no external dependencies)

---

## 📊 Browser Compatibility

| Browser | Recording | Transcription | UI | Recommended |
|----------|------------|----------------|-----|-------------|
| Chrome | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Safari | ✅ | ⚠️ Partial | ✅ |
| Firefox | ✅ | ❌ | ⚠️ |

**Best Experience**: Chrome or Edge for full transcription support.

---

## 📱 Mobile Experience

### Android
- Material Design-inspired UI
- Smooth touch feedback
- Optimized for Chrome/Edge browsers

### iOS
- Safe area support for notched devices
- Safari-optimized
- Proper viewport handling
- Smooth animations

---

## 🔧 Configuration

### Customization

Edit `app.js` to customize:

```javascript
// Change language (default: en-US)
this.speechRecognition.lang = 'tr-TR'; // Turkish

// Change audio format
new Blob(this.audioChunks, { type: 'audio/webm' });

// Change storage key
localStorage.setItem('voiceRecordings', ...);
```

### Tailwind Theme

Customize colors in `tailwind.config` in `index.html`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

---

## 📂 Project Structure

```
voicevault-new/
├── index.html          # Main application with Tailwind CSS
├── app.js             # Recording & transcription logic
├── styles.css          # Custom CSS overrides
├── README.md           # This file
├── package.json        # Project metadata
├── .gitignore         # Git ignore rules
└── docs/              # Additional documentation
    ├── SECURITY_SETUP.md
    ├── QUICK_SETUP.md
    ├── GITHUB_SETUP.md
    └── SETUP_SUMMARY.md
```

---

## 🐛 Troubleshooting

### Microphone Not Working

- ✅ Check microphone permissions are granted
- ✅ Ensure no other app is using microphone
- ✅ Refresh page and re-grant permissions
- ✅ Check browser settings

### Transcription Not Working

- ✅ Use Chrome or Edge browser
- ✅ Speak clearly and close to microphone
- ✅ Ensure JavaScript is enabled
- ✅ Check for background noise

### Storage Quota Exceeded

- ✅ Download some recordings
- ✅ Delete old recordings
- ✅ Clear browser localStorage

---

## 🔒 Security & Privacy

- **No Cloud Storage**: All data stays on your device
- **Local Processing**: Speech recognition runs in browser
- **No External APIs**: No third-party services
- **No Tracking**: No analytics or user tracking

---

## 🚀 Roadmap

- [ ] Multi-language support
- [ ] Export transcripts as text files
- [ ] Manual transcript editing
- [ ] Search within recordings
- [ ] Recording folders/organization
- [ ] Cloud storage integration
- [ ] Share recordings
- [ ] Recording trimming/editing
- [ ] Advanced transcription with AI APIs

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a Pull Request

---

## 📄 License

MIT License - Feel free to use and modify as needed.

```
MIT License

Copyright (c) 2025 VoiceVault

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🌟 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for beautiful UI
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for transcription
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) for recording

---

## 📞 Support & Feedback

- **Issues**: [Report bugs](https://github.com/cemcobancem/voicevault-new/issues)
- **Discussions**: [Feature requests](https://github.com/cemcobancem/voicevault-new/discussions)
- **Email**: For business inquiries

---

<div align="center">

**Made with ❤️ by [cemcobancem](https://github.com/cemcobancem)**

[⭐ Star this repo](https://github.com/cemcobancem/voicevault-new) • 
[🍴 Fork this repo](https://github.com/cemcobancem/voicevault-new/fork) •
[📖 View documentation](https://github.com/cemcobancem/voicevault-new/blob/main/README.md)

</div>