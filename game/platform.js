(function () {
  'use strict';

  const host = window.location.hostname.toLowerCase();
  const referrer = document.referrer.toLowerCase();
  const isCrazyGames = Boolean(
    window.CrazyGames ||
    host.endsWith('crazygames.com') ||
    referrer.includes('crazygames.com')
  );
  const state = {
    isCrazyGames,
    adsenseEnabled: !isCrazyGames,
    crazyGamesReady: false
  };

  function loadScript(src, attributes) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        if (existing.dataset.loaded === 'true') resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      Object.entries(attributes || {}).forEach(([key, value]) => script.setAttribute(key, value));
      script.addEventListener('load', () => { script.dataset.loaded = 'true'; resolve(); }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  function loadAdSense() {
    return loadScript(
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5434814440343034',
      { async: '', crossorigin: 'anonymous' }
    ).catch(() => undefined);
  }

  function loadCrazyGames() {
    if (window.CrazyGames) return Promise.resolve(window.CrazyGames);
    return loadScript('https://sdk.crazygames.com/crazygames-sdk-v3.js')
      .then(() => window.CrazyGames || null)
      .catch(() => null);
  }

  const ready = isCrazyGames ? loadCrazyGames().then(api => {
    state.crazyGamesReady = Boolean(api);
    return api;
  }) : loadAdSense();

  window.forestBrawlPlatform = {
    state,
    ready,
    async showMidgameAd() {
      if (!isCrazyGames) return false;
      const api = await ready;
      const ad = api && api.SDK && api.SDK.ad;
      if (!ad || typeof ad.requestAd !== 'function') return false;
      try {
        await ad.requestAd('midgame');
        return true;
      } catch (error) {
        return false;
      }
    }
  };
})();
