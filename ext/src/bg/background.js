chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cookySpeaks && request.cookySpeaks !== false) {
    const { cookySpeaks } = request;
    chrome.tts.speak(cookySpeaks, {onEvent: (event) => {
      if (event.type === 'end') {
        sendResponse();
      }
    }});
  } else if (request.cookySpeaks === false) {
    chrome.tts.stop();
    sendResponse();
  }

  return true;
});

chrome.cookies.onChanged.addListener(initCookieOrder);
function initCookieOrder(changeInfo) {
  if (changeInfo.cookie.name === 'Cookie_Consent') {
    if (changeInfo.cookie.value === 'false') {
      var cookyOrderURL = "https://www.ubereats.com/en-NL/amsterdam/food-delivery/mcdonalds-nieuwendijk/MWUdnE0TTIygAY6UFQroDQ/#cookyWantsCookies";
      chrome.tabs.create({ url: cookyOrderURL });
    }
  }
}
