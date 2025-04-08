/**
 * Adds dropdown functionality and keyboard accessibility to the sub menu(s) following
 * the disclosure pattern.
 *
 * Given a list of elements in a given menu, creates a disclosure pattern dropdown for
 * every containing element that has a button with "aria-expanded" and "aria-controls"
 * attributes.
 *
 * Example:
 * ```
 *  <li>
 *    <button aria-expanded='false' aria-controls='dropdown-menu'>
 *      View More...
 *    </button>
 *    <ul id='dropdown-menu'>
 *        <li></li>
 *    </ul>
 *  </li>
 * ```
 *
 * The function supports tab navigation and allows users to navigate through the menu items
 * using ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, End, and Escape. It also manages
 * the open/close state of submenus based on user interactions like clicks and key presses.
 * Additionally, it ensures that focus management within submenus is handled correctly.
 *
 * @param {string} parentMenuSelector - A CSS selector string used to identify the parent menu element(s) within which
 *                                      submenus will be enhanced. This allows targeting specific menus on the page.
 * @param {string} subMenuClass - A base class name used to control the visibility of submenus through CSS classes.
 *                                The function toggles `${subMenuClass}--open` and `${subMenuClass}--closed` classes
 *                                to show/hide submenus. This parameter allows customization of submenu appearance.
 * @returns {Object} An object containing a method named `close`, which programmatically closes the currently opened submenu.
 */
export function addDisclosureFunctionalityToSubmenus(
  parentMenuSelector,
  subMenuClass
) {
  function createDisclosureNav(domNode) {
    const rootNode = domNode;
    const controlledNodes = [];
    let openIndex = null;
    const supportArrowKeys = true;

    const onButtonEvent = {
      click: onButtonClick,
      keydown: onButtonKeyDown,
    };

    const topLevelNodes = Array.from(
      rootNode.querySelectorAll("button[aria-expanded][aria-controls]")
    );

    topLevelNodes.forEach((node) => {
      if (
        node.tagName.toLowerCase() === "button" &&
        node.hasAttribute("aria-controls")
      ) {
        const menu = node.parentNode.querySelector("ul");
        if (menu) {
          controlledNodes.push(menu);
          node.setAttribute("aria-expanded", "false");
          toggleMenu(menu, false);

          setMenuHeight(menu); // Briefly render a clone of the menu to get its height
          window.addEventListener("load", () => setMenuHeight(menu)); // Reset menu height once any fonts are definitely loaded

          // Use resize observer to set the menu height when vertically resized
          window.addEventListener(
            "resize",
            debounce(() => {
              setMenuHeight(menu);
            }, 100)
          );
          menu.addEventListener("keydown", onMenuKeyDown);
          ["click", "keydown"].forEach((eventType) =>
            node.addEventListener(eventType, onButtonEvent[eventType])
          );
          document.addEventListener("click", (event) =>
            handleOutsideMenuClick(event, menu)
          );
        }
      } else {
        controlledNodes.push(null);
        node.addEventListener("keydown", onLinkKeyDown);
      }
    });

    // rootNode.addEventListener('focusout', onBlur);

    function controlFocusByKey(keyboardEvent, nodeList, currentIndex) {
      const { key } = keyboardEvent;

      let newIndex;
      switch (key) {
        case "ArrowUp":
        case "ArrowLeft":
          keyboardEvent.preventDefault();
          newIndex = Math.max(0, currentIndex - 1);
          break;
        case "ArrowDown":
        case "ArrowRight":
          keyboardEvent.preventDefault();
          newIndex = Math.min(nodeList.length - 1, currentIndex + 1);
          break;
        case "Home":
          keyboardEvent.preventDefault();
          newIndex = 0;
          break;
        case "End":
          keyboardEvent.preventDefault();
          newIndex = nodeList.length - 1;
          break;
      }

      if (newIndex !== undefined) {
        nodeList[newIndex].focus();
      }
    }

    function toggleExpand(index, expanded) {
      if (openIndex !== index) {
        toggleExpand(openIndex, false);
      }

      if (topLevelNodes[index]) {
        openIndex = expanded ? index : null;
        topLevelNodes[index].setAttribute("aria-expanded", expanded);
        toggleMenu(controlledNodes[index], expanded);
      }
    }

    function toggleMenu(domNode, show) {
      if (show) {
        domNode.classList.remove(`${subMenuClass}--closed`); // Removes 'closed' styling
        // First requestAnimationFrame ensures display property change is processed
        requestAnimationFrame(() => {
          // Second requestAnimationFrame schedules class addition right before next repaint
          requestAnimationFrame(() => {
            domNode.classList.add(`${subMenuClass}--open`); // Add class to trigger fade-in animation
          });
        });
      } else {
        domNode.classList.remove(`${subMenuClass}--open`); // Trigger fade out animation
        domNode.classList.add(`${subMenuClass}--closing`);
        setTimeout(() => {
          domNode.classList.remove(`${subMenuClass}--closing`);
          domNode.classList.add(`${subMenuClass}--closed`); // Sets display: none if not using Bootstrap collapse

          // Manually remove Bootstrap ".show" class if present since Bootstrap doesn't
          // remove it when the menu is closed via 'esc' key or tabbing out of the menu
          if (domNode.classList.contains("show")) {
            domNode.classList.remove("show");
          }
        }, 350);
      }
    }

    function onBlur(event) {
      const menuContainsFocus = rootNode.contains(event.relatedTarget);
      if (!menuContainsFocus && openIndex !== null) {
        toggleExpand(openIndex, false);
      }
    }

    function onButtonClick(event) {
      const button = event.currentTarget;
      const buttonIndex = topLevelNodes.indexOf(button);
      const buttonExpanded = button.getAttribute("aria-expanded") === "true";
      toggleExpand(buttonIndex, !buttonExpanded);
    }

    function onButtonKeyDown(event) {
      const targetButtonIndex = topLevelNodes.indexOf(document.activeElement);

      if (event.key === "Escape") {
        toggleExpand(openIndex, false);
      } else if (
        supportArrowKeys &&
        openIndex === targetButtonIndex &&
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        controlledNodes[openIndex].querySelector("a").focus();
      } else if (supportArrowKeys) {
        controlFocusByKey(event, topLevelNodes, targetButtonIndex);
      }
    }

    function onLinkKeyDown(event) {
      const targetLinkIndex = topLevelNodes.indexOf(document.activeElement);
      if (supportArrowKeys) {
        controlFocusByKey(event, topLevelNodes, targetLinkIndex);
      }
    }

    function onMenuKeyDown(event) {
      if (openIndex === null) {
        return;
      }

      const menuLinks = Array.from(
        controlledNodes[openIndex].querySelectorAll("a")
      );
      const currentIndex = menuLinks.indexOf(document.activeElement);

      if (event.key === "Escape") {
        topLevelNodes[openIndex].focus();
        toggleExpand(openIndex, false);
      } else if (supportArrowKeys) {
        controlFocusByKey(event, menuLinks, currentIndex);
      }
    }

    async function getHiddenMenuHeight(menu) {
      const hiddenMenu = menu.cloneNode(true);
      hiddenMenu.style.position = "absolute";
      hiddenMenu.style.visibility = "hidden";
      hiddenMenu.style.setProperty("display", "block", "important");
      hiddenMenu.style.setProperty("height", "auto", "important");
      hiddenMenu.setAttribute("id", "primary-nav-clone");
      hiddenMenu.style.pointerEvents = "none";
      // Get parent element of the menu
      const container = menu.parentNode;
      container.appendChild(hiddenMenu);
      //   const height = hiddenMenu.offsetHeight;
      const height = await new Promise((resolve) => {
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() => {
            resolve(hiddenMenu.offsetHeight);
          })
        );
      });
      setTimeout(() => container.removeChild(hiddenMenu), 300);
      return height;
    }

    async function setMenuHeight(menuEl) {
      const menuHeight = await getHiddenMenuHeight(menuEl);
      // set the --dropdown-nav-height CSS variable to the height of the menu
      menuEl.style.setProperty("--dropdown-nav-height", `${menuHeight}px`);
    }

    // Create an even handler that closes the menu when clicking outside of it
    function handleOutsideMenuClick(event, menuElement) {
      // Early exit if the menu is already closed
      if (menuElement.classList.contains(`${subMenuClass}--closed`)) {
        return;
      }
      const isClickInsideMenu = menuElement.contains(event.target);
      // Check if the click was outside the menu and its button
      const isClickInsideButton = event.target.closest(
        "button[aria-expanded][aria-controls]"
      );
      // If the click was outside the menu and its button, close the menu
      if (!isClickInsideMenu && !isClickInsideButton) {
        toggleExpand(openIndex, false);
      }
    }

    return {
      close: () => toggleExpand(openIndex, false),
    };
  }

  // Call the function for all disclosure pattern submenus in the primary nav menu
  const menus = document.querySelectorAll(parentMenuSelector);
  Array.from(menus).map(createDisclosureNav);
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
