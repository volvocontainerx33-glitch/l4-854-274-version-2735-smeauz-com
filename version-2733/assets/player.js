(function () {
  function mountPlayer(options) {
    var video = options.video;
    var overlay = options.overlay;
    var button = options.button;
    var source = options.source;
    var loaded = false;
    var message;

    if (!video || !source) {
      return;
    }

    function showMessage(text) {
      if (!message) {
        message = document.createElement('div');
        message.className = 'player-message';
        video.parentNode.appendChild(message);
      }
      message.textContent = text;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function startVideo() {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          showMessage('轻触视频区域即可继续播放');
        });
      }
    }

    function loadAndPlay() {
      hideOverlay();

      if (loaded) {
        startVideo();
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', startVideo, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, startVideo);
        } else {
          video.addEventListener('canplay', startVideo, { once: true });
        }
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('播放失败，请稍后重试');
          }
        });
        return;
      }

      showMessage('当前设备暂不支持此影片播放');
    }

    Array.prototype.slice.call(new Set([overlay, button])).forEach(function (target) {
      if (target) {
        target.addEventListener('click', loadAndPlay);
      }
    });

    video.addEventListener('click', function () {
      if (!loaded) {
        loadAndPlay();
      }
    });

    video.addEventListener('play', hideOverlay);
  }

  window.MoviePlayer = {
    mount: mountPlayer
  };
})();
