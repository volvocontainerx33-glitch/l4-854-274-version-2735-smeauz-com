import { H as Hls } from '../vendor/hls-DrU42sTK.js';

(function () {
  var video = document.querySelector('[data-hls-player]');
  var playButton = document.querySelector('[data-play-toggle]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var initialized = false;
  var hlsInstance = null;

  function initPlayer() {
    if (initialized || !source) {
      return;
    }

    initialized = true;

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  function requestPlay() {
    initPlayer();
    if (playButton) {
      playButton.classList.add('hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (playButton) {
          playButton.classList.remove('hidden');
        }
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', requestPlay);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      requestPlay();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (playButton) {
      playButton.classList.add('hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (playButton && video.currentTime === 0) {
      playButton.classList.remove('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
