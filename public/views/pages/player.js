let Player = {
    render: async () => {
        let view =  /*html*/`
            <div class="player__slider">
                <input type="range" min="0" max="1000" value="0" id="timer">
            </div>
             <button class="btn" id="player_prev" style="vertical-align: top;margin-top: 10px;" >←</button>
            <button class="player__play" id="play_button"></button>
            <button class="btn"  id="player_next" style="vertical-align: top;margin-top: 10px;" >→</button>
            <audio id="player">
            </audio>
        `
        return view
    },
    after_render: async () => {
        const player = document.getElementById('player');
        const player__prev = document.getElementById('player_prev');
        const player__next = document.getElementById('player_next');
        const timer = document.getElementById('timer');
        const play_button = document.getElementById('play_button');
        let index = 0;
        let user;
        let playing = false;
        let firstPlay = true;
        let queue = [];

        play_button.addEventListener("click", async function (e) {
            if (firstPlay) firstPlay = false;
            if (playing) {
                pause();
            } else {
                play();
            }
        });
        firebase.auth().onAuthStateChanged(async firebaseUser => {
            if (firebaseUser) {
                user = firebase.auth().currentUser.uid;
                await getQueue();
            } else {
                pause();
            }
        });
        player__prev.addEventListener("click", async function (e) {
            await back();
        });
        player__next.addEventListener("click", async function (e) {
            await skip();
        });

        function play() {
            play_button.classList.add('pause');
            playing = true;
            player.play();
        }

        function pause() {
            play_button.classList.remove('pause');
            playing = false;
            player.pause();
        }

        async function skip() {
            index = index + 1;
            if (index === queue.length) {
                index = 0;
            }
            player.src = await firebase.storage().ref(queue[index]).getDownloadURL();
            play();
        }

        async function back() {
            index = index - 1;
            if (index < 0) {
                index = queue.length - 1;
            }
            player.src = await firebase.storage().ref(queue[index]).getDownloadURL();
            play();
        }


        async function getQueue() {
            let snapshot = await firebase.database().ref('/current_tracks/' + user);
            snapshot.on("value", async function (snapshot) {
                let val = snapshot.val();

                queue = val;
                player.src = await firebase.storage().ref(queue[0]).getDownloadURL();
                if (!firstPlay) {
                    if (!playing) playing = true;
                    play();
                }
                firstPlay = false;
            });
        }

        player.addEventListener("ended", async function () {
            await skip();
        });
        player.addEventListener("timeupdate", function () {
            timer.value = (player.currentTime / player.duration) * 1000 | 0;
        });

        timer.addEventListener('input', function () {
            player.currentTime = timer.value / 1000 * player.duration;
        }, false);
    }


}

export default Player;
