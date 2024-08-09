document.addEventListener('DOMContentLoaded', function() {
    // Inicializa a API do Google Cast quando estiver pronta
    window['__onGCastApiAvailable'] = function(isAvailable) {
        if (isAvailable) {
            initializeCastApi();
        } else {
            console.error('Google Cast API não está disponível.');
        }
    };

    document.getElementById('playButton').addEventListener('click', function() {
        var video = document.getElementById('videoPlayer');
        if (window.Hls && Hls.isSupported()) {
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
        } else {
            console.error('HLS não é suportado neste navegador.');
        }
    });

    document.getElementById('castButton').addEventListener('click', function() {
        if (window.cast && cast.framework && cast.framework.CastContext) {
            const context = cast.framework.CastContext.getInstance();
            const state = context.getCastState();

            console.log('Estado do Cast:', state);

            if (state === cast.framework.CastState.NOT_CONNECTED) {
                context.requestSession().then(() => {
                    console.log('Sessão de cast iniciada');
                    castMedia();
                }).catch((error) => {
                    console.error('Erro ao iniciar a sessão de cast: ', error);
                });
            } else {
                castMedia();
            }
        } else {
            console.error('Google Cast API não está disponível.');
        }
    });

    function castMedia() {
        const context = cast.framework.CastContext.getInstance();
        const session = context.getCurrentSession();

        if (session) {
            const player = new cast.framework.RemotePlayer();
            const controller = new cast.framework.RemotePlayerController(player);
            const videoElement = document.getElementById('videoPlayer');

            console.log('URL do vídeo:', videoElement.currentSrc);

            if (videoElement.currentSrc) {
                const mediaInfo = new chrome.cast.media.MediaInfo(videoElement.currentSrc, 'application/x-mpegURL');
                const request = new chrome.cast.media.LoadRequest(mediaInfo);

                session.loadMedia(request).then(
                    function() { console.log('Transmissão iniciada'); },
                    function(errorCode) { console.log('Erro ao iniciar a transmissão: ' + errorCode); }
                );
            } else {
                console.error('Nenhuma mídia carregada no elemento de vídeo.');
            }
        } else {
            console.error('Nenhuma sessão de cast ativa.');
        }
    }
});

function initializeCastApi() {
    if (window.cast && cast.framework && cast.framework.CastContext) {
        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        });
        console.log('Google Cast API inicializada.');
    } else {
        console.error('Google Cast API não está disponível.');
    }
}
