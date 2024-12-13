  // Global variables
  let callFrame;
  let isMuted = false;
  let localParticipantId;

  // Event Listeners
  document.getElementById('host-join-btn').addEventListener('click', () => {
      joinRoom(true, "mutowif");
  });

  document.getElementById('audience-join-btn').addEventListener('click', () => {
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
      muteButton.classList.toggle('muted', isMuted);
  });

  document.getElementById('leave').addEventListener('click', () => {
      if (callFrame) {
          callFrame.leave();
          location.reload();
      }
  });

  // Setup track listeners
  function setupTrackListeners() {
      callFrame.on('track-started', (event) => {
          const track = event.track;
          const stream = event.stream;
          const participant = event.participant;

          if (track.kind === 'video') {
              const videoElement = document.createElement('video');
              videoElement.srcObject = stream;
              videoElement.autoplay = true;
              videoElement.muted = participant.local;
              videoElement.id = `video-${participant.id}`;

              if (participant.local) {
                  document.getElementById('local-video').appendChild(videoElement);
              } else {
                  document.getElementById('remote-videos').appendChild(videoElement);
              }
          }

          if (track.kind === 'audio') {
              const audioElement = document.createElement('audio');
              audioElement.srcObject = stream;
              audioElement.autoplay = true;
              audioElement.id = `audio-${participant.id}`;
          }
      });
  }

  // Join Room Function
  async function joinRoom(isHost, userName = 'Audience') {
      try {
          // Replace with your actual Daily.co room URL and token
          const roomUrl = 'https://sunthre.daily.co/testings';
          const token = 'your-token';

          callFrame = window.DailyIframe.createCallObject({
              url: roomUrl,
              token: token,
              showLeaveButton: false,
          });

          await callFrame.join({
              userName: userName
          });

          // Hide join interfaces
          document.getElementById('host-join-btn').style.display = 'none';
          document.getElementById('audience-container').style.display = 'none';
          document.getElementById('leave').style.display = 'block';

          // Setup mute for host
          if (userName === "mutowif") {
              document.getElementById('local-mute').style.display = 'block';
          } else {
              document.getElementById('local-mute').style.display = 'none';
          }

          // Setup track listeners
          setupTrackListeners();

          // Participant tracking
          callFrame.on('participant-joined', updateParticipants);
          callFrame.on('participant-left', updateParticipants);
          
          updateParticipants();

      } catch (error) {
          console.error('Error joining room:', error);
          alert('Failed to join the room. Please try again.');
      }
  }

  // Update Participants
  function updateParticipants() {
      if (!callFrame) return;

      const participants = callFrame.participants();
      const participantList = document.getElementById('participants-list');

      participantList.innerHTML = Object.values(participants)
          .map(participant => `<div>${participant.user_name || "Unknown User"}</div>`)
          .join('');
  }