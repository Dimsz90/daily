let callFrame;
let isMuted = false;
let localParticipantId;

document.getElementById('host-join').addEventListener('click', () => {
    joinRoom(true, "mutowif");
});

document.getElementById('audience-join').addEventListener('click', () => {
    const userName = document.getElementById('audience-name').value.trim();
    if (!userName) {
        alert("Please enter your name!");
        return;
    }
    joinRoom(false, userName);
});

document.getElementById('local-mute').addEventListener('click', () => {
    isMuted = !isMuted;
    if (callFrame) {
        callFrame.setLocalAudio(!isMuted);
        
        const muteButton = document.getElementById('local-mute');
        if (isMuted) {
            muteButton.classList.add('muted');
        } else {
            muteButton.classList.remove('muted');
        }
    }
});

document.getElementById('leave').addEventListener('click', () => {
    if (callFrame) {
        callFrame.leave();
        location.reload();
    }
});

async function joinRoom(isHost, userName = 'Audience') {
    try {
        // Ensure any existing callFrame is destroyed first
        if (callFrame) {
            try {
                callFrame.leave();
            } catch (leaveError) {
                console.warn('Error leaving previous call:', leaveError);
            }
        }

        // Create call object with updated configuration
        callFrame = window.DailyIframe.createCallObject({
            url: 'https://sunthre.daily.co/testings',
            token: 'dummy-token',
            showLeaveButton: false,
            // Updated configuration for audio/video
            subscribeToTracksAutomatically: true,
            audioSource: true,
            videoSource: true
        });

        // Configure participants settings
        await callFrame.join({
            userName: userName,
            audioSource: true,
            videoSource: true
        });

        // UI updates
        document.getElementById('host-join').style.display = 'none';
        document.getElementById('audience-container').style.display = 'none';
        document.getElementById('leave').style.display = 'block';

        // Host-specific settings
        if (userName === "mutowif") {
            document.getElementById('local-mute').style.display = 'flex';
            isMuted = false;
            callFrame.setLocalAudio(true);
        } else {
            // Audience settings
            document.getElementById('local-mute').style.display = 'none';
            isMuted = true;
            callFrame.setLocalAudio(false);
        }

        // Store local participant ID
        localParticipantId = callFrame.participants().local.id;

        // Event listeners
        callFrame.on('participant-joined', updateParticipants);
        callFrame.on('participant-left', updateParticipants);
        callFrame.on('participant-updated', updateParticipants);

        // Debug event listeners
        callFrame.on('error', (error) => {
            console.error('Daily.co Error:', error);
        });

        callFrame.on('track-started', (event) => {
            console.log('Track started:', event);
        });

        updateParticipants();

    } catch (error) {
        console.error('Error joining room:', error);
        
        // Optional: Display error to user
        const errorDisplay = document.getElementById('error-display');
        if (errorDisplay) {
            errorDisplay.textContent = `Failed to join room: ${error.message}`;
        }
    }
}

function updateParticipants() {
    if (!callFrame) return;

    const participants = callFrame.participants();
    const participantList = document.getElementById('participants-list');

    if (participantList) {
        participantList.innerHTML = Object.values(participants)
            .map(participant => {
                // Detailed logging for debugging
                console.log('Participant:', {
                    id: participant.id,
                    userName: participant.user_name,
                    audioMuted: participant.audio,
                    videoMuted: participant.video
                });
                return `<div>${participant.user_name || "Unknown User"}</div>`;
            })
            .join('');
    }
}