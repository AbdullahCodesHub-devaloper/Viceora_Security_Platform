"use strict";




// Wait until the DOM is ready before touching anything.
document.addEventListener("DOMContentLoaded", () => {
    initializeApplication();
});


function initializeApplication() {

    // Cache frequently used elements once.
    const elements = getElements();

    // Stop here if the page structure isn't what we expect.
    if (!elements.navbar) {
        console.warn("Navbar was not found. Some features have been skipped.");
        return;
    }

    setupStickyNavbar(elements);
    setupMobileNavigation(elements);
    setupKeyboardAccessibility(elements);
}



// Keeping all selectors in one place makes maintenance
// much easier if the HTML changes later.
function getElements() {

    return {
        body: document.body,

        navbar: document.querySelector(".navbar"),

        navigation: document.querySelector(".navigation"),

        navLinks: document.querySelectorAll(".navigation a"),

        menuToggle: document.querySelector(".menu-toggle"),

        adminButton: document.querySelector(".admin-btn"),

        featureCards: document.querySelectorAll(".feature-card"),

        heroSection: document.querySelector(".hero")
    };

}


// Add a class once the user starts scrolling.
// The CSS controls how the navbar should look.
function setupStickyNavbar(elements) {

    let isSticky = false;

    const updateNavbar = () => {

        const shouldStick = window.scrollY > 25;

        // No reason to touch the DOM if nothing changed.
        if (shouldStick === isSticky) {
            return;
        }

        isSticky = shouldStick;

        elements.navbar.classList.toggle("navbar-scrolled", shouldStick);

    };

    // Run once so the navbar is correct after refresh.
    updateNavbar();

    // Passive scrolling keeps scrolling smooth.
    window.addEventListener("scroll", updateNavbar, {
        passive: true
    });

}


// Handle opening and closing the mobile menu from
// a single place instead of scattering listeners.
function setupMobileNavigation(elements) {

    if (!elements.menuToggle || !elements.navigation) {
        return;
    }

    elements.menuToggle.addEventListener("click", () => {

        const isOpen =
            elements.navigation.classList.toggle("navigation-open");

        elements.menuToggle.classList.toggle("active", isOpen);

        elements.menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    });

}