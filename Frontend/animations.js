
//* ===========================//

// Alert Javascript of Animations of Landing Page Html//
//============================//
(() => {
  'use strict';

  const CONFIG = {
    loader: {
      minDisplayMs: 400,
      exitDurationMs: 600,
    },
    timeline: {
      navbarDelay: 0,
      logoDelay: 150,
      navLinkStagger: 80,
      rightActionsDelay: 450,
      heroTitleDelay: 550,
      heroWordStagger: 60,
      heroDescriptionDelay: 900,
      ctaDelay: 1050,
      featureCardsDelay: 1200,
      featureCardStagger: 90,
    },
    typewriter: {
      phrases: [
        // 'AI-Powered Enterprise Security',
        // 'Face Recognition Intelligence',
        // 'Smart Threat Detection',
        // 'AI Surveillance Platform',
        // 'Secure Your Future',
        // 'Intelligent Monitoring',
      ],
      typeSpeed: 55,
      deleteSpeed: 28,
      pauseAfterType: 1800,
      pauseAfterDelete: 400,
    },
    reveal: {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px',
    },
    parallax: {
      heroMaxOffset: 16,
      shapeMaxOffset: 30,
      ease: 0.08,
    },
    magnetic: {
      strength: 0.35,
      maxOffset: 14,
    },
    sticky: {
      offset: 40,
    },
  };

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const debounce = (fn, delay) => {
    let id;
    return (...args) => {
      clearTimeout(id);
      id = setTimeout(() => fn(...args), delay);
    };
  };

  const rafThrottle = (fn) => {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn(...args);
        ticking = false;
      });
    };
  };

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const safeInit = (name, fn) => {
    try {
      fn();
    } catch (err) {
      void name;
      void err;
    }
  };

  const dom = {
    loader: qs('.page-loader'),
    navbar: qs('.navbar'),
    brand: qs('.brand'),
    logoWrapper: qs('.logo-wrapper'),
    navigation: qs('.navigation'),
    navLinks: qsa('.navigation a'),
    rightActions: qs('.right-actions'),
    rightActionItems: qsa('.right-actions > *'),
    heroSection: qs('#home'),
    heroContent: qs('.hero-content'),
    heroTitle: qs('.animated-text'),
    heroDescription: qs('.hero-content p'),
    ctaButtons: qsa('.cta-button, .btn-primary, .btn-secondary'),
    heroShapes: qsa('.hero-shape'),
    featureCards: qsa('.feature-card'),
    footer: qs('.footer'),
    sections: qsa('section[id]'),
  };

  document.documentElement.classList.toggle('reduced-motion', prefersReducedMotion());

  const LoaderManager = {
    onComplete: null,

    init(onComplete) {
      this.onComplete = onComplete;
      if (!dom.loader) {
        this.onComplete?.();
        return;
      }

      const startTime = performance.now();

      const finish = () => {
        const elapsed = performance.now() - startTime;
        const wait = Math.max(0, CONFIG.loader.minDisplayMs - elapsed);

        setTimeout(() => {
          dom.loader.style.pointerEvents = 'none';
          dom.loader.classList.add('is-exiting');

          const cleanup = () => {
            dom.loader.remove();
            this.onComplete?.();
          };

          if (prefersReducedMotion()) {
            cleanup();
            return;
          }

          dom.loader.addEventListener('transitionend', cleanup, { once: true });
          setTimeout(cleanup, CONFIG.loader.exitDurationMs + 100);
        }, wait);
      };

      if (document.readyState === 'complete') {
        finish();
      } else {
        window.addEventListener('load', finish, { once: true });
      }
    },
  };

  const NavbarAnimation = {
    reveal() {
      if (!dom.navbar) return Promise.resolve();

      if (prefersReducedMotion()) {
        dom.navbar.classList.add('is-visible');
        dom.brand?.classList.add('is-visible');
        dom.navLinks.forEach((link) => link.classList.add('is-visible'));
        dom.rightActionItems.forEach((item) => item.classList.add('is-visible'));
        return Promise.resolve();
      }

      dom.navbar.classList.add('is-visible');

      setTimeout(() => {
        dom.brand?.classList.add('is-visible');
      }, CONFIG.timeline.logoDelay);

      dom.navLinks.forEach((link, index) => {
        setTimeout(() => {
          link.classList.add('is-visible');
        }, CONFIG.timeline.logoDelay + CONFIG.timeline.navLinkStagger * (index + 1));
      });

      return new Promise((resolve) => {
        setTimeout(() => {
          dom.rightActionItems.forEach((item, index) => {
            setTimeout(() => item.classList.add('is-visible'), index * 60);
          });
          resolve();
        }, CONFIG.timeline.rightActionsDelay);
      });
    },

    initStickyGlass() {
      if (!dom.navbar) return;
      const onScroll = rafThrottle(() => {
        dom.navbar.classList.toggle('is-scrolled', window.scrollY > CONFIG.sticky.offset);
      });
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    },

    initLogoFloat() {
      if (!dom.logoWrapper || prefersReducedMotion()) return;
      dom.logoWrapper.classList.add('logo-floating');
    },
  };

  const HeroAnimation = {
    wordSpans: [],

    splitTitle() {
      if (!dom.heroTitle) return;
      const words = dom.heroTitle.textContent.trim().split(/\s+/);
      dom.heroTitle.textContent = '';
      dom.heroTitle.setAttribute('aria-label', words.join(' '));

      this.wordSpans = words.map((word, index) => {
        const span = document.createElement('span');
        span.className = 'hero-word';
        span.textContent = word;
        span.style.setProperty('--word-index', index);
        dom.heroTitle.appendChild(span);
        if (index < words.length - 1) {
          dom.heroTitle.appendChild(document.createTextNode(' '));
        }
        return span;
      });
    },

    reveal() {
      if (!dom.heroTitle) return Promise.resolve();

      if (prefersReducedMotion()) {
        this.wordSpans.forEach((span) => span.classList.add('is-visible'));
        dom.heroDescription?.classList.add('is-visible');
        dom.ctaButtons.forEach((btn) => btn.classList.add('is-visible'));
        return Promise.resolve();
      }

      this.wordSpans.forEach((span, index) => {
        setTimeout(() => {
          span.classList.add('is-visible');
        }, index * CONFIG.timeline.heroWordStagger);
      });

      const wordsFinishAt = this.wordSpans.length * CONFIG.timeline.heroWordStagger;

      setTimeout(() => {
        dom.heroDescription?.classList.add('is-visible');
      }, wordsFinishAt + 200);

      return new Promise((resolve) => {
        setTimeout(() => {
          dom.ctaButtons.forEach((btn, index) => {
            setTimeout(() => btn.classList.add('is-visible'), index * 100);
          });
          resolve();
        }, wordsFinishAt + 350);
      });
    },

    initParallax() {
      if (!dom.heroSection || prefersReducedMotion()) return;

      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let rafId = null;

      const loop = () => {
        currentX += (targetX - currentX) * CONFIG.parallax.ease;
        currentY += (targetY - currentY) * CONFIG.parallax.ease;

        if (dom.heroTitle) {
          dom.heroTitle.style.transform =
            `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
        }

        dom.heroShapes.forEach((shape, index) => {
          const depth = (index + 1) / dom.heroShapes.length;
          const offsetX = currentX * depth * (CONFIG.parallax.shapeMaxOffset / CONFIG.parallax.heroMaxOffset);
          const offsetY = currentY * depth * (CONFIG.parallax.shapeMaxOffset / CONFIG.parallax.heroMaxOffset);
          shape.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;
        });

        rafId = requestAnimationFrame(loop);
      };

      const onMouseMove = rafThrottle((e) => {
        const rect = dom.heroSection.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        targetX = relX * CONFIG.parallax.heroMaxOffset;
        targetY = relY * CONFIG.parallax.heroMaxOffset;
      });

      dom.heroSection.addEventListener('mousemove', onMouseMove);
      dom.heroSection.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
      });

      rafId = requestAnimationFrame(loop);
      window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId), { once: true });
    },

    initScrollParallax() {
      if (!dom.heroSection || !dom.heroContent || prefersReducedMotion()) return;

      const onScroll = rafThrottle(() => {
        const rect = dom.heroSection.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const offset = clamp(window.scrollY * 0.15, 0, 80);
        dom.heroContent.style.setProperty('--scroll-parallax', `${offset.toFixed(2)}px`);
      });

      window.addEventListener('scroll', onScroll, { passive: true });
    },
  };

  const Typewriter = {
    phraseIndex: 0,
    charIndex: 0,
    isDeleting: false,
    timerId: null,
    cursor: null,

    start() {
      if (!dom.heroTitle) return;
      if (dom.heroTitle.dataset.typewriterOwner) return;
      dom.heroTitle.dataset.typewriterOwner = 'landing-entrance';

      if (prefersReducedMotion()) {
        dom.heroTitle.textContent = CONFIG.typewriter.phrases[0];
        return;
      }

      dom.heroTitle.textContent = '';
      dom.heroTitle.setAttribute('aria-live', 'polite');

      this.cursor = document.createElement('span');
      this.cursor.className = 'typewriter-cursor';
      this.cursor.setAttribute('aria-hidden', 'true');
      dom.heroTitle.appendChild(this.cursor);

      this.phraseIndex = 0;
      this.charIndex = 0;
      this.isDeleting = false;
      this.generation += 1;
      this.tick(this.generation);
    },

    generation: 0,

    tick(generation) {
      if (generation !== this.generation) return;

      const phrases = CONFIG.typewriter.phrases;
      const currentPhrase = phrases[this.phraseIndex];
      const visibleText = this.isDeleting
        ? currentPhrase.substring(0, this.charIndex - 1)
        : currentPhrase.substring(0, this.charIndex + 1);

      this.charIndex = visibleText.length;
      dom.heroTitle.textContent = visibleText;
      dom.heroTitle.appendChild(this.cursor);

      let delay = this.isDeleting ? CONFIG.typewriter.deleteSpeed : CONFIG.typewriter.typeSpeed;

      if (!this.isDeleting && visibleText === currentPhrase) {
        delay = CONFIG.typewriter.pauseAfterType;
        this.isDeleting = true;
      } else if (this.isDeleting && visibleText === '') {
        this.isDeleting = false;
        this.phraseIndex = (this.phraseIndex + 1) % phrases.length;
        delay = CONFIG.typewriter.pauseAfterDelete;
      }

      this.timerId = setTimeout(() => this.tick(generation), delay);
    },

    destroy() {
      this.generation += 1;
      clearTimeout(this.timerId);
      this.timerId = null;
    },
  };

  const ScrollReveal = {
    init() {
      const targets = [
        ...dom.sections,
        ...dom.featureCards,
        dom.footer,
      ].filter(Boolean);

      if (!targets.length) return;

      if (prefersReducedMotion()) {
        targets.forEach((el) => el.classList.add('is-visible'));
        return;
      }

      const cardIndexMap = new Map(dom.featureCards.map((card, index) => [card, index]));

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const staggerIndex = cardIndexMap.get(el) ?? 0;
            const delay = cardIndexMap.has(el) ? staggerIndex * CONFIG.timeline.featureCardStagger : 0;

            setTimeout(() => el.classList.add('is-visible'), delay);
            obs.unobserve(el);
          });
        },
        {
          threshold: CONFIG.reveal.threshold,
          rootMargin: CONFIG.reveal.rootMargin,
        }
      );

      targets.forEach((el) => observer.observe(el));
    },
  };

  const HoverEffects = {
    init() {
      this.initFeatureCards();
      this.initMagneticButtons();
    },

    initFeatureCards() {
      dom.featureCards.forEach((card) => {
        card.addEventListener('pointerenter', () => card.classList.add('is-hovered'));
        card.addEventListener('pointerleave', () => card.classList.remove('is-hovered'));
        card.addEventListener('focus', () => card.classList.add('is-hovered'));
        card.addEventListener('blur', () => card.classList.remove('is-hovered'));

        if (prefersReducedMotion()) return;

        card.addEventListener('pointerdown', (e) => {
          card.classList.add('is-pressed');
          this.spawnRipple(card, e.clientX, e.clientY);
        });

        ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) =>
          card.addEventListener(evt, () => card.classList.remove('is-pressed'))
        );
      });
    },

    spawnRipple(el, clientX, clientY) {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';

      const size = Math.max(rect.width, rect.height) * 1.4;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${clientX - rect.left - size / 2}px`;
      ripple.style.top = `${clientY - rect.top - size / 2}px`;

      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    },

    initMagneticButtons() {
      if (prefersReducedMotion()) return;

      const magneticTargets = [
        dom.brand,
        ...dom.ctaButtons,
        ...qsa('.right-actions .icon-btn'),
        qs('.avatar'),
      ].filter(Boolean);

      magneticTargets.forEach((el) => {
        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;
        let rafId = null;

        const loop = () => {
          currentX += (targetX - currentX) * 0.2;
          currentY += (targetY - currentY) * 0.2;
          el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

          if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
            rafId = requestAnimationFrame(loop);
          } else {
            rafId = null;
          }
        };

        el.addEventListener('pointermove', (e) => {
          const rect = el.getBoundingClientRect();
          const relX = e.clientX - (rect.left + rect.width / 2);
          const relY = e.clientY - (rect.top + rect.height / 2);
          targetX = clamp(relX * CONFIG.magnetic.strength, -CONFIG.magnetic.maxOffset, CONFIG.magnetic.maxOffset);
          targetY = clamp(relY * CONFIG.magnetic.strength, -CONFIG.magnetic.maxOffset, CONFIG.magnetic.maxOffset);
          if (!rafId) rafId = requestAnimationFrame(loop);
        });

        el.addEventListener('pointerleave', () => {
          targetX = 0;
          targetY = 0;
          if (!rafId) rafId = requestAnimationFrame(loop);
        });

        el.addEventListener('pointerdown', (e) => {
          this.spawnRipple(el, e.clientX, e.clientY);
        });
      });
    },
  };

  const Accessibility = {
    init() {
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        document.body.classList.add('keyboard-nav');
      });

      document.addEventListener('pointerdown', () => {
        document.body.classList.remove('keyboard-nav');
      });

      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        document.documentElement.classList.toggle('reduced-motion', e.matches);
      });
    },
  };

  const LandingAnimation = {
    async start() {
      HeroAnimation.splitTitle();

      await NavbarAnimation.reveal();
      await HeroAnimation.reveal();

      requestAnimationFrame(() => {
        setTimeout(() => {
          Typewriter.destroy();
          Typewriter.start();
        }, 300);
      });

      setTimeout(() => {
        dom.featureCards.forEach((card, index) => {
          setTimeout(() => card.classList.add('is-timeline-visible'), index * CONFIG.timeline.featureCardStagger);
        });
      }, CONFIG.timeline.featureCardsDelay);
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    safeInit('NavbarStickyGlass', () => NavbarAnimation.initStickyGlass());
    safeInit('NavbarLogoFloat', () => NavbarAnimation.initLogoFloat());
    safeInit('HeroParallax', () => HeroAnimation.initParallax());
    safeInit('HeroScrollParallax', () => HeroAnimation.initScrollParallax());
    safeInit('ScrollReveal', () => ScrollReveal.init());
    safeInit('HoverEffects', () => HoverEffects.init());
    safeInit('Accessibility', () => Accessibility.init());

    safeInit('LoaderManager', () => {
      LoaderManager.init(() => {
        safeInit('LandingAnimation', () => LandingAnimation.start());
      });
    });
  });

  window.addEventListener('beforeunload', () => {
    Typewriter.destroy();
  });
})();