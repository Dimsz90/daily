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
    callFrame.setLocalAudio(!isMuted);

    const muteButton = document.getElementById('local-mute');
    if (isMuted) {
        muteButton.classList.add('muted');
    } else {
        muteButton.classList.remove('muted');
    }
});

document.getElementById('leave').addEventListener('click', () => {
    callFrame.leave();
    location.reload();
});

async function joinRoom(isHost, userName = 'Audience') {
    try {
        // Simulasi API token
        const roomUrl = 'https://sunthre.daily.co/testings';
        const token = 'dummy-token'; // Ganti dengan token sebenarnya

        callFrame = window.DailyIframe.createCallObject({
            url: roomUrl,
            token: token,
            showLeaveButton: false,
        });

        await callFrame.join();

        document.getElementById('host-join').style.display = 'none';
        document.getElementById('audience-container').style.display = 'none';
        document.getElementById('leave').style.display = 'block';

        if (userName === "mutowif") {
            // Tampilkan tombol mute/unmute jika nama adalah "mutowif"
            document.getElementById('local-mute').style.display = 'flex';
        } else {
            // Sembunyikan tombol mute/unmute dan set audio ke mute untuk nama lain
            document.getElementById('local-mute').style.display = 'none';
            isMuted = true;
            callFrame.setLocalAudio(false);
        }

        localParticipantId = callFrame.participants().local.id;

        callFrame.on('participant-joined', updateParticipants);
        callFrame.on('participant-left', updateParticipants);
        callFrame.on('participant-updated', updateParticipants);

        updateParticipants();
    } catch (error) {
        console.error('Error joining room:', error);
    }
}

function updateParticipants() {
    const participants = callFrame.participants();
    const participantList = document.getElementById('participants-list');

    participantList.innerHTML = Object.values(participants)
        .map(participant => `<div>${participant.user_name || "Unknown User"}</div>`)
        .join('');
}
