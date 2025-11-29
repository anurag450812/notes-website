# Notes Website

A beautiful, responsive notes application with voice-to-text functionality and a premium dark mode design.

## Features

- 📝 **Quick Note Taking**: Add notes with one click or press Enter
- 🎤 **Voice-to-Text**: Speak your notes using the built-in voice recognition
- ✅ **Task Management**: Check off completed notes (they automatically move to the bottom)
- 🗑️ **Easy Deletion**: Two-click deletion for individual notes, or clear all checked notes at once
- 📂 **Custom Sections**: Create unlimited sections to organize your notes
- 💾 **Auto-Save**: All notes are automatically saved to your browser's local storage
- 🎨 **Premium Design**: Beautiful dark mode with glassmorphism effects
- 📱 **Responsive**: Works perfectly on both desktop and mobile devices

## How to Use

1. **Add a Note**: Type in the input field and click the + button or press Enter
2. **Voice Input**: Click the microphone icon to start speaking, click again to stop and add the note
3. **Complete a Note**: Click the checkbox to mark a note as complete
4. **Delete a Note**: Click the trash icon once to confirm, then click again to delete
5. **Clear Checked Notes**: Click the broom icon in the section header to delete all completed notes
6. **Create a Section**: Click "New Section" to add a new category
7. **Delete a Section**: Click the trash icon in the section header

## Technologies Used

- HTML5
- CSS3 (with Glassmorphism effects)
- Vanilla JavaScript
- Web Speech API for voice recognition
- LocalStorage for data persistence
- Font Awesome for icons
- Google Fonts (Outfit)

## Installation

Simply open `index.html` in a modern web browser. No build process or dependencies required!

For the best experience with voice-to-text:
- Use a Chromium-based browser (Chrome, Edge, Brave)
- Allow microphone permissions when prompted
- For persistent permissions, serve the site over HTTPS or use a local server

## Local Development

To run with a local server (recommended for voice features):

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Safari (Limited voice support)
- ✅ Firefox (Limited voice support)

## License

MIT License - feel free to use this project however you'd like!
