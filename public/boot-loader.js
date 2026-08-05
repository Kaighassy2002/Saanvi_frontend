/* Failsafe: never leave visitors stuck on the splash */
window.setTimeout(function () {
  var el = document.getElementById('app-boot-loader')
  if (!el || el.dataset.hiding === '1') return
  el.dataset.hiding = '1'
  el.classList.add('app-boot-loader--hide')
  el.setAttribute('aria-busy', 'false')
  document.body.classList.remove('app-boot-loading')
  window.setTimeout(function () {
    if (el.parentNode) el.remove()
  }, 650)
}, 5000)
