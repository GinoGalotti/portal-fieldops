(function () {
  // Inject an invisible tap/click zone covering the top-right corner.
  // Double-tap or double-click it to toggle all keeper sections.
  var trigger = document.createElement('div');
  trigger.id = 'keeper-trigger';
  document.body.appendChild(trigger);

  var unlocked = false;
  var lastTap  = 0;

  function toggleKeeper() {
    unlocked = !unlocked;

    document.querySelectorAll('.arc-keeper').forEach(function (el) {
      el.classList.toggle('blurred', !unlocked);
    });

    document.querySelectorAll('.blur-notice').forEach(function (el) {
      el.style.display = unlocked ? 'none' : '';
    });

    trigger.classList.toggle('unlocked', unlocked);
  }

  // Desktop: double-click
  trigger.addEventListener('dblclick', function (e) {
    e.preventDefault();
    toggleKeeper();
  });

  // Mobile: double-tap (two taps within 350 ms)
  trigger.addEventListener('touchend', function (e) {
    var now   = Date.now();
    var delta = now - lastTap;
    if (delta > 0 && delta < 350) {
      e.preventDefault();
      toggleKeeper();
    }
    lastTap = now;
  });
}());
