        const DAILY_ROOM_URL = 'https://sunthre.daily.co/TESTINGS';
        let callObject = null;
        let currentUserRole = null;

        // Event Listeners for Join Buttons
        document.getElementById('join-as-host').addEventListener('click', () => {
            joinCall('host', 'Host');
        });

        document.getElementById('join-as-audience').addEventListener('click', () => {
            const nameInput = document.getElementById('audience-name');
            const audienceName = nameInput.value.trim();

            if (!audienceName) {
                alert('Silakan masukkan nama Anda sebelum bergabung.');
                return;
            }

            joinCall('audience', audienceName);
        });

        // Leave Call Button
        document.getElementById('leave-call').addEventListener('click', () => {
            leaveCall();
        });

        // Mute/Unmute Microphone Buttons
        document.getElementById('mute-microphone').addEventListener('click', () => {
            muteAudio(true);
        });

        document.getElementById('unmute-microphone').addEventListener('click', () => {
            muteAudio(false);
        });

        function muteAudio(shouldMute) {
            if (callObject) {
                callObject.setLocalAudio(!shouldMute);
                document.getElementById('mute-microphone').classList.toggle('hidden', shouldMute);
                document.getElementById('unmute-microphone').classList.toggle('hidden', !shouldMute);
            }
        }

        function joinCall(role, userName) {
            // Check microphone permissions before creating call object
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    // Store current user role
                    currentUserRole = role;

                    // Create call object
                    callObject = Daily.createCallObject({
                        audioSource: true,
                        videoSource: false,
                    });

                    // Error handling for camera/audio
                    callObject.on('camera-error', (event) => {
                        console.error('Camera/Audio error: ', event);
                        alert('There was an error accessing the microphone. Please check your device settings.');
                    });

                    // Join the call
                    callObject.join({
                        url: DAILY_ROOM_URL,
                        userName: userName,
                        userData: { role },
                    });

                    // UI Updates
                    document.getElementById('controls').classList.add('hidden');
                    document.getElementById('call').classList.remove('hidden');
                    document.getElementById('status').textContent = `Joined as ${role}`;

                    // Audio settings based on role
                    if (role === 'host') {
                        // Enable microphone for host
                        callObject.setLocalAudio(true);
                        document.querySelector('.microphone-controls').classList.remove('hidden');
                    } else if (role === 'audience') {
                        // Disable microphone for audience
                        callObject.setLocalAudio(false);
                        document.querySelector('.microphone-controls').classList.add('hidden');
                    }

                    // Setup participant listeners
                    setupParticipantListeners();
                })
                .catch((error) => {
                    console.error('Microphone access denied:', error);
                    alert('Please grant microphone permission to join the call.');
                });
        }

        function leaveCall() {
            if (callObject) {
                callObject.leave();
                callObject.destroy();
                callObject = null;
            }

            // Reset UI
            document.getElementById('controls').classList.remove('hidden');
            document.getElementById('call').classList.add('hidden');
            document.getElementById('status').textContent = '';
            document.getElementById('audience-name').value = '';

            // Reset microphone buttons
            document.getElementById('mute-microphone').classList.remove('hidden');
            document.getElementById('unmute-microphone').classList.add('hidden');

            // Clear participant list
            updateParticipantList([]);
        }

        function setupParticipantListeners() {
            // Detect when participants join or leave
            callObject.on('participant-joined', (event) => {
                console.log('Participant joined:', event.participant);
                updateParticipantList(Object.values(callObject.participants()));
            });

            callObject.on('participant-left', (event) => {
                console.log('Participant left:', event.participant);
                updateParticipantList(Object.values(callObject.participants()));
            });

            // Detect changes in participant properties
            callObject.on('participant-updated', (event) => {
                const participant = event.participant;
                console.log('Participant updated:', participant);
                updateParticipantList(Object.values(callObject.participants()));
            });

            // Initial sync
            callObject.on('joined-meeting', () => {
                updateParticipantList(Object.values(callObject.participants()));
            });
        }

        function updateParticipantList(participants) {
            const audienceUl = document.getElementById('audience-ul');
            audienceUl.innerHTML = '';

            participants.forEach((participant) => {
                const li = document.createElement('li');
                li.textContent = participant.user_name || 'Anonymous';
                audienceUl.appendChild(li);
            });

            if (participants.length > 0) {
                document.getElementById('audience-list').classList.remove('hidden');
            } else {
                document.getElementById('audience-list').classList.add('hidden');
            }
        }
    