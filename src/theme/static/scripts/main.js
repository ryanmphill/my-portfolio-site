import { addDisclosureFunctionalityToSubmenus } from "./navbar.js";

addDisclosureFunctionalityToSubmenus(".navbar", "navbar__links");

const scrollContainer = document.querySelector(".parallax");

let ticking = false;
scrollContainer.addEventListener("scroll", function () {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      window.scrollTo(0, scrollContainer.scrollTop);
      ticking = false;
    });
    ticking = true;
  }
});
