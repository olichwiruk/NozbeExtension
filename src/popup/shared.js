export const url = "https://api.nozbe.com:3000"
export const getToken = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['token'], r => { resolve(r.token) })
  })
}
