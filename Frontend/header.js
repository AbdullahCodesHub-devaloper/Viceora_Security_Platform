
(() => {
  'use strict';

  const CONFIG = {
    stickyOffset: 40,        
    scrollDebounce: 10,      
    resizeDebounce: 150,     
    mobileBreakpoint: 900,  
    scrollSpyOffset: 0.35,   
  };

  

  const debounce = (fn, delay) => {
    let timerId;
    return (...args) => {
      clearTimeout(timerId);
      timerId = setTimeout(() => fn.apply(null, args), delay);
    };
  };


  const rafThrottle = (fn) => {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn.apply(null, args);
        ticking = false;
      });
    };
  };


  const qs = (selector, scope = document) => {
    const el = scope.querySelector(selector);
    if (!el) console.warn(`[Navbar] Element not found: ${selector}`);
    return el;
  };

  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));


  const getFocusable = (container) =>
    qsa(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container
    );


  const dom = {
    pageLoader: qs('.page-loader'),
    navbar: qs('.navbar'),
    navContainer: qs('.nav-container'),
    mainNav: qs('#mainNav'),
    navLinks: qsa('#mainNav a'),
    menuToggle: qs('#menuToggle'),
    navOverlay: qs('#navOverlay'),

    searchToggle: qs('#searchToggle'),
    searchPopup: qs('#searchPopup'),
    searchInput: qs('#searchInput'),
    searchClose: qs('#searchClose'),

    notifToggle: qs('#notifToggle'),
    notifDropdown: qs('#notifDropdown'),
    notifList: qs('#notifList'),
    notifBadge: qs('#notifBadge'),

    avatarToggle: qs('#avatarToggle'),
    avatarDropdown: qs('#avatarDropdown'),
  };


  const PageLoader = {
    minDisplayMs: 400,

    init() {
      if (!dom.pageLoader) return;
      const startTime = performance.now();

      const hide = () => {
        const elapsed = performance.now() - startTime;
        const wait = Math.max(0, this.minDisplayMs - elapsed);
        setTimeout(() => {
          dom.pageLoader.classList.add('is-hidden'); // CSS: opacity/visibility transition

          dom.pageLoader.addEventListener(
            'transitionend',
            () => dom.pageLoader.remove(),
            { once: true }
          );
          // Fallback in case the CSS has no transition defined.
          setTimeout(() => dom.pageLoader.remove(), 600);
        }, wait);
      };

      if (document.readyState === 'complete') {
        hide();
      } else {
        window.addEventListener('load', hide, { once: true });
      }
    },
  };

  const MobileMenu = {
    isOpen: false,

    init() {
      if (!dom.menuToggle || !dom.mainNav) return;

      dom.menuToggle.addEventListener('click', () => this.toggle());

      // Event delegation: one listener for all nav links instead of one each.
      dom.mainNav.addEventListener('click', (e) => {
        if (e.target.closest('a')) this.close();
      });

      dom.navOverlay?.addEventListener('click', () => this.close());

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });


      window.addEventListener(
        'resize',
        debounce(() => {
          if (this.isOpen && window.innerWidth > CONFIG.mobileBreakpoint) this.close();
        }, CONFIG.resizeDebounce)
      );
    },

    toggle() {
      this.isOpen ? this.close() : this.open();
    },

    open() {
      this.isOpen = true;
      dom.mainNav.classList.add('is-open');
      dom.menuToggle.classList.add('is-active'); // CSS turns the 3 spans into an X
      dom.navOverlay?.removeAttribute('hidden');
      requestAnimationFrame(() => dom.navOverlay?.classList.add('is-visible'));

      dom.menuToggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll'); // CSS: overflow: hidden


      getFocusable(dom.mainNav)[0]?.focus();
    },

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      dom.mainNav.classList.remove('is-open');
      dom.menuToggle.classList.remove('is-active');
      dom.navOverlay?.classList.remove('is-visible');
      dom.menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');

      // Wait for the close animation before hiding the overlay from the a11y tree.
      setTimeout(() => dom.navOverlay?.setAttribute('hidden', ''), 300);
    },
  };


  const StickyNavbar = {
    init() {
      if (!dom.navbar) return;
      const onScroll = rafThrottle(() => {
        const scrolled = window.scrollY > CONFIG.stickyOffset;
        dom.navbar.classList.toggle('is-scrolled', scrolled);
      });
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll(); // set correct state on initial load (e.g. page opened mid-scroll)
    },
  };

  const SmoothScroll = {
    init() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href');
        if (targetId === '#' || targetId.length < 2) return;

        const target = document.querySelector(targetId);
        if (!target) return; // let the browser handle links to nonexistent IDs

        e.preventDefault();
        const navHeight = dom.navbar?.offsetHeight ?? 0;
        const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({ top: targetY, behavior: 'smooth' });

        // Update the URL hash without an extra jump/scroll.
        history.pushState(null, '', targetId);

        // Keyboard users: move focus to the target section for accessibility.
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    },
  };


  const ScrollSpy = {
    init() {
      const sections = dom.navLinks
        .map((link) => {
          const id = link.getAttribute('href');
          return id?.startsWith('#') ? document.querySelector(id) : null;
        })
        .filter(Boolean);

      if (!sections.length) return; // nothing to observe on this page

      const linkFor = (id) => dom.navLinks.find((l) => l.getAttribute('href') === `#${id}`);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const link = linkFor(entry.target.id);
            if (!link) return;
            if (entry.isIntersecting) {
              dom.navLinks.forEach((l) => l.classList.remove('is-active'));
              link.classList.add('is-active');
            }
          });
        },
        {

          rootMargin: `-${(dom.navbar?.offsetHeight ?? 0) + 10}px 0px -${
            100 - CONFIG.scrollSpyOffset * 100
          }% 0px`,
          threshold: 0,
        }
      );

      sections.forEach((section) => observer.observe(section));
    },
  };

  
  const createPopover = ({ toggleBtn, panel, onOpen, onClose, trapFocus = true }) => {
    if (!toggleBtn || !panel) return null;
    let isOpen = false;

    const open = () => {
      isOpen = true;
      panel.removeAttribute('hidden');
      requestAnimationFrame(() => panel.classList.add('is-visible'));
      toggleBtn.setAttribute('aria-expanded', 'true');
      onOpen?.();
      if (trapFocus) getFocusable(panel)[0]?.focus();
    };

    const close = ({ restoreFocus = false } = {}) => {
      if (!isOpen) return;
      isOpen = false;
      panel.classList.remove('is-visible');
      toggleBtn.setAttribute('aria-expanded', 'false');
      onClose?.();
      setTimeout(() => panel.setAttribute('hidden', ''), 200); // matches CSS transition
      if (restoreFocus) toggleBtn.focus();
    };

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen ? close() : open();
    });

    
    document.addEventListener('click', (e) => {
      if (isOpen && !panel.contains(e.target) && !toggleBtn.contains(e.target)) {
        close();
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close({ restoreFocus: true });
    });

    return { open, close, isOpen: () => isOpen };
  };


  const Search = {
    init() {
      const popover = createPopover({
        toggleBtn: dom.searchToggle,
        panel: dom.searchPopup,
        onOpen: () => dom.searchInput?.focus(),
        onClose: () => {
          if (dom.searchInput) dom.searchInput.value = '';
        },
      });
      if (!popover) return;

      dom.searchClose?.addEventListener('click', () => popover.close({ restoreFocus: true }));

 
      dom.searchInput?.addEventListener(
        'input',
        debounce((e) => {
          const query = e.target.value.trim();
          if (!query) return;

          console.log('[Search] query:', query);
        }, 300)
      );

      dom.searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = dom.searchInput.value.trim();
          if (query) console.log('[Search] submit:', query); 
        }
      });
    },
  };

  const Notifications = {
    popover: null,

    init() {
      this.popover = createPopover({
        toggleBtn: dom.notifToggle,
        panel: dom.notifDropdown,
        trapFocus: false, // dropdown is read-mostly; don't yank focus off the page
      });
      if (!this.popover) return;

      this.renderNotifications(this.fetchNotifications());
    },


     
    fetchNotifications() {
      return []; 
    },

    renderNotifications(items) {
      if (!dom.notifList) return;

      if (!items.length) {
        dom.notifList.innerHTML = '<li class="notif-empty">No new notifications</li>';
        this.updateBadge(0);
        return;
      }

     
      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        const li = document.createElement('li');
        li.className = `notif-item${item.read ? '' : ' is-unread'}`;
        li.innerHTML = `
          <span class="notif-title">${item.title}</span>
          <span class="notif-time">${item.time}</span>
        `;
        fragment.appendChild(li);
      });
      dom.notifList.replaceChildren(fragment);

      this.updateBadge(items.filter((i) => !i.read).length);
    },

    updateBadge(count) {
      if (!dom.notifBadge) return;
      if (count > 0) {
        dom.notifBadge.textContent = count > 9 ? '9+' : String(count);
        dom.notifBadge.hidden = false;
      } else {
        dom.notifBadge.hidden = true;
      }
    },
  };
  const AvatarMenu = {
    init() {
      const popover = createPopover({
        toggleBtn: dom.avatarToggle,
        panel: dom.avatarDropdown,
      });
      if (!popover) return;

      // Close the dropdown after any menu item click (delegated).
      dom.avatarDropdown.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) popover.close();
      });

      qs('#logoutBtn')?.addEventListener('click', () => {

        console.log('[Auth] logout requested');
      });
    },
  };

  const safeInit = (name, fn) => {
    try {
      fn();
    } catch (err) {
      console.error(`[Navbar] "${name}" failed to initialize:`, err);
    }
  };


  const FEATURES = [
    ['PageLoader', PageLoader],
    ['MobileMenu', MobileMenu],
    ['StickyNavbar', StickyNavbar],
    ['SmoothScroll', SmoothScroll],
    ['ScrollSpy', ScrollSpy],
    ['Search', Search],
    ['Notifications', Notifications],
    ['AvatarMenu', AvatarMenu],
  ];

  document.addEventListener('DOMContentLoaded', () => {
    FEATURES.forEach(([name, module]) => safeInit(name, () => module.init()));
  });
})();
