//разметка mainPage

function getMainMenuPage() {
    if (!getLS()) {
        window.location.hash = "login";
    } else {
        getSetRecords();

        wrapper.innerHTML = "";
        const mainMenu = create("div");
        mainMenu.id = "mainMenu";
        mainMenu.className = "mainMenu";
        wrapper.appendChild(mainMenu);

        const soundCross = document.getElementById("soundCross");

        const menuList = [
            {name: "Старт", id: "start"},
            {name: "Опции", id: "options"},
            {name: "Рекорды", id: "records"},
            {name: "Выйти", id: "logout"},
        ];
        const welcome = create("span");
        welcome.className = "welcome";
        welcome.innerText = `Добро пожаловать, ${getLS()}!`;

        //работа с аудио
        const soundImg = create("img");
        soundImg.src = getMusicStatus()
            ? "assets/imgs/soundOff.svg"
            : "assets/imgs/sound.svg";

        soundImg.addEventListener("click", () => {
            isMusicOn = !isMusicOn;
            soundImg.src = getMusicStatus()
                ? "assets/imgs/soundOff.svg"
                : "assets/imgs/sound.svg";
            if (getMusicStatus()) {
                mainMenuAudio.play();
            } else {
                mainMenuAudio.pause();
            }
        });
        mainMenu.appendChild(soundImg);

        mainMenu.appendChild(welcome);
        const ul = create("ul");
        mainMenu.appendChild(ul);
        for (let i = 0; i < menuList.length; i++) {
            li = create("li");
            li.id = menuList[i].id;
            li.innerText = menuList[i].name;
            ul.appendChild(li);
        }
        //кнопка Старт
        const startButton = document.getElementById("start");
        startButton.onclick = () => {
            mainMenu.classList.remove('rollRight')
            setTimeout(() => {
                window.location.hash = "gamePage";
            }, 1000)
        };
        //кнопка ОПЦИИ
        const optionsDiv = create("div");
        optionsDiv.className = "optionsDiv";
        optionsDiv.style.display = "none";
        mainMenu.appendChild(optionsDiv);
        const currentVolume = create("span");
        currentVolume.innerText = "Громкость";
        optionsDiv.appendChild(currentVolume);
        //уровень громкости
        const volumeLevel = create("input");
        volumeLevel.type = "range";
        volumeLevel.min = "0";
        volumeLevel.max = "1";
        volumeLevel.step = "0.01";
        volumeLevel.value = "0.1";
        optionsDiv.appendChild(volumeLevel);
        mainMenuAudio.volume = volumeLevel.value;
        gameOverAudio.volume = volumeLevel.value;

        volumeLevel.oninput = (e) => {
            mainMenuAudio.volume = volumeLevel.value;
            gameOverAudio.volume = volumeLevel.value;
        };

        //вибрация
        const vibration = create("span");
        vibration.innerText = "Вибрация";
        optionsDiv.appendChild(vibration);
        const vibrationCheckBox = create("input");
        vibrationCheckBox.type = "checkbox";
        optionsDiv.appendChild(vibrationCheckBox);

        vibrationCheckBox.onchange = () => {
            isVibration =
                window.navigator && window.navigator.vibrate ? !isVibration : false;
            console.log(isVibration);
        };

        const leaveOptions = create("span");
        leaveOptions.innerText = "закрыть";
        optionsDiv.appendChild(leaveOptions);
        leaveOptions.onclick = () => {
            optionsDiv.style.display = "none";
        };

        const options = document.getElementById("options");

        options.onclick = () => {
            optionsDiv.style.display = "block";
        };

        const recordsDiv = create("div");
        recordsDiv.style.display = "none";
        mainMenu.appendChild(recordsDiv);

        const names = create("div");
        const results = create("div");
        recordsDiv.appendChild(names);
        recordsDiv.appendChild(results);
        const closeRecordsDiv = create("span");
        recordsDiv.className = "recordsDiv";
        closeRecordsDiv.innerText = "закрыть";
        recordsDiv.appendChild(closeRecordsDiv);
        closeRecordsDiv.onclick = () => {
            recordsDiv.style.display = "none";
        };
        const records = document.getElementById("records");

        // recordsList.length < 1 && getRecords()

        function updateScore(data) {
            names.innerHTML = "";
            results.innerHTML = "";
            for (let i = 0; i < data.length; i++) {
                let n = create("p");
                names.appendChild(n);
                n.innerText = data[i].name;
                let r = create("p");
                r.style.textAlign = "right";
                results.appendChild(r);
                r.innerText = data[i].result;
            }
            recordsDiv.style.display = "grid";
        }

        records.onclick = () => {
            getSetRecords(updateScore);
        };
        const logout = document.getElementById("logout");
        logout.onclick = () => {
            isMusicOn = false;
            mainMenuAudio.pause();
            mainMenuAudio.currentTime = 0;
            localStorage.clear();
            mainMenu.classList.remove('rollRight')
            setTimeout(() => {
                window.location.hash = "login";
            }, 1000)
        };
        setTimeout(() => {
            mainMenu.classList.add('rollRight')
        }, 100)
    }

}
