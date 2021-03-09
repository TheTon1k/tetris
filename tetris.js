function getGamePage(reload) {
    if (!getLS()) window.location.replace = "login";
    else {
        document.title = "Tetris";
        wrapper.innerHTML = "";
        let canvasesDiv = create("div");
        reload
            ? (canvasesDiv.className = "canvasesDiv roll")
            : (canvasesDiv.className = "canvasesDiv topPos");
        wrapper.appendChild(canvasesDiv);

        const controlDiv = create("div");
        controlDiv.className = "controlDiv topPos";
        wrapper.appendChild(controlDiv);

        // buttons
        function createControlButton(cls, text, move) {
            let button = document.createElement("button");
            button.innerText = text;
            button.className = `controlButton ${cls}`;
            controlDiv.appendChild(button);
            button.onclick = () => {
                moveBlock(move);
                isVibration && supportsVibrate && window.navigator.vibrate(20);
            };
            return button;
        }

        let upButton = createControlButton("up", "\u2191", "rotate");
        let leftButton = createControlButton("lt", "\u2190", "left");
        let downButton = createControlButton("dn", "\u2193", "down");
        let rightButton = createControlButton("rt", "\u2192", "right");

        const gameDiv = create("div");
        gameDiv.className = "gameDiv";
        canvasesDiv.appendChild(gameDiv);

        const canvas = create("canvas");
        canvas.id = "tetris";
        gameDiv.appendChild(canvas);
        const context = canvas.getContext("2d");

        const navigateDiv = create("div");
        navigateDiv.className = "navigateDiv";
        canvasesDiv.appendChild(navigateDiv);
        //
        const scoreText = create("span");
        scoreText.className = "score";
        scoreText.innerText = "Очки";
        navigateDiv.appendChild(scoreText);

        const scoreSpan = create("span");
        scoreSpan.className = "score bordered";
        navigateDiv.appendChild(scoreSpan);

        const levelText = create("span");
        levelText.className = "score";
        levelText.innerText = "Уровень";
        navigateDiv.appendChild(levelText);

        const levelSpan = create("span");
        levelSpan.className = "score bordered";
        navigateDiv.appendChild(levelSpan);

        const nextFigSpan = create("span");
        nextFigSpan.className = "score ";
        nextFigSpan.innerHTML = `Следующая <br> фигура`;
        navigateDiv.appendChild(nextFigSpan);

        const nextFigureCanvas = create("canvas");
        nextFigureCanvas.id = "nextFigure";
        nextFigureCanvas.className = "bordered";
        navigateDiv.appendChild(nextFigureCanvas);

        const clearedSpanText = create("span");
        clearedSpanText.className = "score";
        clearedSpanText.innerText = "Очищено";
        navigateDiv.appendChild(clearedSpanText);

        const clearedSpan = create("span");
        clearedSpan.className = "score bordered";
        navigateDiv.appendChild(clearedSpan);

        let isPaused = false;
        const pauseSpan = create("span");
        pauseSpan.className = "score action bordered";
        pauseSpan.innerText = "Пауза";

        pauseSpan.onclick = () => {
            isPaused = !isPaused;
            pauseSpan.innerText = isPaused ? "Старт" : "Пауза";
            update();
        };
        navigateDiv.appendChild(pauseSpan);

        const restart = create("span");
        restart.className = "action score bordered";
        restart.innerText = "Рестарт";
        restart.onclick = () => {
            isMusicOn && mainMenuAudio.play();
            getGamePage(true);
        };
        navigateDiv.appendChild(restart);

        const mainMenuSpan = create("span");
        mainMenuSpan.className = "action score";
        mainMenuSpan.innerText = "Меню";
        mainMenuSpan.onclick = () => {
            if (score && !gameOver) {
                let a = confirm("При переходе вы потеряете текущий результат.");
                if (a) {
                    canvasesDiv.classList.remove("roll");
                    controlDiv.classList.remove("roll");
                    score = 0;
                    cancelAnimationFrame(animation)
                    setTimeout(() => {
                        window.location.hash = "mainPage";
                    }, 1000);
                }
            } else {
                canvasesDiv.classList.remove("roll");
                controlDiv.classList.remove("roll");
                setTimeout(() => {
                    window.location.hash = "mainPage";
                }, 1000);
            }
        };

        navigateDiv.appendChild(mainMenuSpan);

        const contextNextFigure = nextFigureCanvas.getContext("2d");

        contextNextFigure.scale(100, 100);

        //размер поля 600x720
        canvas.width = 660;
        canvas.height = 720;
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);

        // размеры блока со следующей фигурой
        nextFigureCanvas.width = 126;
        nextFigureCanvas.height = 100;

        //размер одного блока фигуры
        const blockSize = 30;
        //количество строк и столбцов
        let rowsSize = canvas.height / blockSize;
        let colsSize = canvas.width / blockSize;

        let animation = null;

        //счет
        let score = 0;
        //подтверждение смены страницы/обновления
        window.onbeforeunload = function () {
            if (score && !gameOver) return true;
        };

        //фигуры
        const figures = {
            L: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0],
            ],
            J: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0],
            ],
            Z: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0],
            ],
            S: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0],
            ],
            I: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            T: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ],

            O: [
                [1, 1],
                [1, 1],
            ],
        };

        const figuresColors = {
            L: "#78DBE2",
            J: "#F19CBB",
            S: "#FFAA64",
            Z: "#FCE883",
            T: "#D0F0C0",
            I: "#FFF8E7",
            O: "#1DACD6",
        };
        //счетчик кадров для сдвига фигуры
        let counter = 0;
        //каждый 30й кадр сдвигаем фигуру вниз
        let maxCounter = 30;
        //каждые 5 собранных рядов увеличиваем скорость падения фигуры(max-counter) на 3
        let clearedRows = 0;
        clearedSpan.innerText = clearedRows;

        let level = 1;
        levelSpan.innerText = level;

        //массив с фигурами
        let figuresArray = [];
        //игровое поле
        let arena = [];
        //начинаем с -1 чтобы изначально появлялись фигуры не полностью
        for (let row = -1; row < rowsSize; row++) {
            arena[row] = new Array(colsSize).fill(0);
        }

        // текущая фигура
        let currentFigure = getNextFigure();
        //следующая фигура
        let nextFigure = null;

        let gameOver = false;

        // Функция возвращает случайное число в заданном диапазоне
        function getRandomFigure(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        // создаём последовательность фигур, которая появится в игре
        function generateSequence() {
            const sequence = ["L", "J", "Z", "S", "I", "T", "O"];

            // выбираем рандомную фигуру
            while (sequence.length) {
                const randomFigure = getRandomFigure(0, sequence.length - 1);
                const name = sequence.splice(randomFigure, 1)[0];
                // помещаем выбранную фигуру в игровой массив с последовательностями
                figuresArray.push(name);
            }
        }

        // получаем следующую фигуру
        function getNextFigure() {
            // если следующей нет — генерируем
            if (figuresArray.length === 0) {
                generateSequence();
            }
            // берём последнюю фигуру из массива
            const name = figuresArray.pop();

            // сразу создаём матрицу, с которой мы отрисуем фигуру
            const matrix = figures[name];

            const col = arena[0].length / 2 - Math.ceil(matrix[0].length / 2);
            const row = -1;
            // возвращаем объект фигуры
            return {
                name, // имя фигуры
                matrix, // матрица фигуры
                row, // текущая строка
                col, // текущий столбец
            };
        }

        // поворачиваем матрицу и возвращаем перевернутую на 90 градусов
        function rotateFigure(matrix) {
            const N = matrix.length - 1;
            return matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));
        }

        // проверка на валидность размещения
        function isValidMove(matrix, cellRow, cellCol) {
            // проверяем все строки и столбцы
            for (let row = 0; row < matrix.length; row++) {
                for (let col = 0; col < matrix[row].length; col++) {
                    if (
                        matrix[row][col] &&
                        // выход за границы арены
                        (cellCol + col < 0 ||
                            cellCol + col >= arena[0].length ||
                            cellRow + row >= arena.length ||
                            // пересечение с другими фигурами
                            arena[cellRow + row][cellCol + col])
                    ) {
                        return false;
                    }
                }
            }
            return true;
        }

        // когда фигура встала на место
        function placeFigure() {
            // обрабатываем все строки и столбцы в игровом поле
            for (let row = 0; row < currentFigure.matrix.length; row++) {
                for (let col = 0; col < currentFigure.matrix[row].length; col++) {
                    if (currentFigure.matrix[row][col]) {
                        // если край фигуры после установки вылезает за границы поля, то игра закончилась
                        if (currentFigure.row + row < 0) {
                            return gameOverFunc();
                        }
                        // если всё в порядке, то записываем в массив игрового поля нашу фигуру
                        arena[currentFigure.row + row][currentFigure.col + col] =
                            currentFigure.name;
                        isVibration && supportsVibrate && window.navigator.vibrate(100);
                    }
                }
            }
            // проверяем, чтобы заполненные ряды очистились снизу вверх
            for (let row = arena.length - 1; row >= 0;) {
                // если ряд заполнен
                if (arena[row].every((cell) => !!cell)) {
                    // очищаем его и опускаем всё вниз на одну клетку
                    for (let r = row; r >= 0; r--) {
                        for (let c = 0; c < arena[r].length; c++) {
                            arena[r][c] = arena[r - 1][c];
                        }
                    }
                    score += 200;
                    clearedRows++;
                    clearedSpan.innerText = clearedRows;

                    isVibration && supportsVibrate && window.navigator.vibrate(300);
                } else {
                    // переходим к следующему ряду
                    row--;
                }
            }
            //
            // получаем следующую фигуру
            currentFigure = getNextFigure();
        }

        function gameOverFunc() {
            cancelAnimationFrame(animation);
            mainMenuAudio.pause();
            mainMenuAudio.currentTime = 0;
            isMusicOn && gameOverAudio.play();
            gameOver = true;
            let pass = generatePassword();
            getSetRecords((val) => newResults(val, score, pass), "LOCKGET", pass);
            context.fillStyle = "#000";
            context.globalAlpha = 0.8;
            context.fillRect(
                0,
                canvas.height / 2 - blockSize * 2,
                canvas.width,
                blockSize * 4
            );
            context.globalAlpha = 1;
            context.fillStyle = "white";
            context.font = "bold 5vh serif";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);
        }

        function moveBlock(side) {
            switch (side) {
                case "rotate":
                    const newMatrix = rotateFigure(currentFigure.matrix);
                    if (isValidMove(newMatrix, currentFigure.row, currentFigure.col)) {
                        currentFigure.matrix = newMatrix;
                    }
                    break;
                case "left":
                    if (
                        isValidMove(
                            currentFigure.matrix,
                            currentFigure.row,
                            currentFigure.col - 1
                        )
                    ) {
                        currentFigure.col -= 1;
                    }
                    break;
                case "right":
                    if (
                        isValidMove(
                            currentFigure.matrix,
                            currentFigure.row,
                            currentFigure.col + 1
                        )
                    ) {
                        currentFigure.col += 1;
                    }
                    break;
                case "down":
                    if (
                        !isValidMove(
                            currentFigure.matrix,
                            currentFigure.row + 1,
                            currentFigure.col
                        )
                    ) {
                        placeFigure();
                        return;
                    }
                    score += 1;
                    currentFigure.row += 1;
                    break;
            }
        }

        document.addEventListener("keydown", (e) => {
            if (gameOver) return;
            if (isPaused) return;
            console.log(e.which);
            switch (e.which) {
                case 37:
                    moveBlock("left");
                    break;
                case 39:
                    moveBlock("right");
                    break;
                case 40:
                    moveBlock("down");
                    break;
                case 38:
                    moveBlock("rotate");
                    break;
            }
        });

        function updateScore() {
            scoreSpan.innerText = score;
        }

        updateScore();

        function update() {
            if (!isPaused) {
                isMusicOn && mainMenuAudio.play();
                animation = requestAnimationFrame(update);
                updateScore();
                context.fillStyle = "black";
                context.fillRect(0, 0, canvas.width, canvas.height);

                if (currentFigure) {
                    //каждые maxCounter кадров сдвигаем фигуру
                    if (counter++ >= maxCounter) {
                        currentFigure.row++;
                        counter = 0;
                    }

                    //каждые 5 собранных рядов увеличиваем скорость падения, добавляем левел
                    if (clearedRows % 5 === 0 && clearedRows > 0) {
                        maxCounter -= 3;
                        //воспроизводим музыку нового уровня
                        isMusicOn && lvlUpAudio.play();
                        // прописываем текущий уровень исходя из количества очищенных рядов
                        levelSpan.innerText = level;
                    }

                    if (
                        !isValidMove(
                            currentFigure.matrix,
                            currentFigure.row,
                            currentFigure.col
                        )
                    ) {
                        currentFigure.row--;
                        placeFigure();
                    }
                    context.fillStyle = figuresColors[currentFigure.name];

                    //рисуем фигуру
                    for (let row = 0; row < currentFigure.matrix.length; row++) {
                        for (let col = 0; col < currentFigure.matrix[row].length; col++) {
                            if (currentFigure.matrix[row][col]) {
                                context.fillRect(
                                    (currentFigure.col + col) * blockSize,
                                    (currentFigure.row + row) * blockSize,
                                    blockSize - 2,
                                    blockSize - 2
                                );
                            }
                        }
                    }
                }
                // если массив фигур пустой — генерируем новый
                if (figuresArray.length === 0) {
                    generateSequence();
                }
                //рисуем следующую фигуру
                if (figuresArray.length > 0) {
                    contextNextFigure.fillStyle = "black";
                    contextNextFigure.fillRect(
                        0,
                        0,
                        nextFigureCanvas.width,
                        nextFigureCanvas.height
                    );
                    nextFigure = figuresArray[figuresArray.length - 1];
                    let matrix = figures[nextFigure];
                    contextNextFigure.fillStyle = figuresColors[nextFigure];
                    for (let row = 0; row < matrix.length; row++) {
                        for (let col = 0; col < matrix[row].length; col++) {
                            if (matrix[row][col]) {
                                contextNextFigure.fillRect(
                                    col * blockSize +
                                    (nextFigure === "O"
                                        ? blockSize
                                        : nextFigure === "I"
                                            ? blockSize / 6
                                            : blockSize / 2),
                                    nextFigure === "I"
                                        ? nextFigureCanvas.height / 3
                                        : nextFigureCanvas.height / 4 + row * blockSize,
                                    blockSize - 2,
                                    blockSize - 2
                                );
                            }
                        }
                    }
                }
                //отрисовываем игровое поле исходя из заполненных ячеек
                for (let row = 0; row < rowsSize; row++) {
                    for (let col = 0; col < colsSize; col++) {
                        if (arena[row][col]) {
                            const name = arena[row][col];
                            context.fillStyle = figuresColors[name];
                            //чтобы была клетка делаем заливку на 2 пикселя меньше размера блока
                            context.fillRect(
                                col * blockSize,
                                row * blockSize,
                                blockSize - 2,
                                blockSize - 2
                            );
                        }
                    }
                }
            } else {
                cancelAnimationFrame(animation);
                isMusicOn && mainMenuAudio.pause();
            }
        }

        if (!reload) {
            canvasesDiv.classList.add("roll");
            controlDiv.classList.add("roll");
        }
        //свайпы
        document.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("touchmove", handleMoveToMainMenu);

        function handleMoveToMainMenu(e) {
            if (!y1) {
                return false;
            }
            let y2 = e.touches[0].clientY;
            let diffY = y1 - y2;
            if (diffY > 200) {
                mainMenuSpan.click();
                document.removeEventListener("touchmove", handleMoveToMainMenu);
                cancelAnimationFrame(animation)
            }
        }
    }

    !reload ? window.setTimeout(update, 1500) : update();
}
