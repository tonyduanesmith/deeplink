const {ipcRenderer} = require('electron')

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('js-quit-action')) {
    ipcRenderer.send('show-window')
    window.close()
  }
})

