class Cooky {
  constructor() {
    this.currentWords = '';
    this.speakingQueue = [];
  }

  oninit() {
    this.speak('Hello, I am Cooky, your friend!');
    this.speak("It looks like you're trying to store cookies. I can help you with that!");
  }

  /**
   * Make Cooky say some words.
   */
  speak(words, options) {
    if (!options) {
      options = {};
    }
    this.speakingQueue.push({ words, ...options });

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
        if (this.speakingQueue.length) {
          setTimeout(() => this.speakFromQueue(), 500);
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
  silence() {
    this.currentWords = null;
    this.speakingQueue = [];
    chrome.runtime.sendMessage({ cookySpeaks: false });
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
