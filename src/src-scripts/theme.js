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
    themeToggleBtn.checked = evt.matches;
  };

  themeToggleBtn.checked = darkModeState;

  // Toggles the "dark-mode" class on click and sets localStorage state
  themeToggleBtn.addEventListener("change", async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    document.body.classList.add("theme-transition");

    darkModeState = !darkModeState;

    toggleDarkMode(darkModeState);
    setDarkModeLocalStorage(darkModeState);
    setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 3000);
  });

  const slider = document.querySelector(".checkbox-label .ball");
  setTimeout(() => {
    slider.style.setProperty("transition", "transform 0.2s linear");
  }, 200);

  document
    .querySelector(".checkbox-label")
    .style.setProperty("visibility", "visible");
}
