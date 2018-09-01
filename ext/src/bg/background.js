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
  }

  return true;
});

chrome.cookies.onChanged.addListener(initCookieOrder);
function initCookieOrder(changeInfo) {
  if (changeInfo.cookie.name === 'Cookie_Consent') {
    if (changeInfo.cookie.value !== 'false') {
      var cookyOrderURL = "https://www.ubereats.com/en-NL/amsterdam/food-delivery/mcdonalds-nieuwendijk/MWUdnE0TTIygAY6UFQroDQ/#cookyWantsCookies";
      chrome.tabs.create({ url: cookyOrderURL });
    }
  }
}
