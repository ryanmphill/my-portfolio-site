import homeInit from "./home.js";
import { addDisclosureFunctionalityToSubmenus } from "./navbar.js";
import { applyColorTheme } from "./theme.js";

// Dropdown menu functionality
addDisclosureFunctionalityToSubmenus(".navbar", "navbar__links");
applyColorTheme();

if (
  window.location.pathname === "/" ||
  window.location.pathname === "/index.html"
) {
  homeInit();
}
