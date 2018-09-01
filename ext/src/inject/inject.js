function passwordGenerator() {
  return passwordList[Math.floor(Math.random() * passwordList.length)];
}

function passwordSpeechGenerator(password) {
  if (password.match(/^a-z$/)) {
    return password;
  }
  if (password.match(/^A-Z$/)) {
    return password + ", all uppercase of course.";
  }
  if (password.match(/^a-Z$/)) {
    const uppercaseLetters = password.match(/A-Z/)
      .join(', ');
    return password + ", but the " + uppercaseLetters + "are uppercase";
  }
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

  /**
   * Make Cooky say some words.
   */
  speak(words, options) {
    const { asynchronous } = options || {};
    this.speakingQueue.push({ words, ...options });

    // console.log(this.currentWords, options);
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

    if (!synchronous) {
      m.redraw();
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
    const password = 'p4ssword';
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
        onclick: (event) => { !this.currentKeep && this.silence(); }
      }, [
          m('span', {class: 'speechbubble__words'}, this.currentWords),
          this.currentCustomElement,
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
