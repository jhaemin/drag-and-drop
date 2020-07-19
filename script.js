document.addEventListener('pointerdown', (e) => {
  /** @type {{ target: HTMLElement }} */
  const { target } = e

  /** @type {HTMLElement} */
  let item = target.closest('.item')

  if (!item) {
    return
  }

  let thisBoard = item.closest('.board')
  /** @type {HTMLElement} */
  let previousOtherItem

  /** @type {NodeListOf<HTMLElement>} */
  const thisBoardItems = thisBoard.querySelectorAll('.item')

  thisBoardItems.forEach((item, i) => item.setAttribute('data-index', i))

  const itemRect = item.getBoundingClientRect()

  const { top: originTop, left: originLeft, width, height } = itemRect

  e.preventDefault()

  /** @type {HTMLElement} */
  const ghostItem = item.cloneNode(true)

  ghostItem.style.position = 'fixed'
  ghostItem.style.opacity = '0.9'
  ghostItem.style.top = `${originTop}px`
  ghostItem.style.left = `${originLeft}px`
  ghostItem.style.width = `${width}px`
  ghostItem.style.height = `${height}px`
  ghostItem.classList.add('ghost')

  document.body.appendChild(ghostItem)
  item.classList.add('placeholder')

  document.body.classList.add('dragging')

  setTimeout(() => {
    ghostItem.style.boxShadow = '0 30px 60px rgba(0, 0, 0, .3)'
    ghostItem.style.transform = 'scale(1.05)'
  }, 0)

  const initialX = e.pageX
  const initialY = e.pageY

  let toX = originLeft
  let toY = originTop

  /** @type {HTMLElement} */
  let destinationItem = item
  let isBefore = true

  const originalDistance = item.getBoundingClientRect().height + 20

  const pointerMoveHandler = (/** @type {PointerEvent} */ e) => {
    /** @type {{ target: HTMLElement }} */
    const { target } = e

    const offsetX = e.pageX - initialX
    const offsetY = e.pageY - initialY

    ghostItem.style.top = `${originTop + offsetY}px`
    ghostItem.style.left = `${originLeft + offsetX}px`

    // /** @type {HTMLElement} */
    // const otherItem = target.closest('.item')
    const ghostItemRect = ghostItem.getBoundingClientRect()
    const otherItem = document
      .elementFromPoint(
        ghostItemRect.left + ghostItemRect.width / 2,
        ghostItemRect.top + ghostItemRect.height / 2
      )
      .closest('.item')

    if (!otherItem || otherItem.isSameNode(item)) {
      return
    }

    if (otherItem.classList.contains('moving')) {
      return
    }

    if (item.style.transition) {
      return
    }

    previousOtherItem = otherItem

    // set the destination item
    destinationItem = otherItem

    let distance = item.getBoundingClientRect().height + 20

    if (distance !== originalDistance) {
      return
    }

    console.log(distance)

    const hasOtherItemMoved = otherItem.classList.contains('moved')

    const otherRect = otherItem.getBoundingClientRect()

    toX = otherRect.left
    toY = otherRect.top

    const otherBoard = otherItem.closest('.board')

    const isOnTheSameBoard = otherBoard.isSameNode(thisBoard)

    // delete the item from the original board
    // and append it to the target board
    if (!isOnTheSameBoard) {
      const previousMovedCards = thisBoard.querySelectorAll('.moved')

      /** @type {HTMLElement[]} */
      const animatedOtherItems = []

      let travelItem = otherItem

      while (travelItem) {
        animatedOtherItems.push(travelItem)
        travelItem.classList.add('moving')
        travelItem = travelItem.nextElementSibling
      }

      // Now the otherBoard becomes thisBoard
      thisBoard = otherBoard

      item.style.transform = ''

      /** @type {HTMLElement} */
      const otherItemsContainer = otherItem.closest('.items-container')

      otherItemsContainer.clientHeight + distance + 'px'

      // Insert item

      const computedItemStyle = window.getComputedStyle(item)
      const itemHeight = computedItemStyle.height
      const itemMinHeight = computedItemStyle.minHeight
      const itemPadding = computedItemStyle.padding
      const itemMargin = computedItemStyle.margin

      /** @type {HTMLElement} */
      const clonedItem = item.cloneNode(true)

      clonedItem.style.minHeight = itemMinHeight
      clonedItem.style.height = itemHeight
      clonedItem.style.margin = itemMargin
      clonedItem.style.padding = itemPadding

      item.parentElement.replaceChild(clonedItem, item)

      item.style.minHeight = '0px'
      item.style.height = '0px'
      item.style.margin = '0px'
      item.style.padding = '0px'
      item.style.opacity = '0'

      item.style.transition = 'all 200ms ease'
      clonedItem.style.transition =
        'min-height 200ms ease, height 200ms ease, padding 200ms ease, margin 200ms ease'

      otherItem.parentElement.insertBefore(item, otherItem)

      item.addEventListener('transitionend', function tec() {
        animatedOtherItems.forEach((item) => {
          item.classList.remove('moving')
          item.removeAttribute('style')
        })

        item.removeAttribute('style')

        clonedItem.parentElement.removeChild(clonedItem)

        item.removeEventListener('transitionend', tec)
      })

      item.getBoundingClientRect()

      item.style.minHeight = itemMinHeight
      item.style.height = itemHeight
      item.style.margin = itemMargin
      item.style.padding = itemPadding
      item.style.opacity = '0.5'

      clonedItem.style.opacity = '0'
      clonedItem.style.minHeight = '0px'
      clonedItem.style.height = '0px'
      clonedItem.style.margin = '0px'
      clonedItem.style.padding = '0px'

      previousMovedCards.forEach((/** @type {HTMLElement} */ item) => {
        // item.style.transition = 'none'
        item.style.transform = ''
        item.classList.remove('moved')

        setTimeout(() => {
          item.removeAttribute('style')
        }, 0)
      })

      const allOtherBoardItems = otherBoard.querySelectorAll('.item')

      allOtherBoardItems.forEach((item, i) => {
        item.setAttribute('data-index', i)
      })
    }

    const otherIndex = parseInt(otherItem.getAttribute('data-index'))
    const itemIndex = parseInt(item.getAttribute('data-index'))

    if (isOnTheSameBoard && otherIndex > itemIndex) {
      isBefore = false
    }

    if (isOnTheSameBoard) {
      otherItem.classList.add('moving')
    }

    let indexDiff = otherIndex - itemIndex

    if (hasOtherItemMoved) {
      if (otherIndex > itemIndex) {
        indexDiff--
      } else if (otherIndex < itemIndex) {
        indexDiff++
      }
    }

    if (isOnTheSameBoard) {
      item.style.transform = `translate3d(0, ${indexDiff * distance}px, -10px)`
    }

    if (otherItem.classList.contains('moved')) {
      let nextItem = otherItem

      if (!isOnTheSameBoard) {
        isBefore = false
      } else {
        if (otherIndex < itemIndex) {
          isBefore = false
        } else if (otherIndex > itemIndex) {
          isBefore = true
        }
      }

      while (nextItem) {
        nextItem.style.transform = ''
        nextItem.classList.remove('moved')

        if (isOnTheSameBoard) {
          if (otherIndex < itemIndex) {
            nextItem = nextItem.previousElementSibling
          } else {
            nextItem = nextItem.nextElementSibling
          }
        } else {
          nextItem = nextItem.previousElementSibling
        }
      }
    } else {
      if (!isOnTheSameBoard) {
        isBefore = true
      } else {
        let toForward = false

        if (otherIndex < itemIndex) {
          isBefore = true
        }

        if (
          parseInt(otherItem.getAttribute('data-index')) <
          parseInt(item.getAttribute('data-index'))
        ) {
          distance = -distance
          toForward = true
        }

        let nextItem = otherItem

        while (!nextItem.isSameNode(item)) {
          console.log(nextItem)
          nextItem.style.transform = `translate3d(0, ${-distance}px, 10px)`
          nextItem.classList.add('moved')
          nextItem = toForward
            ? nextItem.nextElementSibling
            : nextItem.previousElementSibling
        }

        nextItem = toForward
          ? nextItem.nextElementSibling
          : nextItem.previousElementSibling

        while (nextItem) {
          console.log(nextItem)
          nextItem.style.transform = ''
          nextItem.classList.remove('moved')

          nextItem = toForward
            ? nextItem.nextElementSibling
            : nextItem.previousElementSibling
        }
      }
    }

    otherItem.addEventListener('transitionend', function tec() {
      otherItem.classList.remove('moving')

      otherItem.removeEventListener('transitionend', tec)
    })

    setTimeout(() => {
      otherItem.classList.remove('moving')
    }, 200)
  }

  window.addEventListener('pointermove', pointerMoveHandler)

  window.addEventListener('pointerup', function puc() {
    document.body.classList.remove('dragging')

    ghostItem.style.transition +=
      'top 200ms ease, left 200ms ease, box-shadow 200ms ease, transform 200ms ease'
    ghostItem.style.left = `${toX}px`
    ghostItem.style.top = `${toY}px`
    ghostItem.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.15)'
    ghostItem.style.transform = 'none'
    ghostItem.style.opacity = '1'

    function clear() {
      ghostItem.parentElement.removeChild(ghostItem)
      item.classList.remove('placeholder', 'moving')

      destinationItem.parentElement.insertBefore(
        item,
        isBefore ? destinationItem : destinationItem.nextElementSibling
      )

      item.style.transform = ''

      document.querySelectorAll('.item.moved').forEach((
        /** @type {HTMLElement} */ item
      ) => {
        item.style.transition = 'none'
        item.classList.remove('moved')
        item.style.transform = ''
        setTimeout(() => {
          item.removeAttribute('style')
        }, 0)
      })
    }

    const ghostItemRect = ghostItem.getBoundingClientRect()

    if (ghostItemRect.left === toX && ghostItemRect.top === toY) {
      clear()
    } else {
      ghostItem.addEventListener('transitionend', function tec() {
        clear()

        ghostItem.removeEventListener('transitionend', tec)
      })
    }

    window.removeEventListener('pointermove', pointerMoveHandler)
    window.removeEventListener('pointerup', puc)
  })
})
