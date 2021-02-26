let wrapper = document.getElementById("wrapper");

//аудио
const mainMenuAudio = new Audio("assets/audio/mainMenu.mp3");
const gameOverAudio = new Audio("assets/audio/gameOver.mp3");
let isMusicOn = false;
let isVibration = false;
const supportsVibrate = "vibrate" in navigator;
const looping = (elem) => {
    elem.currentTime = 0
    elem.play()
}
const getMusicStatus = () => {
    return isMusicOn
}

mainMenuAudio.addEventListener('ended', () => looping(mainMenuAudio))

//БД
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


let recordsList = []

const ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";

const generatePassword = () => {
    return Math.random() * 5000
}
const tetrisScores = "ASTREIKO_TETRIS_SCORES";
const getSetRecords = (cb, f = "READ", p, v) => {
    let sp = new URLSearchParams();
    f && sp.append("f", f);
    sp.append("n", tetrisScores);
    p && sp.append("p", p);
    v && sp.append("v", JSON.stringify(recordsList));
    fetch(ajaxHandlerScript, {method: "POST", body: sp})
        .then(response => {
            response.text()
                .then(txt => {
                    if (f === 'READ' || f === 'LOCKGET') recordsList = JSON.parse(JSON.parse(txt).result)
                    sortResult(recordsList)
                    cb && cb(recordsList)
                })
        })
}

const getLS = () => {
    return localStorage.getItem("name");
}

const create = (elem) => {
    return document.createElement(elem);
};


const sortResult = (arr) => {
    arr.sort((a, b) => a.result > b.result ? -1 : 1)
}

const newResults = (list, score, p) => {
    list.push({name: getLS(), result: score})
    sortResult(list)
    recordsList = list.slice(0, 10)
    getSetRecords(false,'UPDATE', p, recordsList)
}
