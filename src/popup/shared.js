import axios from "axios"

export const url = process.env.API_BASE_URL

export const getToken = async () => {
  const result = await browser.storage.sync.get(['token'])
  return result.token
}

export const calculateNextActionsNumber = async () => {
  const token = await getToken()

  return axios.get(`${url}/tasks?type=next_action`, {
    headers: {
      "Authorization": token
    }
  }).then(response => {
    const numberOfNextActions = response.data
      .filter(t => !t.completed).length
    chrome.browserAction.setBadgeBackgroundColor({
      color: [0, 150, 0, 255]
    });
    chrome.browserAction.setBadgeText({
      text: String(numberOfNextActions)
    });

    return numberOfNextActions
  })
}
