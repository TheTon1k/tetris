const getLoginPage = () => {
    if (!getLS()) {
        window.location.hash = "login";
        wrapper.innerHTML = "";
        const loginForm = document.createElement("form");
        wrapper.appendChild(loginForm);
        loginForm.className = "loginForm";

        label = document.createElement("label");
        label.innerText = "Введите свой логин";
        loginForm.appendChild(label);

        inputName = document.createElement("input");
        inputName.type = "text";
        inputName.id = "nameInput";
        loginForm.appendChild(inputName);

        error = document.createElement("span");
        error.innerText = "Поле должно быть заполнено";
        loginForm.appendChild(error);
        error.style.visibility = "hidden";

        enterButton = document.createElement("button");
        enterButton.id = "enter";
        enterButton.innerText = "Войти";
        loginForm.appendChild(enterButton);

        loginForm.onsubmit = (e) => {
            e.preventDefault();
            if (inputName.value) {
                inputName.focus();
                localStorage.setItem("name", inputName.value);
                loginForm.classList.remove('rollRight')
                setTimeout(() => {
                    window.location.hash = "mainPage";
                }, 1000)
            } else {
                inputName.focus();
                error.style.visibility = "visible";
            }
        };
        window.setTimeout(() => {
            loginForm.classList.add('rollRight')

        }, 0)
    } else window.location.hash = "mainPage";
};
