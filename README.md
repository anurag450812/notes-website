# Notes Website

A beautiful, responsive notes application with voice-to-text functionality, premium dark mode design, and cloud sync via Netlify Blobs.

## Features

- 📝 **Quick Note Taking**: Add notes with one click or press Enter
- 🎤 **Voice-to-Text**: Speak your notes using the built-in voice recognition
- ✅ **Task Management**: Check off completed notes (they automatically move to the bottom)
- 🗑️ **Easy Deletion**: Two-click deletion for individual notes, or clear all checked notes at once
- 📂 **Custom Sections**: Create unlimited sections to organize your notes
- ☁️ **Cloud Sync**: All notes are stored in Netlify Blobs for seamless sync across devices
- 💾 **Auto-Save**: All changes are automatically saved to the cloud
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
- Netlify Blobs for cloud storage
- Netlify Functions for serverless API
- Font Awesome for icons
- Google Fonts (Outfit)

## Deployment on Netlify

### Prerequisites
- A [Netlify](https://www.netlify.com/) account
- Git repository (GitHub, GitLab, or Bitbucket)

### Steps to Deploy

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Add Netlify Blobs storage"
   git push
   ```

3. **Deploy to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Netlify will automatically detect the settings from `netlify.toml`
   - Click "Deploy site"

4. **That's it!** Your notes app is now live with cloud storage. All users will have their notes synced across devices.

## Local Development

To run with a local server (recommended for testing):

```bash
# Install dependencies
npm install

# Run Netlify Dev (includes functions)
npm run dev
```

This will start the development server at `http://localhost:8888` with Netlify Functions enabled.

For the best experience with voice-to-text:
- Use a Chromium-based browser (Chrome, Edge, Brave)
- Allow microphone permissions when prompted

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Safari (Limited voice support)
- ✅ Firefox (Limited voice support)

## License

MIT License - feel free to use this project however you'd like!
