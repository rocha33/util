document.addEventListener('DOMContentLoaded', function() {
    // Verifica se a API do Google Cast está carregada
    if (window.cast && cast.framework && cast.framework.CastContext) {
        initializeCastApi();
    } else {
        console.error('Google Cast API não está disponível.');
    }

    document.getElementById('playButton').addEventListener('click', function() {
        var video = document.getElementById('videoPlayer');
        if (Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource('https://cdn-4.nxplay.com.br/HISTORY_TK/index.m3u8');
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = 'https://cdn-4.nxplay.com.br/HISTORY_TK/index.m3u8';
            video.addEventListener('canplay', function() {
                video.play();
            });
        }
    });

    document.getElementById('castButton').addEventListener('click', function() {
        if (window.cast && cast.framework && cast.framework.CastContext) {
            const context = cast.framework.CastContext.getInstance();
            const state = context.getCastState();

            if (state === cast.framework.CastState.NOT_CONNECTED) {
                context.requestSession();
            } else {
                const player = new cast.framework.RemotePlayer();
                const controller = new cast.framework.RemotePlayerController(player);

                const videoElement = document.getElementById('videoPlayer');
                const mediaInfo = new chrome.cast.media.MediaInfo(videoElement.currentSrc, 'application/x-mpegURL');
                const request = new chrome.cast.media.LoadRequest(mediaInfo);

                context.getCurrentSession().loadMedia(request).then(
                    function() { console.log('Transmissão iniciada'); },
                    function(errorCode) { console.log('Erro ao iniciar a transmissão: ' + errorCode); }
                );
            }
        } else {
            console.error('Google Cast API não está disponível.');
        }
    });
});

function initializeCastApi() {
    if (window.cast && cast.framework && cast.framework.CastContext) {
        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        });
    } else {
        console.error('Google Cast API não está disponível.');
    }
}
