window.onhashchange = changeState;

function changeState() {
  let URIHash = window.location.hash;

  let state = URIHash.substr(1);

  if (!getLS() || state === "login") {
    getLoginPage();
  } else if ((state === "mainPage" || state === "") && getLS()) {
    getMainMenuPage();
  } else if (state === "gamePage" && getLS()) {
    getGamePage();
  }
}
changeState();
