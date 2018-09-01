function generatePassword() {
  let original = passwordList[Math.floor(Math.random() * passwordList.length)];
  original = original.toLowerCase();

  pw = original
    .replace(/[a-z]/gi,
      (letter) => (Math.random() < 0.1) ? letter.toUpperCase() : letter);

  if (Math.random() < 0.4) {
    pw = pw
      .replace(/o/gi, '0')
      .replace(/a/gi, '4')
      .replace(/e/gi, '3');
  }
  if (pw.match(/[A-z]$/) && Math.random() < 0.4) {
    pw = pw + '123';
  }
  if (Math.random() < 0.4) {
    pw = pw + '!';
  }

  return { original, edited: pw };
}

function passwordToSpeech(original, edited) {
  if (edited.match(/^[a-z]+$/)) {
    return edited;
  }
  if (edited.match(/^[A-Z]+$/)) {
    return edited + ", all uppercase of course.";
  }
  if (edited.match(/^[A-Za-z]+$/)) {
    const ucLetters = edited.match(/[A-Z]/g)
      .join(', ')
      .replace(/, ([A-Z])$/, ', and $1');
    return edited + ", but the " + ucLetters
      + (ucLetters.length == 1 ? " is" : " are") + " uppercase";
  }

  let r = original.toLowerCase();
  const orgArray = original.split('');
  const editArray = edited.split('');

  if (original.length !== edited.length) {
    r += ' ' + editArray
      .slice(original.length)
      .map(char => char.replace('!', ', exclamation mark'))
      .join('');
  }
  let wasEdited = false;

  editArray.forEach((char, i) => {
      if (i < orgArray.length && char !== orgArray[i]) {
        r += ', ' + (wasEdited ? 'and' : 'but') + ' the ' +
          orgArray[i].replace('a', 'ay') + ' is ';

        if (char === orgArray[i].toUpperCase()) {
          r += 'uppercase';
        } else {
          r += (['a', 'e', 'i', 'o', 'u'].includes(char) ? 'an' : 'a')
            + ' ' + char.replace('a', 'ay');
        }
        wasEdited = true;
      }
    });
  // console.log(r);
  return r;
}


class PasswordConfirmation {
  view(vnode) {
    return m('div', {class: 'button-group'}, [
      m('button',
        {
          class: 'button-group__button button button--confirm',
          onclick: vnode.attrs.confirm,
        },
        'yes please'),
      m('button',
        {
          class: 'button-group__button button button--decline',
          onclick: vnode.attrs.decline,
         },
        'no'),
    ]);
  }
}


class Cooky {
  constructor() {
    this.currentWords = '';
    this.currentCustomElement = null;
    this.currentKeep = false;
    this.speakingQueue = [];

    this.knownPasswordFields = new Set();

    this.knownPasswords = {};
  }

  oninit() {
    if (window.location.hash === '#cookyWantsCookies') {
      this.initCookieOrder();
    }
    if (window.location.href === "https://www.ubereats.com/en-NL/checkout/") {
      this.checkingOutCookie();
    }
    if (window.location.host.includes(".google.")
      && window.location.pathname === "/search") {
      this.bashGoogle();
    }
    if (window.location.host.includes(".youtube.")) {
      this.rickCooky();
    }
  }

  sayASadThing() {
    const sadness = sadQuotes[Math.floor(Math.random() * sadQuotes.length)];
    if (sadness.forEach) {
      sadness.forEach(sad => this.speak(sad, { asynchronous: true }));
    } else {
      this.speak(sadness, { asynchronous: true });
    }
  }

  /**
   * Make Cooky say some words.
   */
  speak(words, options) {
    const { asynchronous } = options || {};
    this.speakingQueue.push({ words, ...options });

    if (!this.currentWords) {
      // console.log("Speaking...");
      this.speakFromQueue(!asynchronous);
    }
  }

  speakFromQueue(synchronous) {
    const {
      words, speakingWords, after, customElement, keep
    } = this.speakingQueue.shift();
    // console.log({ words, after, customElement, keep });

    this.currentWords = words;
    this.currentCustomElement = customElement || null;
    this.currentKeep = keep;

    chrome.runtime.sendMessage(
      { cookySpeaks: speakingWords || words },
      () => {
        if (after) {
          after();
        }
        if (!keep && this.speakingQueue.length) {
          setTimeout(() => this.speakFromQueue(), 500);
        } else if (!keep) {
          this.silence(false);
        }
      }
    );

    if (!synchronous) {
      // console.log('drawing');
      m.redraw();
    }
  }

  /**
   * Stop Cooky from speaking. Also empties the speaking queue.
   */
  silence(synchronous) {
    // console.log('silencing');
    this.currentWords = null;
    this.currentCustomElement = null;
    this.currentKeep = false;
    this.speakingQueue = [];

    chrome.runtime.sendMessage({ cookySpeaks: false });

    /* to /skip/ instead of stop, but broken rn.
    if (this.speakingQueue.length) {
      setTimeout(() => this.speakFromQueue(), 500);
    }
    */

    if (!synchronous) {
      m.redraw();
    }
  }


  /**
   * Initialize cookie order
   */
  initCookieOrder() {
    const addressInputInterval = setInterval(() => {
      var addressInput = document.querySelector('[placeholder="Enter your address"]');
      if (addressInput !== undefined) {
        clearInterval(addressInputInterval);
        this.speak('Oh, you want cookies! Let me help you with that if you please. Just enter your address.', { asynchronous: true });
        addressInput.focus();
        addressInput.addEventListener("blur", (event) => {
          this.addCookieToBasket();
        }, true);
      }
    }, 10);
  }

  /**
   * Add the cookie to the basket and go to checkout
   */
  addCookieToBasket() {
    this.speak('Great, thanks. Let me add that cookie for you, hold on.', { asynchronous: true });
    setTimeout( () => {
      var checkoutButton = document.querySelector('button[disabled]');
      document.querySelector('[title="Triple Chocolate Cookie"]').click();
      setTimeout( () => {
        document.querySelector('.fade_ button:not(.incrementer_)').click();
        setTimeout( () => {
          checkoutButton.click();
          this.checkingOutCookie();
        }, 100);
      }, 1000);
    }, 3000);
  }

  /**
   * Compliment on the progress
   */
  checkingOutCookie() {
    this.speak('Niiice, now just log in and finish the order. You will be able to eat my pals soon!', { asynchronous: true })
  }

  /**
   * Make sure to show off your search skills, Cooky
   */
  bashGoogle() {
    this.speak("Haha, are you using Google? Just ask me, I know everything!", { asynchronous: true });
  }

  /**
   * Make sure to show off your search skills, Cooky
   */
  rickCooky() {
    if (window.location.href === "https://www.youtube.com/watch?v=dQw4w9WgXcQ") {
      this.speak("I saw you wanted to watch a video, so here is my favourite one. Have fun!")
    } else {
      chrome.runtime.sendMessage({ rick: true });
    }
  }

  findPasswordFields() {
    const fields = document.querySelectorAll('[type="password"]');
    let newField = false;
    for (const field of fields) {
      if (!this.knownPasswordFields.has(field)) {
        newField = true;
      }
      this.knownPasswordFields.add(field);
    }

    if (newField) {
      this.speak("I found a new password field!", { asynchronous: true });
      this.fillPasswordFields();
    }
  }

  makeUpAPassword() {
    const password = generatePassword();
    // console.log('speaky', password);
    this.speak("I got one: " +  password.edited, {
      speakingWords: "I got one: " + passwordToSpeech(
        password.original, password.edited),
      asynchronous: true,
    });

    Array.from(document.querySelectorAll('[type="password"]'))
      .forEach(element => {
        // console.log(element);
        element.value = password.edit;
        element.classList.add('password-resize');
      });
  }

  fillPasswordFields() {
    this.speak(
      "I'm super good at coming up with passwords. Do you want me to fill out \
      this password for you?",
      {
        asynchronous: true,
        customElement: m('div', [
          m(PasswordConfirmation, {
            confirm: (e) => {
              e.stopPropagation();
              this.silence();
              this.makeUpAPassword();
            },
            decline: (e) => {
              e.stopPropagation();
              this.silence();
              this.speak(
                "Oh, that's okay, " +
                "I'm sure you have some fine passwords yourself…",
                {
                  speakingWords: "Oh, that's okay, " +
                  "I'm sure you have some fine passwords yourself...",
                  asynchronous: true,
                });
            },
          }),
        ]),
        keep: true,
      });
  }

  view() {
    // console.log(this.currentWords);
    return m('div', {class: 'cooky'}, [
      this.currentWords ?
      m('div', {
        class: 'cooky__speaks speechbubble',
        onclick: (event) => {
          !this.currentKeep && this.silence();
        }
      }, [
          m('span', {class: 'speechbubble__words'}, this.currentWords),
          this.currentCustomElement,
        ]) : null,
      m('img', {
        src: chrome.runtime.getURL(this.currentWords ? 'src/img/speaking.gif' : 'src/img/stationary.gif'),
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

    // Await sadness
    chrome.runtime.onMessage.addListener((message) => {
      if (message.cookyIsSad) {
        c.sayASadThing()
      }
    });

    // Look for passwords
    if (document.querySelector('[type="password"]')) {
      c.findPasswordFields();
    }

    const observer = new MutationObserver((mutationsList) => {
      for(const mutation of mutationsList) {
        if (
          (mutation.addedNodes && Array.from(mutation.addedNodes)
            .some((node) =>
              (node.type && node.type === 'password')
              || document.querySelector('[type="password"]')))
          || (mutation.attributeName && mutation.target.type === 'password')
        ) {
          c.findPasswordFields();
        }
      }
    });

    observer.observe(
      document.body,
      {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['type'],
      });
  }
}, 10);
