import axios from "axios"

export const url = "https://api.nozbe.com:3000"

export const getToken = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['token'], r => { resolve(r.token) })
  })
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
