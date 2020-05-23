import axios from "axios"

document.addEventListener('DOMContentLoaded', () => {
  const url = "https://api.nozbe.com:3000"
  const nozbeAppHref = "https://app.nozbe.com"
  let token

  let projectId
  let taskId

  chrome.storage.sync.get(['token'], r => {
    if (r.token) { token = r.token }
  })

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('title')) {
      chrome.tabs.create({ url: nozbeAppHref });
    } else if (e.target.classList.contains('projectName')) {
      chrome.tabs.create({ url: `${nozbeAppHref}/#projects-${projectId}`});
    }
  })
});
