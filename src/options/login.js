document.addEventListener('DOMContentLoaded', () => {
  const url = process.env.API_BASE_URL
  const client_id = process.env.APP_CLIENT_ID

  chrome.storage.sync.get(['token'], r => {
    if (!r.token) {
      chrome.identity.launchWebAuthFlow({ url: `${url}/login?client_id=${client_id}`, interactive: true }, r => {
        const params = {}
        const urlParams = r.split("?")[1].split("&")
          .map(p => p.split("="))
          .forEach(p => params[p[0]] = p[1])

        chrome.storage.sync.set({ token: params["access_token"] })
        window.close()
      })
    }
  })
});
