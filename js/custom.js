
  (function ($) {
  
  "use strict";

    // NAVBAR
    $('.navbar-nav .nav-link').click(function(){
        $(".navbar-collapse").collapse('hide');
    });
    
    // THEME TOGGLE
    function applyTheme(theme) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        updateToggleButtons(true);
      } else {
        document.documentElement.classList.remove('dark-mode');
        updateToggleButtons(false);
      }
    }

    function updateToggleButtons(isDark) {
      var btns = [document.getElementById('themeToggle'), document.getElementById('themeToggleMobile')];
      btns.forEach(function(btn){
        if (!btn) return;
        btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        btn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        btn.classList.toggle('btn-dark', !isDark);
        btn.classList.toggle('btn-light', isDark);
      });
    }

    function initTheme() {
      var saved = localStorage.getItem('theme');
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = saved || (prefersDark ? 'dark' : 'light');
      applyTheme(theme);
    }

    function toggleTheme() {
      var isDark = document.documentElement.classList.contains('dark-mode');
      var next = isDark ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
    }

    document.addEventListener('DOMContentLoaded', function(){
      initTheme();
      var t1 = document.getElementById('themeToggle');
      var t2 = document.getElementById('themeToggleMobile');
      if (t1) t1.addEventListener('click', toggleTheme);
      if (t2) t2.addEventListener('click', toggleTheme);

      // Ensure background music exists on all pages and plays
      var audio = document.querySelector('audio[data-site-bgm]');
      if (!audio) {
        audio = document.createElement('audio');
        audio.setAttribute('data-site-bgm', 'true');
        audio.setAttribute('playsinline', 'true');
        audio.src = 'audio/Soul Kitchen.mp3';
        audio.loop = true;
        audio.preload = 'auto';
        document.body.appendChild(audio);
      }

      // Restore position and state
      var savedTime = parseFloat(localStorage.getItem('bgm_time') || '0');
      if (Number.isFinite(savedTime) && savedTime > 0) {
        try { audio.currentTime = savedTime; } catch (e) {}
      }
      var wasPlaying = localStorage.getItem('bgm_playing') === '1';

      function tryPlay() {
        if (!audio) return;
        var playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(function(){
            // wait for a user gesture
            var once = function() {
              audio.play().finally(function(){
                window.removeEventListener('click', once);
                window.removeEventListener('touchstart', once);
                window.removeEventListener('keydown', once);
              });
            };
            window.addEventListener('click', once, { once: true });
            window.addEventListener('touchstart', once, { once: true });
            window.addEventListener('keydown', once, { once: true });
          });
        }
      }

      // Persist currentTime (throttled)
      var lastSaved = 0;
      audio.addEventListener('timeupdate', function(){
        var t = audio.currentTime | 0; // seconds precision
        if (t !== lastSaved) {
          lastSaved = t;
          localStorage.setItem('bgm_time', String(t));
        }
      });
      audio.addEventListener('play', function(){
        localStorage.setItem('bgm_playing', '1');
      });
      audio.addEventListener('pause', function(){
        localStorage.setItem('bgm_playing', '0');
        localStorage.setItem('bgm_time', String(Math.floor(audio.currentTime || 0)));
      });
      window.addEventListener('beforeunload', function(){
        localStorage.setItem('bgm_time', String(Math.floor(audio.currentTime || 0)));
        localStorage.setItem('bgm_playing', audio.paused ? '0' : '1');
      });

      // Always attempt to start; if blocked, gesture listeners in tryPlay() will handle it.
      // If previously playing, this resumes immediately; otherwise it will still wait for a gesture due to autoplay policy.
      tryPlay();
    });
    
  })(window.jQuery);