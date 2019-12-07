document.addEventListener('DOMContentLoaded', () => {
  const url = "https://api.nozbe.com:3000"
  const client_id = "648e384ad16f95a1a762bfc420580a5d96aaa08e"

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
