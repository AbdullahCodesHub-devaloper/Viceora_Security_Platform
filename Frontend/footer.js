

// Alert Javascript of Footer Html//
//============================//




(() => {
  'use strict';

  const CONFIG = {
    reveal: {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px',
      columnStaggerMs: 120,
    },
    magnetic: {
      strength: 0.35,
      maxOffset: 14,
    },
    toast: {
      durationMs: 2400,
    },
    backToTop: {
      showAfterPx: 400,
    },
    scrollProgress: {
      height: '3px',
    },
  };

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    footer: qs('.footer'),
    footerBrand: qs('.footer-brand'),
    footerColumns: qsa('.footer-column'),
    footerBottom: qs('.footer-bottom'),
    footerLogo: qs('.footer-logo'),
    socialLinks: qsa('.social-links a'),
    backToTop: qs('.back-to-top'),
    copyrightParagraph: qs('.footer-bottom p'),
  };

  const Utilities = {
    createToastContainer() {
      let container = qs('.toast-container');
      if (container) return container;
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
      return container;
    },

    showToast(message) {
      const container = this.createToastContainer();
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      container.appendChild(toast);

      requestAnimationFrame(() => toast.classList.add('is-visible'));

      setTimeout(() => {
        toast.classList.remove('is-visible');
        toast.addEventListener(
          'transitionend',
          () => toast.remove(),
          { once: true }
        );
        setTimeout(() => toast.remove(), 500);
      }, CONFIG.toast.durationMs);
    },
  };

  const FooterReveal = {
    init() {
      if (!dom.footer) return;

      if (prefersReducedMotion()) {
        dom.footer.classList.add('is-visible');
        return;
      }

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            dom.footer.classList.add('is-visible');
            this.revealColumns();
            obs.disconnect();
          });
        },
        {
          threshold: CONFIG.reveal.threshold,
          rootMargin: CONFIG.reveal.rootMargin,
        }
      );

      observer.observe(dom.footer);
    },

    revealColumns() {
      const sequence = [dom.footerBrand, ...dom.footerColumns, dom.footerBottom].filter(Boolean);
      sequence.forEach((column, index) => {
        setTimeout(() => {
          column.classList.add('is-visible');
        }, index * CONFIG.reveal.columnStaggerMs);
      });
    },
  };

  const FooterLinks = {
    init() {
      const links = qsa('.footer-column a, .footer-bottom a');
      links.forEach((link) => this.enhance(link));
    },

    enhance(link) {
      link.classList.add('footer-link-enhanced');

      link.addEventListener('pointerenter', () => {
        link.classList.add('is-hovered');
      });

      link.addEventListener('pointerleave', () => {
        link.classList.remove('is-hovered');
      });

      link.addEventListener('focus', () => {
        link.classList.add('is-hovered');
      });

      link.addEventListener('blur', () => {
        link.classList.remove('is-hovered');
      });
    },
  };

  const MagneticEffect = {
    init() {
      if (prefersReducedMotion()) return;

      const targets = [
        dom.footerLogo,
        dom.backToTop,
        ...dom.socialLinks,
        ...qsa('.footer-column a'),
      ].filter(Boolean);

      targets.forEach((el) => this.attach(el));
    },

    attach(el) {
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

      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);

        targetX = Math.max(
          -CONFIG.magnetic.maxOffset,
          Math.min(CONFIG.magnetic.maxOffset, relX * CONFIG.magnetic.strength)
        );
        targetY = Math.max(
          -CONFIG.magnetic.maxOffset,
          Math.min(CONFIG.magnetic.maxOffset, relY * CONFIG.magnetic.strength)
        );

        if (!rafId) rafId = requestAnimationFrame(loop);
      };

      const onLeave = () => {
        targetX = 0;
        targetY = 0;
        if (!rafId) rafId = requestAnimationFrame(loop);
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
    },
  };

  const SocialAnimations = {
    init() {
      dom.socialLinks.forEach((link) => this.attach(link));
    },

    attach(link) {
      link.classList.add('social-link-enhanced');

      link.addEventListener('pointerdown', (e) => {
        link.classList.add('is-pressed');
        this.spawnRipple(link, e.clientX, e.clientY);
      });

      ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) =>
        link.addEventListener(evt, () => link.classList.remove('is-pressed'))
      );

      link.addEventListener('pointerenter', () => link.classList.add('is-hovered'));
      link.addEventListener('pointerleave', () => link.classList.remove('is-hovered'));
    },

    spawnRipple(link, clientX, clientY) {
      if (prefersReducedMotion()) return;

      const rect = link.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'social-ripple';

      const size = Math.max(rect.width, rect.height) * 1.6;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${clientX - rect.left - size / 2}px`;
      ripple.style.top = `${clientY - rect.top - size / 2}px`;

      link.appendChild(ripple);
      ripple.addEventListener(
        'animationend',
        () => ripple.remove(),
        { once: true }
      );
    },
  };

  const CopyManager = {
    init() {
      dom.footerColumns.forEach((column) => {
        const paragraphs = qsa('p', column);
        paragraphs.forEach((p) => this.evaluate(p));
      });
    },

    evaluate(paragraph) {
      const text = paragraph.textContent.trim();
      const emailPattern = /[^\s]+@[^\s]+\.[^\s]+/;
      const phonePattern = /\+?\d[\d\s-]{7,}\d/;

      if (emailPattern.test(text)) {
        this.makeCopyable(paragraph, text, 'Email copied to clipboard');
      } else if (phonePattern.test(text)) {
        this.makeCopyable(paragraph, text, 'Phone number copied to clipboard');
      }
    },

    makeCopyable(paragraph, value, successMessage) {
      paragraph.classList.add('copyable');
      paragraph.setAttribute('tabindex', '0');
      paragraph.setAttribute('role', 'button');
      paragraph.setAttribute('aria-label', `Copy ${value}`);

      const trigger = () => this.copy(paragraph, value, successMessage);

      paragraph.addEventListener('click', trigger);
      paragraph.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger();
        }
      });
    },

    async copy(paragraph, value, successMessage) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = value;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          document.execCommand('copy');
          textarea.remove();
        }

        paragraph.classList.add('is-copied');
        setTimeout(() => paragraph.classList.remove('is-copied'), 1500);
        Utilities.showToast(successMessage);
      } catch (err) {
        void err;
        Utilities.showToast('Unable to copy — please copy manually');
      }
    },
  };

  const BackToTop = {
    button: null,
    isVisible: false,

    init() {
      this.button = dom.backToTop;
      if (!this.button) return;

      this.button.classList.add('back-to-top-enhanced');
      this.button.setAttribute('aria-hidden', 'true');
      this.button.tabIndex = -1;

      const onScroll = rafThrottle(() => this.evaluateVisibility());
      window.addEventListener('scroll', onScroll, { passive: true });
      this.evaluateVisibility();

      this.button.addEventListener('click', () => this.scrollToTop());
      this.button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.scrollToTop();
        }
      });
    },

    evaluateVisibility() {
      const shouldShow = window.scrollY > CONFIG.backToTop.showAfterPx;
      if (shouldShow === this.isVisible) return;

      this.isVisible = shouldShow;
      this.button.classList.toggle('is-visible', shouldShow);
      this.button.setAttribute('aria-hidden', String(!shouldShow));
      this.button.tabIndex = shouldShow ? 0 : -1;
    },

    scrollToTop() {
      if (prefersReducedMotion()) {
        window.scrollTo(0, 0);
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  };

  const ScrollProgress = {
    bar: null,

    init() {
      this.bar = document.createElement('div');
      this.bar.className = 'scroll-progress-bar';
      this.bar.style.height = CONFIG.scrollProgress.height;
      document.body.appendChild(this.bar);

      const onScroll = rafThrottle(() => this.update());
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', debounce(() => this.update(), 150));
      this.update();
    },

    update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      this.bar.style.width = `${progress}%`;
    },
  };

  const FooterParallax = {
    init() {
      if (!dom.footer || !dom.footerLogo || prefersReducedMotion()) return;

      const onScroll = rafThrottle(() => this.update());
      window.addEventListener('scroll', onScroll, { passive: true });
    },

    update() {
      const rect = dom.footer.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;

      const progress = 1 - rect.top / window.innerHeight;
      const offset = Math.max(-10, Math.min(10, progress * 10));
      dom.footerLogo.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    },
  };

  const DynamicYear = {
    init() {
      if (!dom.copyrightParagraph) return;
      const currentYear = new Date().getFullYear();
      dom.copyrightParagraph.textContent = dom.copyrightParagraph.textContent.replace(
        /\d{4}/,
        String(currentYear)
      );
    },
  };

  const GreetingManager = {
    init() {
      if (!dom.footerBrand) return;

      const hour = new Date().getHours();
      let greeting;

      if (hour < 12) {
        greeting = 'Good Morning';
      } else if (hour < 18) {
        greeting = 'Good Afternoon';
      } else {
        greeting = 'Good Evening';
      }

      const greetingEl = document.createElement('p');
      greetingEl.className = 'footer-greeting';
      greetingEl.textContent = greeting;
      greetingEl.setAttribute('aria-live', 'polite');

      dom.footerBrand.insertBefore(greetingEl, dom.footerBrand.firstChild);

      if (!prefersReducedMotion()) {
        requestAnimationFrame(() => greetingEl.classList.add('is-visible'));
      } else {
        greetingEl.classList.add('is-visible');
      }
    },
  };

  const Accessibility = {
    init() {
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const activeToast = qs('.toast.is-visible');
        if (activeToast) activeToast.classList.remove('is-visible');
      });

      qsa('.footer a, .back-to-top').forEach((el) => {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && el.tagName === 'BUTTON') {
            el.click();
          }
        });
      });
    },
  };

  const FEATURES = [
    ['DynamicYear', DynamicYear],
    ['GreetingManager', GreetingManager],
    ['FooterReveal', FooterReveal],
    ['FooterLinks', FooterLinks],
    ['MagneticEffect', MagneticEffect],
    ['SocialAnimations', SocialAnimations],
    ['CopyManager', CopyManager],
    ['BackToTop', BackToTop],
    ['ScrollProgress', ScrollProgress],
    ['FooterParallax', FooterParallax],
    ['Accessibility', Accessibility],
  ];

  document.addEventListener('DOMContentLoaded', () => {
    FEATURES.forEach(([name, module]) => safeInit(name, () => module.init()));
  });
})();

