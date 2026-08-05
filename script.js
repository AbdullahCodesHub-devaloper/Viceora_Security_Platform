"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initializeApplication();
});

function initializeApplication() {
    const elements = getElements();

    if (!elements.navbar) {
        console.warn("Navbar was not found. Some features have been skipped.");
        return;
    }

    setupStickyNavbar(elements);
    setupMobileNavigation(elements);
    setupSmoothScrolling(elements);
    setupActiveNavigation(elements);
    setupCloseMobileMenu(elements);
    setupLoginButton(elements);
}

function getElements() {
    return {
        body: document.body,
        navbar: document.querySelector(".navbar"),
        navigation: document.querySelector(".navigation"),
        navLinks: document.querySelectorAll(".navigation a"),
        menuToggle: document.querySelector(".menu-toggle"),
        adminButton: document.querySelector("#loginButton"),
        featureCards: document.querySelectorAll(".feature-card"),
        heroSection: document.querySelector(".hero")
    };
}

function setupStickyNavbar(elements) {
    let isSticky = false;

    const updateNavbar = () => {
        const shouldStick = window.scrollY > 25;

        if (shouldStick === isSticky) return;

        isSticky = shouldStick;
        elements.navbar.classList.toggle("navbar-scrolled", shouldStick);
    };

    updateNavbar();

    window.addEventListener("scroll", updateNavbar, { passive: true });
}

function setupMobileNavigation(elements) {
    if (!elements.menuToggle || !elements.navigation) return;

    elements.menuToggle.addEventListener("click", () => {
        const isOpen = elements.navigation.classList.toggle("navigation-open");
        elements.menuToggle.classList.toggle("active", isOpen);
        elements.menuToggle.setAttribute("aria-expanded", isOpen);
    });
}

function setupSmoothScrolling(elements) {
    elements.navLinks.forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute("href");

            if (!targetId || !targetId.startsWith("#")) return;

            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            event.preventDefault();
            targetSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}

function setupActiveNavigation(elements) {
    const sectionLinks = Array.from(elements.navLinks).filter(link =>
        link.getAttribute("href").startsWith("#")
    );

    if (!sectionLinks.length) return;

    const sections = sectionLinks
        .map(link => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            sectionLinks.forEach(link => {
                const isActive = link.getAttribute("href") === `#${entry.target.id}`;
                link.classList.toggle("active", isActive);
            });
        });
    }, { threshold: 0.55 });

    sections.forEach(section => observer.observe(section));
}

function setupCloseMobileMenu(elements) {
    elements.navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (!elements.navigation.classList.contains("navigation-open")) return;

            elements.navigation.classList.remove("navigation-open");
            elements.menuToggle.classList.remove("active");
            elements.menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

function setupLoginButton(elements) {
    if (!elements.adminButton) return;

    elements.adminButton.addEventListener("click", () => {
        window.location.href = "login.html";
    });
}

function setupPageLoader() {
    const loader = document.querySelector(".page-loader");
    if (!loader) return;

    window.addEventListener("load", () => {
        loader.classList.add("loader-hidden");
        loader.addEventListener("transitionend", () => {
            loader.remove();
        });
    }, { once: true });
}

function setupScrollReveal() {
    const revealElements = document.querySelectorAll(`
        .feature-card,
        .footer-column,
        .footer-brand,
        .hero-content
    `);

    if (!revealElements.length) return;

    const observer = new IntersectionObserver(handleReveal, {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px"
    });

    revealElements.forEach(element => {
        element.classList.add("reveal");
        observer.observe(element);
    });
}

function handleReveal(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
    });
}