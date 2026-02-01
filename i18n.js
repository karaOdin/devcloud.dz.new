(function () {
  'use strict';

  var cache = {};
  var currentLang = 'en';
  var currentTranslations = {};

  function resolve(obj, key) {
    return key.split('.').reduce(function (acc, part) {
      return acc && acc[part] !== undefined ? acc[part] : null;
    }, obj);
  }

  function detectLang() {
    var stored = localStorage.getItem('lang');
    if (stored && ['en', 'fr', 'ar'].indexOf(stored) !== -1) {
      return stored;
    }
    var nav = (navigator.language || '').toLowerCase().split('-')[0];
    if (nav === 'fr') return 'fr';
    if (nav === 'ar') return 'ar';
    return 'en';
  }

  function applyTranslations(translations) {
    currentTranslations = translations;

    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      var val = resolve(translations, key);
      if (val !== null) {
        els[i].innerHTML = val;
      }
    }

    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    for (var i = 0; i < placeholders.length; i++) {
      var key = placeholders[i].getAttribute('data-i18n-placeholder');
      var val = resolve(translations, key);
      if (val !== null) {
        placeholders[i].setAttribute('placeholder', val);
      }
    }

    var contents = document.querySelectorAll('[data-i18n-content]');
    for (var i = 0; i < contents.length; i++) {
      var key = contents[i].getAttribute('data-i18n-content');
      var val = resolve(translations, key);
      if (val !== null) {
        contents[i].setAttribute('content', val);
      }
    }

    var titleEls = document.querySelectorAll('[data-i18n-title]');
    for (var i = 0; i < titleEls.length; i++) {
      var key = titleEls[i].getAttribute('data-i18n-title');
      var val = resolve(translations, key);
      if (val !== null) {
        document.title = val;
      }
    }

    var buttons = document.querySelectorAll('[data-lang]');
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('data-lang') === currentLang) {
        buttons[i].classList.add('active');
      } else {
        buttons[i].classList.remove('active');
      }
    }
  }

  function loadLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    if (cache[lang]) {
      applyTranslations(cache[lang]);
      return Promise.resolve();
    }

    return fetch('i18n/' + lang + '.json')
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        cache[lang] = data;
        applyTranslations(data);
      });
  }

  function bindSwitcher() {
    var buttons = document.querySelectorAll('[data-lang]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var lang = this.getAttribute('data-lang');
        if (lang && ['en', 'fr', 'ar'].indexOf(lang) !== -1) {
          loadLang(lang);
        }
      });
    }
  }

  window.DevCloudI18n = {
    switchLang: function (lang) {
      if (['en', 'fr', 'ar'].indexOf(lang) !== -1) {
        loadLang(lang);
      }
    },
    getLang: function () {
      return currentLang;
    },
    t: function (key) {
      var val = resolve(currentTranslations, key);
      return val !== null ? val : key;
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindSwitcher();
    loadLang(detectLang());
  });
})();
