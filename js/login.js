const getLoginPage = () => {
  if (!getLS()) {
    document.title = "Tetris Login";
    wrapper.innerHTML = "";
    const loginForm = document.createElement("form");
    wrapper.appendChild(loginForm);
    loginForm.className = "loginForm";

    let label = document.createElement("label");
    label.innerText = "Введите свой логин";
    loginForm.appendChild(label);

    let inputName = document.createElement("input");
    inputName.type = "text";
    inputName.id = "nameInput";
    loginForm.appendChild(inputName);

    let error = document.createElement("span");
    error.innerText = "Поле должно быть заполнено";
    loginForm.appendChild(error);
    error.style.visibility = "hidden";

    let enterButton = document.createElement("button");
    enterButton.id = "enter";
    enterButton.innerText = "Войти";
    loginForm.appendChild(enterButton);

    loginForm.onsubmit = (e) => {
      e.preventDefault();
      if (inputName.value) {
        inputName.focus();
        localStorage.setItem("name", inputName.value);
        loginForm.classList.remove("rollRight");
        showPreloader()
        setTimeout(() => {
          window.location.hash = "mainPage";
          hidePreloader()
        }, 1000);
      } else {
        inputName.focus();
        error.style.visibility = "visible";
      }
    };
    window.setTimeout(() => {
      loginForm.classList.add("rollRight");
    }, 0);
  } else {
    showPreloader()
    window.location.hash = "mainPage";
  }
};
