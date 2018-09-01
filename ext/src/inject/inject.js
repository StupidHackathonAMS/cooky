class Cooky {
  constructor() {
    this.currentWords = '';
    this.speakingQueue = [];
  }

  oninit() {}

  /**
   * Make Cooky say some words.
   */
  speak(words, after) {
    this.speakingQueue.push({ words, after });

    if (!this.currentWords) {
      this.speakFromQueue(true);
    }
  }

  speakFromQueue(synchronous) {
    const { words, after } = this.speakingQueue.shift();

    this.currentWords = words;

    chrome.runtime.sendMessage(
      { cookySpeaks: words },
      () => {
        if (after) {
          after();
        }
        if (this.speakingQueue.length) {
          setTimeout(() => this.speakFromQueue(), 500);
        } else {
          this.silence(synchronous);
        }
      }
    );

    if (!synchronous) {
      m.redraw();
    }
  }

  /**
   * Stop Cooky from speaking. Also empties the speaking queue.
   */
  silence(synchronous) {
    this.currentWords = null;
    this.speakingQueue = [];
    chrome.runtime.sendMessage({ cookySpeaks: false });

    if (!synchronous) {
      m.redraw();
    }
  }

  view() {
    return m('div', {class: 'cooky'}, [
      this.currentWords ?
      m('div', {
        class: 'cooky__speaks speechbubble',
        onclick: () => { this.silence(); }
      }, [
          m('span', {class: 'speechbubble__words'}, this.currentWords),
        ]) : null,
      m('img', {
        src: chrome.runtime.getURL('src/img/cooky.svg'),
        class: 'cooky__image',
      }),
    ]);
  }
}

const readyStateCheckInterval = setInterval(() => {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);

    const mounter = document.createElement('div');
    document.body.appendChild(mounter);
    const c = new Cooky();
    m.mount(mounter, c);
  }
}, 10);
