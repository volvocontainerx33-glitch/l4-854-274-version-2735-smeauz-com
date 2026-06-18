(function () {
    function initializePlayer(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-player-button]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var hls = null;
        var attached = false;

        function attach() {
            if (!video || !stream || attached) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                attached = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                attached = true;
                return;
            }

            video.src = stream;
            attached = true;
        }

        function play() {
            attach();
            if (button) {
                button.classList.add('hidden');
            }
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove('hidden');
                        }
                    });
                }
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('hidden');
                }
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player-box]').forEach(initializePlayer);
}());
