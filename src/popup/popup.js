import axios from "axios"

document.addEventListener('DOMContentLoaded', () => {
  const url = "https://api.nozbe.com:3000"
  const nozbeAppHref = "https://app.nozbe.com"
  let token

  let projectId
  let taskId

  chrome.storage.sync.get(['token'], r => {
    if (r.token) {
      token = r.token
      loadApp()
    } else {
      chrome.runtime.openOptionsPage()
    }
  })

  const loadApp = () => {
    chrome.storage.sync.get(['taskId', 'projectId', 'projectName', 'projectsList', 'tasksList', 'taskInfo', 'commentsList'], r => {
      taskId = r.taskId
      projectId = r.projectId
      if (taskId) {
        document.querySelector(".projectList").style.display = "none"
        document.querySelector(".back").style.visibility = "visible"
        document.querySelector(".back .arrow").style.visibility = "visible"
        document.querySelector(".project").style.display = "none"
        document.querySelector(".taskView").style.display = "block"

        document.querySelector(".taskView .newCommentContent").focus()
      } else if (projectId) {
        document.querySelector(".projectList").style.display = "none"
        document.querySelector(".taskView").style.display = "none"
        document.querySelector(".back").style.visibility = "visible"
        document.querySelector(".back .arrow").style.visibility = "visible"
        document.querySelector(".project").style.display = "block"

        document.querySelector(".project .name").focus()
      } else if (r.projectsList) {
        calculateNextActionsNumber()
        chrome.browserAction.getBadgeText({}, (n) => {
          document.querySelector("li#next_action .tasksNumber")
            .innerHTML = n
        })
      }
    })
  }

  const calculateNextActionsNumber = () => {
    chrome.browserAction.getBadgeText({}, (n) => {
      document.querySelector("li#next_action .tasksNumber")
        .innerHTML = n
    })

    axios.get(`${url}/tasks?type=next_action`, {
      headers: {
        "Authorization": token
      }
    }).then(response => {
      const numberOfNextActions = response.data
        .filter(t => !t.completed).length
      document.querySelector("li#next_action .tasksNumber")
        .innerHTML = numberOfNextActions

      chrome.browserAction.setBadgeBackgroundColor({
        color: [0, 150, 0, 255]
      });
      chrome.browserAction.setBadgeText({
        text: String(numberOfNextActions)
      });
    })
  }

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('back') ||
               e.target.parentElement.classList.contains('back')) {
      let taskId, projectId, projectName
      chrome.storage.sync.get(['taskId', 'projectId', 'projectName'], r => {
        taskId = r.taskId
        projectId = r.projectId
        projectName = r.projectName || ''

        if (taskId) {
          document.querySelector(".taskView").style.display = "none"
          chrome.storage.sync.set({taskId: null})

          document.querySelector(".projectList").style.display = "none"
          document.querySelector(".taskView").style.display = "none"
          document.querySelector(".back").style.visibility = "visible"
          document.querySelector(".back .arrow").style.visibility = "visible"
          document.querySelector(".project").style.display = "block"
          document.querySelector(".project .name").focus()
        } else if (projectId) {
          document.querySelector(".project").style.display = "none"
          document.querySelector(".back").style.visibility = "hidden"
          document.querySelector(".back .arrow").style.visibility = "hidden"
          chrome.storage.sync.set({projectId: null, projectName: null})
          document.querySelector(".projectList").style.display = "block"
          calculateNextActionsNumber()
        }
      })
    } else if (e.target.classList.contains('btnLogout')) {
      chrome.storage.sync.set({
        token: null, projectId: null, projectName: null,
        taskId: null, projectsList: null, tasksList: null,
        taskInfo: null, commentsList: null
      })
      document.querySelector(".projectList").style.display = "block"
      document.querySelector(".project").style.display = "none"
      document.querySelector(".taskView").style.display = "none"
      document.querySelector(".projectList .result").innerHTML = "Loged out"
    } else if (e.target.classList.contains('title')) {
      chrome.tabs.create({ url: nozbeAppHref });
    } else if (e.target.classList.contains('projectName')) {
      chrome.tabs.create({ url: `${nozbeAppHref}/#projects-${projectId}`});
    }
  })
});
