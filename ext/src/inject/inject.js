class Cooky {
  constructor() {
    this.words = '';
  }

  oninit() {
    this.speak('Hello, I am Cooky, your friend!');
    setTimeout(() => { this.silence(); m.redraw(); }, 5000);
  }

  /**
   * Make Cooky say some words.
   */
  speak(words) {
    this.words = words;
  }

  /**
   * Stop Cooky from speaking.
   */
  silence() {
    this.words = null;
  }


  view() {
    return m('div', {class: 'cooky'}, [
      this.words ?
        m('div', {class: 'cooky__speaks speechbubble'}, [
          m('span', {class: 'speechbubble__words'}, this.words),
        ]) : null,
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
