export default function homeInit() {
  fadeInSectionsOnScrollIntersect();
  scrollParallaxContainerFromDocRoot();
  setTimeout(() => {
    document
      .querySelector(".homepage-header__layer0")
      .style.removeProperty("will-change");
  }, 2000);
}

// Intersection Observer for fade-in effect
function fadeInSectionsOnScrollIntersect() {
  // Check if the browser supports the Intersection Observer API
  if ("IntersectionObserver" in window) {
    // Create a new Intersection Observer instance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in");
          } else {
            // Optionally remove class when not in view
          }
        });
      },
      {
        threshold: 0, // Trigger when 10% of the element is visible
        rootMargin: "0px", // Adjust the root margin to trigger earlier
      }
    );

    // Select all elements with the class "fade-in-section"
    const fadeInSections = document.querySelectorAll("section");

    // Observe each section
    fadeInSections.forEach((section) => {
      observer.observe(section);
    });
  }
}

function scrollParallaxContainerFromDocRoot() {
  // Scrolling functionality
  const scrollContainer = document.querySelector(".parallax");

  // Get the height of the all of the inner content in the .parallax element
  const mainContent = document.querySelector(".parallax .content");
  const header = document.querySelector(".parallax header");
  const navbar = document.querySelector(".parallax nav");

  // Set styles to the .parallax element
  scrollContainer.style.setProperty("overflow-y", "clip");
  scrollContainer.style.setProperty("position", "sticky");
  scrollContainer.style.setProperty("top", "0");
  scrollContainer.style.willChange = "scroll-position";

  // Calculate the height of the overflowing content inside of the .parallax element
  // and set the height of the body to be the same as the height of the overflowing content
  // so that the scroll bar is not visible
  function setBodyHeight() {
    // document.body.style.setProperty("height", `calc(100vh + ${mainContent.offsetHeight}px)`);
    document.body.style.setProperty(
      "height",
      navbar.offsetHeight +
        mainContent.offsetHeight +
        header.offsetHeight +
        "px"
    );
  }

  setBodyHeight();

  window.addEventListener("load", setBodyHeight);
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (lastWidth !== window.innerWidth) {
      setBodyHeight();
      lastWidth = window.innerWidth;
    }
  });

  let scrollEventTimeout;

  function syncContainerScrollToWindow(e) {
    clearTimeout(scrollEventTimeout);
    scrollContainer.removeEventListener("scroll", syncWindowScrollToContainer);
    window.requestAnimationFrame(() => {
      scrollContainer.scroll(0, window.scrollY);
      scrollEventTimeout = setTimeout(() => {
        scrollContainer.addEventListener("scroll", syncWindowScrollToContainer);
      }, 200);
    });
  }

  function syncWindowScrollToContainer(e) {
    clearTimeout(scrollEventTimeout);
    window.removeEventListener("scroll", syncContainerScrollToWindow);
    window.requestAnimationFrame(() => {
      window.scrollTo(0, scrollContainer.scrollTop);
      scrollEventTimeout = setTimeout(() => {
        window.addEventListener("scroll", syncContainerScrollToWindow);
      }, 200);
    });
  }

  window.addEventListener("scroll", syncContainerScrollToWindow);
  scrollContainer.addEventListener("scroll", syncWindowScrollToContainer);

  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("nav-link")) return;
    e.preventDefault();
    const target = e.target.getAttribute("href");
    const targetElement = document.querySelector(target);
    if (!targetElement) return;
    const targetOffsetTop = targetElement.offsetTop;
    scrollContainer.scrollTo({
      top: targetOffsetTop,
      behavior: "smooth",
    });
  });

  // Scroll (parallax) container was previously hidden for smooth rendering
  // and is now revealed with a fade-in effect
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      scrollContainer.style.visibility = "visible";
      scrollContainer.style.opacity = "1";
    });
  });
}
