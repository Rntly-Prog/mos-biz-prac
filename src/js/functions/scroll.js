let distance = 0;

export function disable_scroll() {
  document.querySelector(".site-container").classList.add("dis-scroll");
  document.querySelector(".site-container").scrollTo({
    top: distance,
    left: 0
  });
}

export function enable_scroll() {
  document.querySelector(".site-container").classList.remove("dis-scroll");
  if (distance != 0) {
    setTimeout(() => {
      window.scrollTo({
        top: distance,
        left: 0
      });
    }, 1);
  }
}
