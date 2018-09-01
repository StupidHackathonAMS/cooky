class Cooky {
  constructor() {
    this.currentWords = '';
    this.speakingQueue = [];
  }

  oninit() {
    setTimeout(() => { this.silence(); m.redraw(); }, 5000);
    if (window.location.hash === '#cookyWantsCookies') {
      this.initCookieOrder();
    }
    if (window.location.href === "https://www.ubereats.com/en-NL/checkout/") {
      this.checkingOutCookie();
    }
  }

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


  /**
   * Initialize cookie order
   */
  initCookieOrder() {
    console.log('initCookieOrder');
    const addressInputInterval = setInterval(() => {
      var addressInput = document.querySelector('[placeholder="Enter your address"]');
      if (addressInput !== undefined) {
        clearInterval(addressInputInterval);
        this.speak('Oh, you want cookies! Let me help you with that if you please. Just enter your address.');
        addressInput.focus();
        addressInput.addEventListener("blur", (event) => {
          console.log('blurring field');
          this.addCookieToBasket();
        }, true);
      }
    }, 10);
  }

  /**
   * Add the cookie to the basket and go to checkout
   */
  addCookieToBasket() {
    console.log('addCookieToBasket');
    this.speak('Great, thanks. Let me add that cookie for you, hold on.');
    setTimeout( () => {
      console.log('addToCart');
      document.querySelector('[title="Triple Chocolate Cookie"]').click();
      setTimeout( () => {
        console.log('toCheckout');
        document.querySelector('.fade_ button:not(.incrementer_)').click();
        setTimeout( () => {
          console.log('toCheckout');
          document.querySelector('[data-reactid="1026"]').click();
        }, 100);
      }, 1000);
    }, 3000);
  }

  /**
   * Compliment on the progress
   */
  checkingOutCookie() {
    this.speak('Niiice, now just log in and finish the order. You will be able to eat my pals soon!')
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
