(function() {
  "use strict";

  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  function mobileNavToggle() {
    const body = document.querySelector('body');
    const btn = document.querySelector('.mobile-nav-toggle');
    if (!body || !btn) return;
    body.classList.toggle('mobile-nav-active');
    btn.classList.toggle('bi-list');
    btn.classList.toggle('bi-x');
  }

  document.body.addEventListener('click', function(e) {
    if (e.target.closest('.mobile-nav-toggle')) {
      mobileNavToggle();
      return;
    }
    if (e.target.closest('#navmenu a') && document.querySelector('.mobile-nav-active')) {
      mobileNavToggle();
    }
  });

  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  const preloader = document.querySelector('#preloader');
  if (preloader) {
    const removePreloader = () => preloader.remove();
    const fallbackTimeout = setTimeout(removePreloader, 6000);
    if (document.readyState === 'complete') {
      clearTimeout(fallbackTimeout);
      removePreloader();
    } else {
      window.addEventListener('load', () => {
        clearTimeout(fallbackTimeout);
        removePreloader();
      });
    }
  }

  const scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  function aosInit() {
    if (typeof AOS === "undefined") return;
  }
  window.addEventListener('load', aosInit);

})();
