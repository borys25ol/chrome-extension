const changeColor = document.getElementById('scrape-page')

changeColor.style.backgroundColor = 'red'
changeColor.setAttribute('value', 'red')

changeColor.onclick = function (element) {
  const color = element.target.value
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(tabs[0].id, { file: './main.js' })
  })
}
