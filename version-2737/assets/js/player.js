import { H as Hls } from './hls-dru42stk.js';

function readConfig(shell) {
  var node = shell.querySelector('.video-config');
  if (!node) {
    return null;
  }

  try {
    return JSON.parse(node.textContent);
  } catch (error) {
    return null;
  }
}

function initPlayer(shell) {
  var video = shell.querySelector('video');
  var startButton = shell.querySelector('.player-start');
  var loading = shell.querySelector('.player-loading');
  var message = shell.querySelector('.player-message');
  var config = readConfig(shell);
  var hls = null;

  if (!video || !config || !config.src) {
    if (message) {
      message.hidden = false;
    }
    return;
  }

  function setLoading(value) {
    if (loading) {
      loading.hidden = !value;
    }
  }

  function setMessage(value) {
    if (message) {
      message.hidden = !value;
    }
  }

  function attach() {
    setLoading(true);
    setMessage(false);

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.src;
      video.addEventListener('loadedmetadata', function () {
        setLoading(false);
      }, { once: true });
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(config.src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setLoading(false);
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setLoading(false);
          setMessage(true);
        }
      });
      return;
    }

    setLoading(false);
    setMessage(true);
  }

  function play() {
    shell.classList.add('is-playing');
    setLoading(false);
    video.play().catch(function () {
      shell.classList.remove('is-playing');
    });
  }

  function pause() {
    shell.classList.remove('is-playing');
  }

  attach();

  if (startButton) {
    startButton.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', pause);
  video.addEventListener('ended', pause);
  video.addEventListener('waiting', function () {
    setLoading(true);
  });
  video.addEventListener('playing', function () {
    setLoading(false);
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(initPlayer);
