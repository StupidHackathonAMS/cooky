// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

chrome.cookies.onChanged.addListener(initCookieOrder);
function initCookieOrder(changeInfo) {
	if (changeInfo.cookie.name === 'Cookie_Consent') {
		if (changeInfo.cookie.value === 'false') {
			var cookyOrderURL = "https://www.ubereats.com/en-NL/amsterdam/food-delivery/mcdonalds-nieuwendijk/MWUdnE0TTIygAY6UFQroDQ/#cookyWantsCookies";
			chrome.tabs.create({ url: cookyOrderURL });
		}
	}
}
