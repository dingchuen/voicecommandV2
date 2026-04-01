document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const fileInput = document.getElementById('audio-file');
    const targetSelect = document.getElementById('target-select');
    const assignBtn = document.getElementById('assign-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const buttons = document.querySelectorAll('.command-btn');

    // --- State ---
    // Store Blob URLs for the current session
    const audioState = {
        1: null, 2: null, 3: null, 4: null, 5: null
    };

    // --- Initialization ---
    loadUIState();

    // --- Event Listeners ---

    // 1. Assign Audio Logic
    assignBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        const targetId = targetSelect.value;

        if (!file) {
            alert("Please select an audio file first.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Audio = e.target.result;
            
            // Store in state
            audioState[targetId] = new Audio(base64Audio);
            audioState[targetId].volume = volumeSlider.value;
            
            // Update UI
            updateButtonVisuals(targetId, file.name);
            
            // Persist Data to LocalStorage
            saveToStorage(targetId, file.name, base64Audio);
        };
        reader.readAsDataURL(file);
        
        // Reset input for convenience
        fileInput.value = '';
    });

    // 2. Volume Control Logic
    volumeSlider.addEventListener('input', (e) => {
        const vol = e.target.value;
        Object.values(audioState).forEach(audio => {
            if (audio) audio.volume = vol;
        });
    });

    // 3. Play Audio Logic
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            
            if (audioState[id]) {
                // Reset time to 0 to allow rapid re-clicking
                audioState[id].currentTime = 0;
                audioState[id].play().catch(e => console.error("Playback error:", e));
                
                // Simple visual feedback for click
                btn.classList.add('playing');
                setTimeout(() => btn.classList.remove('playing'), 200);
            } else {
                // Optional: animation to show it's empty
                btn.style.animation = "shake 0.3s";
                setTimeout(() => btn.style.animation = "", 300);
            }
        });
    });

    // --- Helper Functions ---

    function updateButtonVisuals(id, fileName) {
        const btn = document.querySelector(`.command-btn[data-id="${id}"]`);
        if (btn) {
            btn.classList.add('active');
            btn.textContent = fileName; // Display filename on button
            btn.title = `Click to play ${fileName}`;
        }
    }

    function saveToStorage(id, fileName, base64Data) {
        const storedData = JSON.parse(localStorage.getItem('petCommandData')) || {};
        storedData[id] = { name: fileName, data: base64Data };
        localStorage.setItem('petCommandData', JSON.stringify(storedData));
    }

    function loadUIState() {
        const storedData = JSON.parse(localStorage.getItem('petCommandData'));
        if (storedData) {
            for (const [id, fileInfo] of Object.entries(storedData)) {
                const btn = document.querySelector(`.command-btn[data-id="${id}"]`);
                if (btn && fileInfo.data) {
                    // Restore Audio from Base64
                    audioState[id] = new Audio(fileInfo.data);
                    audioState[id].volume = volumeSlider.value;
                    btn.classList.add('active');
                    btn.textContent = fileInfo.name;
                }
            }
        }
    }
});
