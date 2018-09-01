chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cookySpeaks && request.cookySpeaks !== false) {
    const { cookySpeaks } = request;
    // console.log("speaking the words", cookySpeaks);
    chrome.tts.speak(cookySpeaks, {onEvent: (event) => {
      // console.log(event);
      if (event.type === 'end') {
        sendResponse();
      }
    }});
  } else if (request.cookySpeaks === false) {
    // console.log("stopped", request.cookySpeaks);
    chrome.tts.stop();
    sendResponse();
  } else if (request.rick) {
    var rickURL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    chrome.tabs.create({ url: rickURL });
  }

  return true;
});

function awaitSadness() {
  const when = Date.now() + ((Math.random() + 2) * 1000)
  console.log(when);

  chrome.alarms.create('sadness', { when });
}

chrome.alarms.onAlarm.addListener(() => {
  chrome.tts.isSpeaking((speaking) => {
    if (!speaking) {
      chrome.tabs.getSelected((tab) => {
        if (tab) {
          chrome.tabs.sendMessage(tab.id, {cookyIsSad: true});
        }
      })
    }
    awaitSadness();
  });
});

awaitSadness();

chrome.cookies.onChanged.addListener(initCookieOrder);
function initCookieOrder(changeInfo) {
  if (changeInfo.cookie.name === 'Cookie_Consent') {
    if (changeInfo.cookie.value !== 'false') {
      var cookyOrderURL = "https://www.ubereats.com/en-NL/amsterdam/food-delivery/mcdonalds-nieuwendijk/MWUdnE0TTIygAY6UFQroDQ/#cookyWantsCookies";
      chrome.tabs.create({ url: cookyOrderURL });
    }
  }
}
