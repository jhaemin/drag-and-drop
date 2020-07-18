document.addEventListener('pointerdown', (e) => {
  /** @type {{ target: HTMLElement }} */
  const { target } = e

  /** @type {HTMLElement} */
  const item = target.closest('.item')

  if (!item) {
    return
  }
})
