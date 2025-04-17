export function applyColorTheme() {
  let darkModeState = false;
  const themeToggleBtn = document.querySelector(".theme-toggle");
  const useDark = window.matchMedia("(prefers-color-scheme: dark)");

  function toggleDarkMode(state) {
    document.documentElement.classList.toggle("dark-theme", state);
  }

  // Sets localStorage state
  function setDarkModeLocalStorage(state) {
    localStorage.setItem("rpdev-dark-theme", state);
  }

  // Initial setting
  if (localStorage.getItem("rpdev-dark-theme")) {
    toggleDarkMode(localStorage.getItem("rpdev-dark-theme") == "true");
    darkModeState = localStorage.getItem("rpdev-dark-theme") == "true";
  } else {
    toggleDarkMode(useDark.matches);
    darkModeState = useDark.matches;
  }

  // Listening for the changes in the OS settings and auto switching the mode
  useDark.onchange = (evt) => {
    toggleDarkMode(evt.matches);
    darkModeState = evt.matches;
    setDarkModeLocalStorage(evt.matches);
    themeToggleBtn.setAttribute("aria-pressed", evt.matches);
  };

  themeToggleBtn.setAttribute("aria-pressed", darkModeState);

  // Toggles the "dark-mode" class on click and sets localStorage state
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.add("theme-transition");

    darkModeState = !darkModeState;

    themeToggleBtn.setAttribute("aria-pressed", darkModeState);

    toggleDarkMode(darkModeState);
    setDarkModeLocalStorage(darkModeState);
    setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 3000);
  });
}
