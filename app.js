const DAILY_ROOM_URL = 'https://sunthre.daily.co/TESTINGS'; 
let callObject = null;
let audienceList = [];

document.getElementById('join-as-host').addEventListener('click', () => {
  joinCall('host');
});

document.getElementById('join-as-audience').addEventListener('click', () => {
  joinCall('audience');
});

document.getElementById('leave-call').addEventListener('click', () => {
  leaveCall();
});

document.getElementById('mute-microphone').addEventListener('click', () => {
  muteMicrophone();
});

document.getElementById('unmute-microphone').addEventListener('click', () => {
  unmuteMicrophone();
});

function joinCall(role) {
  // Inisialisasi panggilan
  callObject = Daily.createCallObject({
    audioSource: true, // Memastikan audio diaktifkan
    videoSource: false, // Menonaktifkan video
  });

  // Menangani error jika perangkat audio tidak tersedia
  callObject.on('camera-error', (event) => {
    console.error('Camera error: ', event);
    alert('There was an error accessing the microphone. Please check your device settings.');
  });


  callObject.join({
    url: DAILY_ROOM_URL,
    userName: role === 'host' ? 'Host' : `Audience ${audienceList.length + 1}`,
    userData: { role },
  });

  // Tampilkan UI panggilan
  document.getElementById('controls').classList.add('hidden');
  document.getElementById('call').classList.remove('hidden');
  document.getElementById('status').textContent = `Joined as ${role}`;

  if (role === 'audience') {
    // Tambahkan audiens ke daftar
    audienceList.push(`Audience ${audienceList.length + 1}`);
    updateAudienceList();
  }

  // Periksa peran dan kontrol mikrofon
  if (role === 'host') {
    // Tampilkan tombol mute/unmute mikrofon untuk host
    document.getElementById('mute-microphone').classList.remove('hidden');
    document.getElementById('unmute-microphone').classList.remove('hidden');

    // Cek status audio lokal host
    callObject.on('local-audio-updated', (event) => {
      if (event.isEnabled) {
        console.log("Host's microphone is on.");
      } else {
        console.log("Host's microphone is off.");
      }
    });
  } else {
    // Audiens tidak bisa mengaktifkan mikrofon mereka
    callObject.setLocalAudio(false);
    callObject.on('local-audio-updated', (event) => {
      if (event.isEnabled) {
        console.log("Audience tried to turn on microphone, but it is disabled.");
        callObject.setLocalAudio(false); // Pastikan audiens tetap ter-mute
      }
    });
  }
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
  document.getElementById('mute-microphone').classList.add('hidden');
  document.getElementById('unmute-microphone').classList.add('hidden');
  document.getElementById('audience-list').classList.add('hidden');
  audienceList = []; // Reset daftar audiens
  updateAudienceList();
}

function muteMicrophone() {
  // Mematikan mikrofon host
  callObject.setLocalAudio(false);
  console.log("Host's microphone muted.");
  document.getElementById('mute-microphone').classList.add('hidden');
  document.getElementById('unmute-microphone').classList.remove('hidden');
}

function unmuteMicrophone() {
  // Mengaktifkan mikrofon host
  callObject.setLocalAudio(true);
  console.log("Host's microphone unmuted.");
  document.getElementById('unmute-microphone').classList.add('hidden');
  document.getElementById('mute-microphone').classList.remove('hidden');
}

function updateAudienceList() {
  const audienceUl = document.getElementById('audience-ul');
  audienceUl.innerHTML = '';
  audienceList.forEach(audience => {
    const li = document.createElement('li');
    li.textContent = audience;
    audienceUl.appendChild(li);
  });
  if (audienceList.length > 0) {
    document.getElementById('audience-list').classList.remove('hidden');
  } else {
    document.getElementById('audience-list').classList.add('hidden');
  }
}