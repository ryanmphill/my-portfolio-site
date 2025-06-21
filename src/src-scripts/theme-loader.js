// Inline function to eagerly load the theme before the page is rendered
// This is to prevent the flash of unstyled content when the page loads
// Will be moved to the head section of the page once I update
// the static site generator to better support customization of the head section

(function () {
  // Applying color theme
  let darkModeState = false;
  const useDark = window.matchMedia("(prefers-color-scheme: dark)");

  function toggleDarkMode(state) {
    document.documentElement.classList.toggle("dark-theme", state);
  }

  // Initial setting
  if (localStorage.getItem("rpdev-dark-theme")) {
    toggleDarkMode(localStorage.getItem("rpdev-dark-theme") == "true");
    darkModeState = localStorage.getItem("rpdev-dark-theme") == "true";
  } else {
    toggleDarkMode(useDark.matches);
    darkModeState = useDark.matches;
  }
})();
