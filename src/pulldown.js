// stolen from https://stackoverflow.com/a/46248086/1042144

let touchStart = { x: 0, y: 0 },
    touchStop = { x: 0, y: 0 };

function swipeStart(e) {
    if (typeof e['targetTouches'] !== "undefined") {
        const { screenX: x, screenY: y } = e.targetTouches[0];
        touchStart = { x, y }
    } else {
        const { screenX: x, screenY: y } = e;
        touchStart = { x, y }
    }
}

function swipeEnd(e) {
    if (typeof e['changedTouches'] !== "undefined") {
        const { screenX: x, screenY: y } = e.changedTouches[0];
        touchStop = { x, y };
    } else {
        const { screenX: x, screenY: y } = e;
        touchStop = { x, y };
    }

    swipeCheck();
}

function swipeCheck() {
    const dY = touchStart.y - touchStop.y,
          dX = touchStart.x - touchStop.x;

    if (isPullDown(dY, dX)) confirm('Check for update?') && window.location.reload();
}

function isPullDown(dY, dX) {
  const [dYAbs, dXAbs] = [dY, dX].map(Math.abs),
        isPullDownWithXYFixedPixelDiff = (dXAbs <= 100 && dYAbs >= 300),
        isPullDownWithXYRatio = (dXAbs/dYAbs <= 0.3 && dYAbs >= 80);

  return dY < 0 && (isPullDownWithXYFixedPixelDiff || isPullDownWithXYRatio);
}

document.addEventListener('touchstart', swipeStart, false);
document.addEventListener('touchend', swipeEnd, false);
