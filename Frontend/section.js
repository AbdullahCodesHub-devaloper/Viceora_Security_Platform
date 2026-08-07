
 // * ===========================//
 // Alert Javascript of Section Html//
// * ===========================//


(() => {
  'use strict';

  const CONFIG = {
    typewriter: {
      phrases: [
        'AI-Powered Enterprise Security',
        'Face Recognition Technology',
        'Intelligent Surveillance',
        'Smart Threat Detection',
        'Real-Time AI Monitoring',
        'Secure Your Future',
      ],
      typeSpeed: 55,
      deleteSpeed: 30,
      pauseAfterType: 1800,
      pauseAfterDelete: 400,
    },
    reveal: {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px',
      staggerMs: 90,
      once: true,
    },
    parallax: {
      maxOffsetPx: 14,
      ease: 0.08,
    },
    lowPowerCores: 4,
  };

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isTouchDevice = () =>
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const isLowPowerDevice = () =>
    (navigator.hardwareConcurrency ?? 8) < CONFIG.lowPowerCores ||
    navigator.connection?.saveData === true;

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

  const dom = {
    heroSection: qs('#home'),
    heroContent: qs('.hero-content'),
    heroHeading: qs('.animated-text'),
    heroParagraph: qs('.hero-content p'),
    featureCards: qsa('.feature-card'),
  };

  const safeInit = (name, fn) => {
    try {
      fn();
    } catch (err) {
      console.error(`[${name}] init failed:`, err);
    }
  };

  const HeroAnimation = {
    init() {
      if (!dom.heroHeading || !dom.heroParagraph) return;
      if (prefersReducedMotion()) {
        dom.heroHeading.classList.add('is-visible');
        dom.heroParagraph.classList.add('is-visible');
        return;
      }

      dom.heroHeading.classList.add('hero-anim-init');
      dom.heroParagraph.classList.add('hero-anim-init');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          dom.heroHeading.classList.add('is-visible');
          setTimeout(() => dom.heroParagraph.classList.add('is-visible'), 250);
        });
      });
    },
  };

  const TypewriterEffect = {
    element: null,
    phrases: [],
    phraseIndex: 0,
    charIndex: 0,
    isDeleting: false,
    timerId: null,

    init() {
      this.element = dom.heroHeading;
      if (!this.element) return;

      this.phrases = CONFIG.typewriter.phrases;

      if (prefersReducedMotion()) {
        this.element.textContent = this.phrases[0];
        return;
      }

      this.element.setAttribute('aria-live', 'polite');
      this.element.textContent = '';

      this.cursor = document.createElement('span');
      this.cursor.className = 'typewriter-cursor';
      this.cursor.setAttribute('aria-hidden', 'true');
      this.element.appendChild(this.cursor);

      this.tick();
    },

    tick() {
      const currentPhrase = this.phrases[this.phraseIndex];
      const visibleText = this.isDeleting
        ? currentPhrase.substring(0, this.charIndex - 1)
        : currentPhrase.substring(0, this.charIndex + 1);

      this.charIndex = visibleText.length;
      this.element.textContent = visibleText;
      this.element.appendChild(this.cursor);

      let delay = this.isDeleting
        ? CONFIG.typewriter.deleteSpeed
        : CONFIG.typewriter.typeSpeed;

      if (!this.isDeleting && visibleText === currentPhrase) {
        delay = CONFIG.typewriter.pauseAfterType;
        this.isDeleting = true;
      } else if (this.isDeleting && visibleText === '') {
        this.isDeleting = false;
        this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
        delay = CONFIG.typewriter.pauseAfterDelete;
      }

      this.timerId = setTimeout(() => this.tick(), delay);
    },

    destroy() {
      clearTimeout(this.timerId);
    },
  };

  const ScrollReveal = {
    init() {
      if (!dom.featureCards.length) return;

      if (prefersReducedMotion()) {
        dom.featureCards.forEach((card) => card.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const card = entry.target;
            const index = dom.featureCards.indexOf(card);
            const delay = Math.max(0, index) * CONFIG.reveal.staggerMs;

            setTimeout(() => card.classList.add('is-visible'), delay);

            if (CONFIG.reveal.once) obs.unobserve(card);
          });
        },
        {
          threshold: CONFIG.reveal.threshold,
          rootMargin: CONFIG.reveal.rootMargin,
        }
      );

      dom.featureCards.forEach((card) => observer.observe(card));
    },
  };

  const RippleEffect = {
    attach(card) {
      const spawnRipple = (x, y) => {
        const rect = card.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'card-ripple';

        const size = Math.max(rect.width, rect.height) * 1.4;
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x - rect.left - size / 2}px`;
        ripple.style.top = `${y - rect.top - size / 2}px`;

        card.appendChild(ripple);
        ripple.addEventListener(
          'animationend',
          () => ripple.remove(),
          { once: true }
        );
      };

      card.addEventListener('pointerdown', (e) => {
        card.classList.add('is-pressed');
        spawnRipple(e.clientX, e.clientY);
      });

      ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) =>
        card.addEventListener(evt, () => card.classList.remove('is-pressed'))
      );
    },
  };

  const FeatureCards = {
    init() {
      if (!dom.featureCards.length) return;

      dom.featureCards.forEach((card) => {
        const icon = qs('.icon', card);

        card.addEventListener('pointerenter', () => {
          card.classList.add('is-hovered');
          icon?.classList.add('icon-active');
        });

        card.addEventListener('pointerleave', () => {
          card.classList.remove('is-hovered');
          icon?.classList.remove('icon-active');
        });

        card.addEventListener('focus', () => card.classList.add('is-hovered'));
        card.addEventListener('blur', () => card.classList.remove('is-hovered'));

        if (!isLowPowerDevice() && !prefersReducedMotion()) {
          RippleEffect.attach(card);
        }
      });
    },
  };

  const ParallaxEffect = {
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    rafId: null,

    init() {
      if (
        !dom.heroSection ||
        !dom.heroContent ||
        isTouchDevice() ||
        isLowPowerDevice() ||
        prefersReducedMotion()
      ) {
        return;
      }

      dom.heroContent.style.willChange = 'transform';

      const onMouseMove = rafThrottle((e) => {
        const rect = dom.heroSection.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;

        this.targetX = relX * CONFIG.parallax.maxOffsetPx;
        this.targetY = relY * CONFIG.parallax.maxOffsetPx;
      });

      dom.heroSection.addEventListener('mousemove', onMouseMove);
      dom.heroSection.addEventListener('mouseleave', () => {
        this.targetX = 0;
        this.targetY = 0;
      });

      this.loop();
    },

    loop() {
      this.currentX += (this.targetX - this.currentX) * CONFIG.parallax.ease;
      this.currentY += (this.targetY - this.currentY) * CONFIG.parallax.ease;

      dom.heroContent.style.transform =
        `translate3d(${this.currentX.toFixed(2)}px, ${this.currentY.toFixed(2)}px, 0)`;

      this.rafId = requestAnimationFrame(() => this.loop());
    },

    destroy() {
      cancelAnimationFrame(this.rafId);
    },
  };

  const Counters = {
    init() {
      const counterEls = qsa('[data-counter]');
      if (!counterEls.length) return;

      const animateCounter = (el) => {
        const target = parseFloat(el.dataset.counter);
        const duration = parseInt(el.dataset.counterDuration ?? '1200', 10);
        const startTime = performance.now();

        const step = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
      };

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.4 }
      );

      counterEls.forEach((el) => observer.observe(el));
    },
  };

  const FEATURES = [
    ['HeroAnimation', HeroAnimation],
    ['TypewriterEffect', TypewriterEffect],
    ['ScrollReveal', ScrollReveal],
    ['FeatureCards', FeatureCards],
    ['ParallaxEffect', ParallaxEffect],
    ['Counters', Counters],
  ];

  document.addEventListener('DOMContentLoaded', () => {
    FEATURES.forEach(([name, module]) => safeInit(name, () => module.init()));
  });

  window.addEventListener('beforeunload', () => {
    TypewriterEffect.destroy();
    ParallaxEffect.destroy();
  });
})();

