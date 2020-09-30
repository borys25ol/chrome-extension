const changeColor = document.getElementById('scrape-page')

const whiteListPattern = 'https://socialblade.com/*'

changeColor.onclick = function (element) {
  chrome.tabs.query({ active: true, currentWindow: true, url: whiteListPattern }, function (tabs) {
    chrome.tabs.executeScript(tabs[0].id, { file: './main.js' })
  })
}
