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
        document.querySelector(".taskView .taskInfo").innerHTML = r.taskInfo
        document.querySelector(".taskView .result").innerHTML = r.commentsList
        openTask(r.taskId)
      } else if (projectId) {
        document.querySelector(".project .result").innerHTML = r.tasksList
        openProject(r.projectId, r.projectName || '')
      } else if (r.projectsList) {
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

  const openProject = (id, name) => {
    projectId = id
    chrome.storage.sync.set({projectId: id, projectName: name})
    document.querySelector(".projectList").style.display = "none"
    document.querySelector(".taskView").style.display = "none"
    document.querySelector(".back").style.visibility = "visible"
    document.querySelector(".back .arrow").style.visibility = "visible"
    document.querySelector(".project").style.display = "block"
    document.querySelector(".projectName").innerHTML = name || ''
    document.querySelector(".project .name").focus()

    let type
    if (id == "next_action") {
      type = "next_action"
    } else {
      type = `project&id=${id}`
    }

    axios.get(`${url}/tasks?type=${type}`, {
      headers: {
        "Authorization": token
      }
    }).then(response => {
      const ul = document.createElement('ul')

      response.data.sort((a, b) => {
        if (a.completed < b.completed) { return -1 }
        if (a.completed > b.completed) { return 1 }
        return 0
      }).forEach(t => {
        const li = document.createElement('li')
        const state = document.createElement('div')
        state.classList.add('state')
        li.appendChild(state)
        const content = document.createElement('div')
        content.classList.add('content')
        li.appendChild(content)
        const info = document.createElement('div')
        info.classList.add('info')
        const star = document.createElement('div')
        star.classList.add('star')
        li.appendChild(star)

        ul.appendChild(li)
        li.id = t.id
        li.classList.add('task')
        if (t.next) {
          star.classList.add('next')
        }
        li.classList.add(t.completed ? 'completed' : 'todo')
        content.innerHTML = t.name
        if (t.comments && t.comments.filter(c => !c.deleted).length > 0) {
          content.innerHTML = content.innerHTML + ` [${t.comments.filter(c => !c.deleted).length}]`
        } else if (projectId == 'next_action' && t._comment_count > 0) {
          content.innerHTML = content.innerHTML + ` [${t._comment_count}]`
        }

        const sign = '&#8226;'

        content.appendChild(info)
        if (projectId == 'next_action') {
          const span = document.createElement('span')
          span.classList.add('projectLink')
          span.classList.add('x'+t._project_color)
          const name = document.createElement('div')
          name.classList.add('name')
          name.style.display = "inline"
          span.appendChild(name)

          span.id = t.project_id
          name.innerHTML = t._project_name
          info.innerHTML = `${info.innerHTML} ${span.outerHTML}  ${sign} `
        }
        if (t._time_s) {
          const span = document.createElement('span')
          span.classList.add('time')
          span.innerHTML = t._time_s
          info.innerHTML = `${info.innerHTML} ${span.outerHTML}  ${sign} `
        }
        // if (t.recur) {
        //   const span = document.createElement('span')
        //   span.classList.add('recur')
        //   span.innerHTML = t._recur_name
        //   info.innerHTML = info.innerHTML + span.outerHTML + ' | '
        // }
        if (t.datetime) {
          const span = document.createElement('span')
          span.classList.add('datetime')
          if (new Date(t.datetime).getTime() < Date.now()) {
            span.classList.add('overdated')
          }
          span.innerHTML = t._datetime_s
          info.innerHTML = `${info.innerHTML} ${span.outerHTML}  ${sign} `
        }
        info.innerHTML = info.innerHTML.slice(0, -2)
      })
      const projectResult = document.querySelector(".project .result")
      projectResult.innerHTML = ul.outerHTML || ''
      chrome.storage.sync.set({tasksList: projectResult.innerHTML})
    })
  }

  const openTask = (id, task = null) => {
    taskId = id
    chrome.storage.sync.set({taskId: id})
    chrome.storage.sync.get(['projectId', 'projectName'], r => {
      projectId = r.projectId
      document.querySelector(".taskView .projectName").innerHTML = r.projectName || ''
    })
    document.querySelector(".projectList").style.display = "none"
    document.querySelector(".back").style.visibility = "visible"
    document.querySelector(".back .arrow").style.visibility = "visible"
    document.querySelector(".project").style.display = "none"
    document.querySelector(".taskView").style.display = "block"

    const taskInfo = document.querySelector(".taskView .taskInfo")

    if (task) {
      const li = document.createElement('li')
      const state = document.createElement('div')
      state.classList.add('state')
      li.appendChild(state)
      const content = document.createElement('div')
      content.classList.add('content')
      li.appendChild(content)
      const star = document.createElement('div')
      star.classList.add('star')
      li.appendChild(star)

      li.id = id
      li.classList.add('task')
      if (task.next) {
        star.classList.add('next')
      }
      li.classList.add(task.completed ? 'completed' : 'todo')
      content.innerHTML = task.name
      taskInfo.innerHTML = li.outerHTML
    }

    const commentContent = document.querySelector(".taskView .newCommentContent")
    commentContent.focus()
    commentContent.oninput = (e) => {
      commentContent.style.height = 'auto'
      commentContent.style.height = commentContent.scrollHeight + "px"
    }

    axios.get(`${url}/task?id=${id}`, {
      headers: {
        "Authorization": token
      }
    }).then(response => {
      const task = response.data

      if (taskInfo.innerHTML == "") {
        const li = document.createElement('li')
        const state = document.createElement('div')
        state.classList.add('state')
        li.appendChild(state)
        const content = document.createElement('div')
        content.classList.add('content')
        li.appendChild(content)
        const star = document.createElement('div')
        star.classList.add('star')
        li.appendChild(star)

        li.id = task.id
        li.classList.add('task')
        if (task.next) {
          star.classList.add('next')
        }
        li.classList.add(task.completed ? 'completed' : 'todo')
        content.innerHTML = task.name
        taskInfo.innerHTML = li.outerHTML
      }

      const ul = document.createElement('ul')
      if (task.comments) {
        task.comments.sort((a, b) => {
          if (a.pinned) return -1
          if (b.pinned) return 1
          if (a._created_at_gmt > b._created_at_gmt) return -1
          else if (a._created_at_gmt < b._created_at_gmt) return 1
          return 0
        }).forEach((comment) => {
          const li = document.createElement('li')
          li.classList.add('comment')
          if (comment.deleted) { li.classList.add('deleted') }
          if (comment.pinned) { li.classList.add('pinned') }
          const content = document.createElement('div')
          content.classList.add('content')
          li.appendChild(content)
          const info = document.createElement('div')
          info.classList.add('info')
          li.appendChild(info)
          info.innerHTML = `${comment._user_name} - ${comment._created_at_s }`
          ul.appendChild(li)
          if (comment.type == 'checklist') {
            const checklist = comment.body.split(String.fromCharCode(10))
            content.innerHTML = checklist.join('<br>')
          } else {
            content.innerHTML = comment.body
          }
        })
      }

      const taskResult = document.querySelector(".taskView .result")
      taskResult.innerHTML = ul.innerHTML || ''
      chrome.storage.sync.set({taskInfo: taskInfo.innerHTML, commentsList: taskResult.innerHTML})
    })
  }

  document.addEventListener('click', (e) => {
    if ((e.target.classList.contains('task') ||
         e.target.parentElement.classList.contains('task') ||
         e.target.parentElement.parentElement.parentElement.classList.contains('task') ||
         e.target.parentElement.parentElement.classList.contains('task')) &&
        !e.target.classList.contains('star') &&
        !e.target.classList.contains('projectLink') &&
        !e.target.classList.contains('state')
    ) {
      let target = e.target
      if (e.target.parentElement.classList.contains('task')) {
        target = e.target.parentElement
      } else if (e.target.parentElement.parentElement.classList.contains('task')) {
        target = e.target.parentElement.parentElement
      } else if (e.target.parentElement.parentElement.parentElement.classList.contains('task')) {
        target = e.target.parentElement.parentElement.parentElement
      }
      if (!target.parentElement.classList.contains('taskInfo')) {
        const completed = target.classList.contains('completed')
        const name = target.querySelector('.content').innerHTML
        const next = target.querySelector('.star').classList.contains('next')
        openTask(target.id, { next, completed, name })
      }
    } else if (e.target.classList.contains('state')) {
      const target = e.target.parentElement
      const taskId = target.id
      const completed = !target.classList.contains('completed')
      target.classList.toggle('completed')
      target.classList.toggle('todo')

      axios.put(`${url}/task`, `id=${taskId}&completed=${completed}`, {
        headers: {
          "Authorization": token
        },
      }).then(() => {
        calculateNextActionsNumber()
      }).catch(e => {
        target.classList.toggle('completed')
        target.classList.toggle('todo')
        alert(e)
      })
      chrome.storage.sync.set({taskInfo: target.outerHTML})
    } else if (e.target.classList.contains('star')) {
      const taskId = e.target.parentElement.id
      const next = !e.target.classList.contains('next')

      e.target.classList.toggle('next')
      axios.put(`${url}/task`, `id=${taskId}&next=${next}`, {
        headers: {
          "Authorization": token
        },
      }).then(() => {
        calculateNextActionsNumber()
      }).catch(e => {
        e.target.classList.toggle('next')
        alert(e)
      })
      chrome.storage.sync.set({taskInfo: e.target.parentElement.outerHTML})
    } else if (e.target.classList.contains('projectLink') ||
               e.target.parentElement.classList.contains('projectLink')) {
      let target = e.target
      if (e.target.parentElement.classList.contains('projectLink')) {
        target = e.target.parentElement
      }
      document.querySelector(".project .result").innerHTML = ""
      const projectName = target.querySelector(".name").innerHTML || ''
      openProject(target.id, projectName)
    } else if (e.target.classList.contains('btnSend')) {
      let taskName = document.querySelector(".project .name").value
      if (projectId == 'next_action') { taskName += " #!" }

      const reqAddTask = new XMLHttpRequest();
      reqAddTask.open("POST", `${url}/task`, false);
      reqAddTask.setRequestHeader("AUTHORIZATION", token);
      reqAddTask.send(`name=${taskName}&project_id=${projectId}`)
    } else if (e.target.classList.contains('back') ||
               e.target.parentElement.classList.contains('back')) {
      let taskId, projectId, projectName
      chrome.storage.sync.get(['taskId', 'projectId', 'projectName'], r => {
        taskId = r.taskId
        projectId = r.projectId
        projectName = r.projectName || ''

        if (taskId) {
          document.querySelector(".taskView").style.display = "none"
          const taskResult = document.querySelector(".taskView .result")
          taskResult.innerHTML = ""
          const taskInfo = document.querySelector(".taskView .taskInfo")
          taskInfo.innerHTML = ""
          chrome.storage.sync.set({taskId: null})
          openProject(projectId, projectName)
        } else if (projectId) {
          document.querySelector(".project").style.display = "none"
          document.querySelector(".back").style.visibility = "hidden"
          document.querySelector(".back .arrow").style.visibility = "hidden"
          const projectResult = document.querySelector(".project .result")
          projectResult.innerHTML = ""
          chrome.storage.sync.set({projectId: null, projectName: null})
          document.querySelector(".projectList").style.display = "block"
          calculateNextActionsNumber()
        }
      })
    } else if (e.target.classList.contains('btnSendComment')) {
      const taskId = document.querySelector(".taskView .taskInfo .task").id
      const commentText = document.querySelector(".newCommentContent").value
      const commentType = "markdown"
      const reqAddComment = new XMLHttpRequest();

      reqAddComment.open("POST", `${url}/task/comment`, false);
      reqAddComment.setRequestHeader("AUTHORIZATION", token);
      reqAddComment.send(`body=${commentText}&task_id=${taskId}&type=${commentType}`)
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
