import { useRef, useState } from "react";

import { Logo } from "../../atoms/logo";
import MainMenu from "../../molecules/main-menu";
import { Search } from "../../molecules/search";

import "./index.scss";

export function Header() {
  const [showMainMenu, setShowMainMenu] = useState(false);
  const mainMenuToggleRef = useRef<null | HTMLButtonElement>(null);

  function toggleMainMenu() {
    const pageOverlay = document.querySelector(".page-overlay");
    const mainMenuButton = mainMenuToggleRef.current;

    if (mainMenuButton) {
      mainMenuButton.classList.toggle("expanded");
      setShowMainMenu(!showMainMenu);
    }

    if (pageOverlay) {
      pageOverlay.classList.toggle("hidden");
    }
  }

  function alwaysPreloadSearchByClient() {
    const isServer = typeof window === "undefined";
    if (!isServer) {
      // You can't look for 'iPad' in `navigator.userAgent` because of an iPad,
      // that outcome doesn't method 'iPad'.
      // But for tablets, on iOS we can detect by looking for 'Safari' and
      // looking at the client width/height.
      // Buy what's so specific about iPad?
      // They are large enough that you don't need to use a hamburger to
      // initially hide the menu, so we can't use that as a clue to start
      // preloading the advanced search widget. But iPad uses iOS Safari
      // which means it exhibits the "bug" where you can't programmatically
      // trigger a input `.focus()` (and making the keyboard come up).
      // So the last trouble-maker is iOS Safari tablets.
      if (
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("iPhone") &&
        window.innerWidth > 700 &&
        window.innerWidth < 1200
      ) {
        return true;
      }
    }
    return false;
  }

  return (
    <header className="page-header">
      <Logo />
      <button
        ref={mainMenuToggleRef}
        type="button"
        className="ghost main-menu-toggle"
        aria-haspopup="true"
        aria-label="Show Menu"
        onClick={toggleMainMenu}
      />
      <div className={`page-header-main ${showMainMenu ? "show" : ""}`}>
        <MainMenu
          toggleMainMenu={() => {
            toggleMainMenu();
          }}
        />

        <Search
          // The preload option tells the <Search> component to immediately
          // switch from the basic search widget to the "fancy one". I.e. the
          // one that does autocomplete as you type.
          // With CSS, the whole main menu is only visible if you're on a
          // smaller screen. Such as a smartphone. If you have bothered to
          // click to expand the menu, let's kill two birds with one stone:
          //
          //  1. You're very likely to want to interact with the search widget
          //     and even if that's not the case, it's a rather painless
          //     to start downloading (lazy-loading) the CSS and JS needed
          //     just in case. At least we know that we're not at the
          //     critical initial render we needs to be as fast as possible.
          //  2. If you're on a small device, it's a very high probability
          //     that you're on an Apple iPhone. The iOS Safari browser has
          //     a "bug" or limitation in that you can't control focus on an
          //     input field (e.g. `element.focus()`) programmatically unless
          //     it was the synchronous result of a click. Because our technique
          //     is to lazy-load the fancy search widget only after a first
          //     click, we can't put the focus back into the input field
          //     specifically for iOS Safari.
          //
          preload={showMainMenu || alwaysPreloadSearchByClient()}
          onResultPicked={() => {
            toggleMainMenu();
          }}
        />
      </div>
    </header>
  );
}
