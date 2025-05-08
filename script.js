const mainMenu = document.getElementById('main-menu');
const menuItems = mainMenu.querySelectorAll('li');
const screen = document.getElementById('screen');
const screens = screen.querySelectorAll('div[id$="-screen"]');
const remoteButtons = document.querySelectorAll('#remote button');

let currentMenuItemIndex = 0;
let currentPlaybackSpeed = 1;
let isRecording = false;
let recordingsList = [];

const channels = [
  { number: "2.1", name: "ABC News", stream: "https://abc-iview-mediapackagestreams-2.akamaized.net/out/v1/6e1cc6d25ec0480ea099a5399d73bc4b/index.m3u8" },
  { number: "4.1", name: "Red Bull TV", stream: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8" },
  { number: "7.1", name: "NASA TV", stream: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8" },
  { number: "9.1", name: "Bloomberg TV", stream: "https://bloomberg-bloomberg-1-eu.rakuten.wurl.tv/playlist.m3u8" },
  { number: "11.1", name: "Reuters", stream: "https://reuters-reutersnow-1.plex.wurl.com/manifest/playlist.m3u8" },
  { number: "13.1", name: "PBS Kids", stream: "https://2-fss-2.streamhoster.com/pl_140/amlst:200914-1298290/playlist.m3u8" },
  { number: "15.1", name: "Cartoon Network", type: "kids", stream: "https://fl6.moveonjoy.com/CARTOON_NETWORK/index.m3u8" },
  { number: "17.1", name: "Nickelodeon", type: "kids", stream: "http://fl1.moveonjoy.com/NICKELODEON/index.m3u8" }
];

let isTeleblueMode = false;
let secretCode = '';

const tvGuide = {
  "2.1": [
    { time: "12:00", show: "Local News at Noon" },
    { time: "13:00", show: "Community Spotlight" }
  ],
  "4.1": [
    { time: "12:00", show: "Weather Update" },
    { time: "13:00", show: "Storm Watch" }
  ]
};

let currentChannel = 0;
let showingGuide = false;
let weatherAlert = false;

document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowUp':
      navigateMenu('up');
      break;
    case 'ArrowDown':
      navigateMenu('down');
      break;
    case 'Enter':
      handleRemoteAction('select');
      break;
    case 'Escape':
      handleRemoteAction('tivo');
      break;
    case 'PageUp':
      changeChannel(1);
      break;
    case 'PageDown':
      changeChannel(-1);
      break;
    case 'g':
      toggleGuide();
      break;
    case 'w':
      secretCode += 'w';
      checkSecretCode();
      break;
    case 'b':
      secretCode += 'b';
      checkSecretCode();
      break;
    case 'r':
      secretCode += 'r';
      checkSecretCode();
      break;
  }
});

function checkSecretCode() {
  if (secretCode === 'wbrb') {
    isTeleblueMode = true;
    alert('Teleblue Mode Activated! Network Hijack in Progress...');
    secretCode = '';
  } else if (secretCode === 'warbtts') {
    isTeleblueMode = false;
    alert('Teleblue Mode Deactivated');
    secretCode = '';
  } else if (secretCode.length > 7) {
    secretCode = '';
  }
}

function changeChannel(direction) {
  currentChannel = (currentChannel + direction + channels.length) % channels.length;
  updateChannelDisplay();
}

function toggleGuide() {
  showingGuide = !showingGuide;
  updateChannelDisplay();
}

let hlsPlayer = null;

function initHlsPlayer(videoElement, streamUrl) {
  if (hlsPlayer) {
    hlsPlayer.destroy();
  }
  
  if (Hls.isSupported()) {
    hlsPlayer = new Hls();
    hlsPlayer.loadSource(streamUrl);
    hlsPlayer.attachMedia(videoElement);
  } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
    videoElement.src = streamUrl;
  }
}

function updateChannelDisplay() {
  const player = document.getElementById('live-tv-player');
  if (!player) return;

  if (showingGuide) {
    const channel = channels[currentChannel];
    const programs = tvGuide[channel.number] || [];
    player.innerHTML = `
      <div class="channel-guide">
        <h3>Channel ${channel.number} - ${channel.name}</h3>
        ${programs.map(p => `<div>${p.time} - ${p.show}</div>`).join('')}
      </div>
    `;
  } else {
    const channel = channels[currentChannel];
    player.innerHTML = `
      <div class="channel-info">
        <div>Ch ${channel.number} - ${channel.name}</div>
        ${weatherAlert ? '<div class="weather-alert">⚠️ SEVERE WEATHER ALERT IN YOUR AREA</div>' : ''}
      </div>
      <video id="live-video" controls></video>
    `;
    
    const videoElement = document.getElementById('live-video');
    if (videoElement && !isTeleblueMode) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(channel.stream);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play();
        });
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = channel.stream;
        videoElement.addEventListener('loadedmetadata', () => {
          videoElement.play();
        });
      }
    }
    const channel = channels[currentChannel];
    player.innerHTML = `
      <div class="channel-info">
        <div>Ch ${channel.number} - ${channel.name}</div>
        ${weatherAlert ? '<div class="weather-alert">⚠️ SEVERE WEATHER ALERT IN YOUR AREA</div>' : ''}
      </div>
      <video id="live-video" controls style="width: 100%; max-height: 300px;"></video>
    `;
    
    const videoElement = document.getElementById('live-video');
    if (videoElement) {
      initHlsPlayer(videoElement, channel.stream);
    }

    if (isTeleblueMode) {
      let glitchVideo = '';
      if (channel.name.includes('Cartoon Network')) {
        glitchVideo = 'https://www.youtube.com/embed/videoseries?list=PLvgkYy_wHRmlPd_J5PeAEgGR3yjFkl3HW';
      } else if (channel.name.includes('Nickelodeon')) {
        glitchVideo = 'https://www.youtube.com/embed/videoseries?list=PLvgkYy_wHRmlPd_J5PeAEgGR3yjFkl3HW';
      } else {
        glitchVideo = 'https://www.youtube.com/embed/videoseries?list=PLvgkYy_wHRmlPd_J5PeAEgGR3yjFkl3HW';
      }
      content = `
        <div class="channel-info">
          <div>Ch ${channel.number} - ${channel.name}</div>
          <div class="teleblue-mode">FREQUENCY FAILURE 2005</div>
          <iframe 
            width="560" 
            height="315" 
            src="${glitchVideo}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
    } else {
      content = `
        <div class="channel-info">
          <div>Ch ${channel.number} - ${channel.name}</div>
          ${weatherAlert ? '<div class="weather-alert">⚠️ SEVERE WEATHER ALERT IN YOUR AREA</div>' : ''}
        </div>
      `;
    }

    player.innerHTML = content;
  }
}

const statusIndicator = document.createElement('div');
statusIndicator.className = 'status-indicator';
screen.appendChild(statusIndicator);

function updateStatus() {
    let status = [];
    if (isRecording) status.push('⚫ REC');
    if (currentPlaybackSpeed !== 1) {
        status.push(currentPlaybackSpeed > 0 ? `>>${currentPlaybackSpeed}x` : `<<${Math.abs(currentPlaybackSpeed)}x`);
    }
    statusIndicator.textContent = status.join(' ');
}

function showScreen(screenId) {
    const mainMenu = document.getElementById('main-menu');
    mainMenu.classList.add('hidden');
    screens.forEach(s => s.classList.add('hidden'));
    if (screenId === 'main-menu') {
        mainMenu.classList.remove('hidden');
    } else {
        document.getElementById(screenId)?.classList.remove('hidden');
    }
}

function updateMenuSelection() {
    menuItems.forEach((item, index) => {
        item.classList.remove('selected');
        if (index === currentMenuItemIndex) {
            item.classList.add('selected');
        }
    });
}

function navigateMenu(direction) {
    if (direction === 'up') {
        currentMenuItemIndex = (currentMenuItemIndex - 1 + menuItems.length) % menuItems.length;
    } else if (direction === 'down') {
        currentMenuItemIndex = (currentMenuItemIndex + 1) % menuItems.length;
    }
    updateMenuSelection();
}

function handleRemoteAction(action) {
    if (action === 'tivo') {
        showScreen('main-menu');
    } else if (action === 'select') {
        const selectedItem = menuItems[currentMenuItemIndex];
        const targetScreenId = selectedItem.dataset.action + '-screen';
        showScreen(targetScreenId);
    }
}

remoteButtons.forEach(button => {
    const navDirection = button.dataset.nav;
    if (navDirection) {
        button.addEventListener('click', () => navigateMenu(navDirection));
    }

    const action = button.dataset.action;
    if (action) {
        button.addEventListener('click', () => handleRemoteAction(action));
    }

    const controlAction = button.dataset.control;
    if (controlAction) {
        button.addEventListener('click', () => {
            console.log(`Control: ${controlAction}`);
            if (controlAction === 'back-to-menu') {
                showScreen('main-menu');
            } else if (controlAction === 'play') {
                currentPlaybackSpeed = 1;
            } else if (controlAction === 'pause') {
                currentPlaybackSpeed = 0;
            } else if (controlAction === 'fast-forward') {
                currentPlaybackSpeed = currentPlaybackSpeed >= 1 ? 
                    Math.min(currentPlaybackSpeed * 2, 60) : 1;
            } else if (controlAction === 'rewind') {
                currentPlaybackSpeed = currentPlaybackSpeed <= -1 ? 
                    Math.max(currentPlaybackSpeed * 2, -60) : -1;
            } else if (controlAction === 'record') {
                isRecording = !isRecording;
                if (isRecording) {
                    const now = new Date();
                    recordingsList.push({
                        title: `Recording ${recordingsList.length + 1}`,
                        date: now.toLocaleDateString(),
                        time: now.toLocaleTimeString()
                    });
                    updateRecordingsList();
                }
            }
            updateStatus();
        });
    }

function updateRecordingsList() {
    const recordingsUl = document.getElementById('recordings');
    recordingsUl.innerHTML = recordingsList.length ? 
        recordingsList.map(rec => 
            `<li>${rec.title} - ${rec.date} ${rec.time}</li>`
        ).join('') : 
        '<li>No recordings yet.</li>';
}
});

// Initial selection
updateMenuSelection();
showScreen('main-menu');