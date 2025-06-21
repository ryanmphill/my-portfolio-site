import homeInit from "./home.js";
import { addDisclosureFunctionalityToSubmenus } from "./navbar.js";
import { applyColorTheme } from "./theme.js";

// Dropdown menu functionality
addDisclosureFunctionalityToSubmenus(".navbar", "navbar__links");
applyColorTheme();
// document.fonts.addEventListener("loadingdone", (event) => {
//   const navLinks = document.getElementById("primary-nav");
//   if (navLinks) {
//     navLinks.classList.remove("initially-hidden");
//   }
// });
let navFontsLoaded = false;
document.fonts.ready.then(() => {
  if (navFontsLoaded) return; // If fonts are already loaded, skip this
  const navLinks = document.getElementById("primary-nav");
  if (navLinks) {
    navLinks.classList.remove("initially-hidden");
    navFontsLoaded = true;
  }
});
setTimeout(() => {
  if (navFontsLoaded) return; // If fonts are already loaded, skip this
  const navLinks = document.getElementById("primary-nav");
  if (navLinks) {
    navLinks.classList.remove("initially-hidden");
    navFontsLoaded = true;
  }
}, 200);

if (
  window.location.pathname === "/" ||
  window.location.pathname === "/index.html"
) {
  homeInit();
}
