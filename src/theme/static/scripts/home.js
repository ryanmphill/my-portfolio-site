export default function homeInit() {
  setViewportHeightVariable();
  setNavHeightVariable();
  window.addEventListener("load", setNavHeightVariable);
  window.addEventListener("resize", debounce(handleViewportWidthChange, 100));

  fadeInSectionsOnScrollIntersect();
  scrollParallaxContainerFromDocRoot();
  document
    .querySelector(".homepage-header__layer0.sun-slide-up")
    .addEventListener("animationend", (e) => {
      setTimeout(() => {
        e.target.style.removeProperty("will-change");
      }, 500);
    });
  document.addEventListener("DOMContentLoaded", () =>
    removeAnimationOnLowRefreshRate()
  );
  document
    .querySelector("#contact-form")
    .addEventListener("submit", handleContactFormSubmit);
}

function setViewportHeightVariable() {
  // Set the viewport height variable to the height of the viewport
  // This is used to set the height of the parallax container and header
  const vh = Math.round(window.innerHeight) * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

function setNavHeightVariable() {
  // Set the navbar height variable to the height of the navbar
  // This is used to set the padding-top of the parallax container
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    const navHeight = navbar.offsetHeight;
    document.documentElement.style.setProperty(
      "--nav-height",
      `${navHeight}px`
    );
  }
}

let lastViewportWidth = window.innerWidth;
function handleViewportWidthChange(e) {
  // Check if the viewport width has changed
  if (lastViewportWidth !== window.innerWidth) {
    // Update the viewport height variable
    setViewportHeightVariable();
    lastViewportWidth = window.innerWidth;
  }
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
            entry.target.style.opacity = "1";
          } else {
            // Optionally remove class when not in view
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px", // Adjust the root margin to trigger earlier
      }
    );

    // Select all elements with the class "fade-in-section"
    const fadeInSections = document.querySelectorAll("section");

    fadeInSections.forEach((section) => {
      // Set initial opacity to 0
      section.style.opacity = "0";
    });

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
  const mainContent = document.querySelector(".content");
  const header = document.querySelector(".homepage-header");
  const navbar = document.querySelector(".navbar");

  // Set styles to the .parallax element
  scrollContainer.style.setProperty("overflow-y", "hidden");
  scrollContainer.style.setProperty("position", "sticky");
  // scrollContainer.style.setProperty("overflow-y", "auto");
  // scrollContainer.style.setProperty("position", "sticky");
  // scrollContainer.style.setProperty("scrollbar-width", "none");
  const navHeight = navbar.offsetHeight;
  scrollContainer.style.setProperty("padding-top", `${navHeight}px`);
  scrollContainer.style.setProperty("top", `0`);
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

  // setBodyHeight();
  // window.addEventListener("resize", debounce(updateBodyHeight, 200));

  // window.addEventListener("load", setBodyHeight);
  let lastWidth = window.innerWidth;
  function updateBodyHeight() {
    if (lastWidth !== window.innerWidth) {
      setBodyHeight();
      lastWidth = window.innerWidth;
    }
  }

  let scrollEventTimeout;

  let containerScrollRequested = false;
  function syncContainerScrollToWindow(e) {
    if (!containerScrollRequested) {
      clearTimeout(scrollEventTimeout);
      scrollContainer.removeEventListener(
        "scroll",
        syncWindowScrollToContainer
      );

      window.requestAnimationFrame(() => {
        scrollContainer.scroll(0, window.scrollY);
        scrollEventTimeout = setTimeout(() => {
          scrollContainer.addEventListener(
            "scroll",
            syncWindowScrollToContainer,
            {
              passive: true,
            }
          );
        }, 200);
        containerScrollRequested = false;
      });
      containerScrollRequested = true;
    }
  }

  let windowScrollRequested = false;
  function syncWindowScrollToContainer(e) {
    if (!windowScrollRequested) {
      clearTimeout(scrollEventTimeout);
      window.removeEventListener("scroll", syncContainerScrollToWindow);

      window.requestAnimationFrame(() => {
        window.scrollTo(0, scrollContainer.scrollTop);
        scrollEventTimeout = setTimeout(() => {
          window.addEventListener("scroll", syncContainerScrollToWindow, {
            passive: true,
          });
        }, 200);
        windowScrollRequested = false;
      });
      windowScrollRequested = true;
    }
  }

  window.addEventListener("scroll", syncContainerScrollToWindow, {
    passive: true,
  });
  scrollContainer.addEventListener("scroll", syncWindowScrollToContainer, {
    passive: true,
  });

  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("nav-link")) return;
    e.preventDefault();
    const target = e.target.getAttribute("href");
    const targetElement = document.querySelector(target);
    if (!targetElement) return;
    const mainContentOffsetTop = mainContent.offsetTop;
    const targetOffsetTop = targetElement.offsetTop + mainContentOffsetTop;
    // scrollContainer.scrollTo({
    //   top: targetOffsetTop,
    //   behavior: "smooth",
    // });
    // console.log("targetOffsetTop", targetOffsetTop);
    window.scrollTo({
      top: targetOffsetTop,
      behavior: "smooth",
    });
    // setTimeout(() => console.log("currentScrollY", window.scrollY), 3000);
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

function setFallbackHeightsForParallaxAndHeader() {
  const parallaxContainer = document.querySelector(".parallax");
  const header = document.querySelector(".parallax header");
  const navbar = document.querySelector(".parallax nav");

  setParallaxContainerHeight();
  window.addEventListener(
    "resize",
    debounce(updateParallaxContainerHeight, 200)
  );

  function setParallaxContainerHeight() {
    const headerHeight = window.innerHeight - navbar.offsetHeight;
    parallaxContainer.style.setProperty("height", `${window.screen.height}px`);
    header.style.setProperty("height", `${headerHeight}px`);
  }

  let initialWidth = window.innerWidth;
  function updateParallaxContainerHeight() {
    if (window.innerWidth !== initialWidth) {
      setParallaxContainerHeight();
      initialWidth = window.innerWidth;
    }
  }
}

const loadingSpinner = `
<div class="loading-spinner" role="status">
  <span class="sr-only">Loading...</span>
</div>
`;

let contactFormSubmitting = false;
async function handleContactFormSubmit(event) {
  event.preventDefault();

  if (contactFormSubmitting) return;
  contactFormSubmitting = true;
  const myForm = event.target;
  const formData = new FormData(myForm);
  const submitButton = myForm.querySelector("button[type='submit']");
  const submitButtonText = submitButton.textContent;
  // Get the width of the submit button and set it
  const submitButtonWidth = submitButton.offsetWidth;
  // Set the button width so it doesn't change when the loading spinner is added
  submitButton.style.minWidth = `${submitButtonWidth}px`;

  // Add a loading spinner to the submit button
  submitButton.innerHTML = loadingSpinner;
  const messageEl = document.querySelector("#contact-response-message");

  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    if (messageEl) {
      messageEl.textContent = "Thank you for your message!";
      messageEl.classList.add("homepage__form-success");
    }
    submitButton.textContent = "Message Sent!";
    submitButton.disabled = true;
    myForm.reset();
  } catch (error) {
    console.error("Error submitting form:", error);
    if (messageEl) {
      messageEl.textContent =
        "There was an error submitting your message. Try again later, or feel free to reach out to me on social media!";
      messageEl.classList.add("homepage__form-error");
    }
    submitButton.textContent = submitButtonText; // Reset the button text
  } finally {
    contactFormSubmitting = false;
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function getRefreshRate(maxFrames = 25) {
  return new Promise((resolve) => {
    let lastFrameTime = performance.now();
    let count = 0;
    let refreshRates = [];
    maxFrames = maxFrames + 2; // Add two frames to skip initial fluctuations

    function update() {
      count++;
      const currentTime = performance.now();
      const elapsedTime = currentTime - lastFrameTime; // Calculate elapsed time in milliseconds

      // Update last frame time
      lastFrameTime = currentTime;

      // Log the elapsed time
      if (count > 2) {
        // Skip the first two frames to avoid initial fluctuations
        refreshRates.push(elapsedTime.toFixed(2));
      }

      // Call the update function for the next frame
      if (count <= maxFrames + 2) {
        requestAnimationFrame(update);
      } else {
        // Calculate the average refresh rate
        const total = refreshRates.reduce(
          (acc, val) => acc + parseFloat(val),
          0
        );
        const average = total / refreshRates.length;
        resolve(1000 / average); // Convert to Hz
      }
    }

    // Start the animation loop
    requestAnimationFrame(update);
  });
}

async function removeAnimationOnLowRefreshRate(minRate = 34) {
  // This function exists to prevent a choppy parallax effect on low refresh rate devices,
  // especially mobile devices on battery saver mode, which can have a refresh rate of 30Hz or lower.
  const refreshRate = await getRefreshRate();
  if (refreshRate <= minRate) {
    // Add "no-animation" class to the .parallax element
    const parallaxContainer = document.querySelector(".parallax");
    if (parallaxContainer) {
      parallaxContainer.classList.add("no-header-animation");
      console.log("Low refresh rate detected, parallax disabled.");
    }
  }
}
