class Cooky {
  constructor() {}

  /**
   * Make Cooky say some words.
   */
  speak(words) {
  }

  view() {
    return m('div', {class: 'cooky'}, [
      m('div', {class: 'cooky__speaks speechbubble'}, [
        m('span', {class: 'speechbubble__words'}, 'asdf asdf asdf'),
      ]),
      m('img', {
        src: chrome.runtime.getURL('src/img/cooky.svg'),
        class: 'cooky__image',
      }),
    ]);
  }
}


chrome.extension.sendMessage({}, (response) => {
  const readyStateCheckInterval = setInterval(() => {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      const mounter = document.createElement('div');
      document.body.appendChild(mounter);
      const c = new Cooky();
      m.mount(mounter, c);
    }
  }, 10);
});
