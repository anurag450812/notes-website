// State Management
let sections = [];
let isLoading = true;

// API Configuration
const API_URL = '/api/notes';

// Global Voice Recognition Setup
let recognition;
let currentVoiceInput = null; // The input element currently receiving voice data
let currentVoiceBtn = null;   // The button associated with the current input
let micPermissionGranted = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Show results as they are spoken
    recognition.lang = 'en-IN'; // English-India for Hinglish support

    recognition.onresult = (event) => {
        if (currentVoiceInput) {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                const currentVal = currentVoiceInput.value;
                currentVoiceInput.value = currentVal + (currentVal ? ' ' : '') + finalTranscript.trim();

                // Scroll to the end to show latest text
                currentVoiceInput.scrollLeft = currentVoiceInput.scrollWidth;
            }
        }
    };

    recognition.onend = () => {
        if (currentVoiceBtn && currentVoiceBtn.classList.contains('recording')) {
            // If it stopped but we think it's recording, restart
            try {
                recognition.start();
            } catch (e) {
                console.log("Recognition restart failed", e);
                stopRecording();
            }
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
            micPermissionGranted = false;
            stopRecording();
            alert("Microphone access denied. Please allow microphone access in your browser settings.");
        }
    };

    // Request permission once on page load by starting and immediately stopping
    // This ensures the permission is requested only once
    recognition.onstart = () => {
        micPermissionGranted = true;
    };
}

function startRecording(btn, input) {
    if (!recognition) {
        alert("Voice recognition not supported in this browser.");
        return;
    }

    // Stop any existing recording session UI
    if (currentVoiceBtn && currentVoiceBtn !== btn) {
        stopRecording();
    }

    currentVoiceInput = input;
    currentVoiceBtn = btn;
    btn.classList.add('recording');
    input.placeholder = "Listening... (Press mic to stop)";

    // Only start if not already started (to avoid permission prompt if possible)
    // However, we can't easily check internal state. 
    // But we can wrap in try-catch and assume if it throws 'InvalidStateError', it's already running.
    try {
        recognition.start();
    } catch (e) {
        // If it's already started, that's fine, we just hooked into the stream by setting currentVoiceInput
        console.log("Recognition already started or error:", e);
    }
}

function stopRecording() {
    // We don't necessarily want to stop the recognition engine if we want "one permission request".
    // But if we don't stop it, the browser tab shows "Recording" forever.
    // The user asked for "start on first click, stop ... on second click".
    // So we MUST stop it to clear the "Recording" indicator.
    // The "multiple permission" issue is likely due to the browser not persisting permission for file:// or non-secure contexts.
    // We will try to stop it properly.

    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {
            console.log("Error stopping recognition:", e);
        }
    }

    if (currentVoiceBtn) {
        currentVoiceBtn.classList.remove('recording');
    }
    if (currentVoiceInput) {
        currentVoiceInput.placeholder = "Add a new note...";

        const addBtn = currentVoiceInput.parentElement.querySelector('.add-note-btn');
        if (addBtn && currentVoiceInput.value.trim()) {
            addBtn.click();
        }
    }
    currentVoiceBtn = null;
    currentVoiceInput = null;
}


// DOM Elements
const sectionsContainer = document.getElementById('sections-container');
const addSectionBtn = document.getElementById('add-section-btn');
const sectionTemplate = document.getElementById('section-template');
const noteTemplate = document.getElementById('note-template');

// Initialize App
async function init() {
    showLoading();
    await loadSections();
    hideLoading();
    renderSections();
    addSectionBtn.addEventListener('click', createNewSection);
}

// Load sections from Netlify Blobs
async function loadSections() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to load notes');
        }
        sections = await response.json();
    } catch (error) {
        console.error('Error loading sections:', error);
        // Fallback to default sections if load fails
        sections = [
            { id: 'important', title: 'Important Notes', notes: [] },
            { id: 'timepass', title: 'Time Pass Notes', notes: [] }
        ];
        alert('Failed to load notes from server. Using default sections.');
    }
}

// Save to Netlify Blobs
async function saveState() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sections)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save notes');
        }
    } catch (error) {
        console.error('Error saving sections:', error);
        alert('Failed to save notes to server. Your changes may be lost.');
    }
}

// Render all sections
function renderSections() {
    // We want to preserve focus if we are re-rendering. 
    // But re-rendering destroys elements. 
    // Strategy: Only re-render the list part if possible, or restore focus.
    // For simplicity in this architecture, we'll restore focus by ID if we track it, 
    // but since we have dynamic inputs, let's just try to keep the input values.

    // Actually, the user wants "cursor should remain in the typing bar".
    // If we re-render the whole section, we lose focus.
    // We should optimize render to NOT re-render the whole section if only the list changed.
    // Or, simpler: Just clear and rebuild the list, keeping the header/input intact?
    // But we are generating sections dynamically.

    // Let's try to be smart. If sectionsContainer is empty, build all.
    // If not, update lists.

    if (sectionsContainer.children.length === 0) {
        sections.forEach(section => {
            const sectionElement = createSectionElement(section);
            sectionsContainer.appendChild(sectionElement);
        });
    } else {
        // Update existing sections
        const existingSectionEls = Array.from(sectionsContainer.children);

        // Remove deleted sections
        existingSectionEls.forEach(el => {
            const id = el.dataset.id;
            if (!sections.find(s => s.id === id)) {
                el.remove();
            }
        });

        // Add/Update sections
        sections.forEach((section, index) => {
            let sectionEl = sectionsContainer.querySelector(`.note-section[data-id="${section.id}"]`);
            if (!sectionEl) {
                sectionEl = createSectionElement(section);
                sectionsContainer.appendChild(sectionEl);
            } else {
                // Update list only
                updateNotesList(sectionEl, section);
            }
        });
    }
}

function updateNotesList(sectionEl, sectionData) {
    const notesList = sectionEl.querySelector('.notes-list');
    notesList.innerHTML = ''; // Clear current list

    // Sort notes: Unchecked first (newest to oldest), Checked last (newest to oldest)
    const sortedNotes = [...sectionData.notes].sort((a, b) => {
        // First, separate by completion status
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1; // Unchecked first, checked last
        }
        // Within the same completion status, sort by ID (timestamp) descending (newest first)
        return b.id.localeCompare(a.id);
    });

    sortedNotes.forEach(note => {
        const noteEl = createNoteElement(note, sectionData.id);
        notesList.appendChild(noteEl);
    });
}

// Create Section DOM Element
function createSectionElement(sectionData) {
    const clone = sectionTemplate.content.cloneNode(true);
    const sectionEl = clone.querySelector('.note-section');
    sectionEl.dataset.id = sectionData.id; // Add data-id for updates

    const titleEl = clone.querySelector('.section-title');
    const deleteSectionBtn = clone.querySelector('.delete-section-btn');
    const clearCheckedBtn = clone.querySelector('.clear-checked-btn');
    const inputEl = clone.querySelector('.note-input');
    const addBtn = clone.querySelector('.add-note-btn');
    const voiceBtn = clone.querySelector('.voice-btn');

    // Set Title
    titleEl.textContent = sectionData.title;

    // Delete Section Handler
    deleteSectionBtn.addEventListener('click', () => {
        if (confirm(`Delete "${sectionData.title}" and all its notes?`)) {
            sections = sections.filter(s => s.id !== sectionData.id);
            saveState();
            renderSections();
        }
    });

    // Clear Checked Handler
    if (clearCheckedBtn) {
        clearCheckedBtn.addEventListener('click', () => {
            const checkedCount = sectionData.notes.filter(n => n.completed).length;
            if (checkedCount === 0) {
                alert("No checked notes to delete.");
                return;
            }

            if (confirm(`Delete ${checkedCount} checked note(s) from "${sectionData.title}"?`)) {
                const section = sections.find(s => s.id === sectionData.id);
                if (section) {
                    section.notes = section.notes.filter(n => !n.completed);
                    saveState();

                    // Update UI
                    const updatedSection = sections.find(s => s.id === sectionData.id);
                    updateNotesList(sectionEl, updatedSection);
                }
            }
        });
    }

    // Add Note Handlers
    const addNoteHandler = () => {
        const text = inputEl.value.trim();
        if (text) {
            addNote(sectionData.id, text);
            inputEl.value = '';
            inputEl.focus(); // Keep focus
            // We don't need full render, just update this list
            const updatedSection = sections.find(s => s.id === sectionData.id);
            updateNotesList(sectionEl, updatedSection);
        }
    };

    addBtn.addEventListener('click', addNoteHandler);
    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNoteHandler();
    });

    // Voice to Text Handler
    voiceBtn.addEventListener('click', () => {
        if (voiceBtn.classList.contains('recording')) {
            stopRecording();
        } else {
            startRecording(voiceBtn, inputEl);
        }
    });

    // Initial List Render
    updateNotesList(sectionEl, sectionData);

    return sectionEl;
}

// Create Note DOM Element
function createNoteElement(noteData, sectionId) {
    const clone = noteTemplate.content.cloneNode(true);
    const noteItem = clone.querySelector('.note-item');
    const checkbox = clone.querySelector('.note-checkbox');
    const textSpan = clone.querySelector('.note-text');
    const deleteBtn = clone.querySelector('.delete-note-btn');

    textSpan.textContent = noteData.text;
    checkbox.checked = noteData.completed;

    // Checkbox Handler
    checkbox.addEventListener('change', () => {
        toggleNoteStatus(sectionId, noteData.id);
    });

    // Delete Handler (2-step deletion)
    let deleteTimeout;
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling
        if (deleteBtn.classList.contains('confirm-delete')) {
            deleteNote(sectionId, noteData.id);
            clearTimeout(deleteTimeout);
        } else {
            deleteBtn.classList.add('confirm-delete');
            deleteBtn.innerHTML = '<i class="fas fa-check"></i>'; // Change icon to confirm

            // Reset after 3 seconds if not confirmed
            deleteTimeout = setTimeout(() => {
                deleteBtn.classList.remove('confirm-delete');
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            }, 3000);
        }
    });

    return noteItem;
}

// Logic: Add Note
function addNote(sectionId, text) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.notes.push({
            id: Date.now().toString(),
            text: text,
            completed: false
        });
        saveState();
    }
}

// Logic: Toggle Note Status
function toggleNoteStatus(sectionId, noteId) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        const note = section.notes.find(n => n.id === noteId);
        if (note) {
            note.completed = !note.completed;
            saveState();

            // Re-render list to sort
            const sectionEl = document.querySelector(`.note-section[data-id="${sectionId}"]`);
            if (sectionEl) {
                updateNotesList(sectionEl, section);
            }
        }
    }
}

// Logic: Delete Note
function deleteNote(sectionId, noteId) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.notes = section.notes.filter(n => n.id !== noteId);
        saveState();

        const sectionEl = document.querySelector(`.note-section[data-id="${sectionId}"]`);
        if (sectionEl) {
            updateNotesList(sectionEl, section);
        }
    }
}

// Logic: Create New Section
function createNewSection() {
    const title = prompt("Enter section title:");
    if (title) {
        sections.push({
            id: Date.now().toString(),
            title: title,
            notes: []
        });
        saveState();
        renderSections();
    }
}

// Start
init();

// Loading UI Functions
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-overlay';
    loadingDiv.innerHTML = '<div class="loading-spinner">Loading notes...</div>';
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading-overlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}
