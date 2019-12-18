document.addEventListener('DOMContentLoaded', () => {
  const url = "https://api.nozbe.com:3000"
  const nozbeAppHref = "https://app.nozbe.com"
  const client_id = "648e384ad16f95a1a762bfc420580a5d96aaa08e"
  let token

  chrome.storage.sync.get(['token'], r => {
    if (r.token) {
      token = r.token
      loadApp()
    } else {
      chrome.runtime.openOptionsPage()
    }
  })

  const loadApp = () => {
    let projectId
    let taskId

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
        document.querySelector(".projectList .result").innerHTML = r.projectsList
      }
    })

    const reqProjectList = new XMLHttpRequest();
    reqProjectList.open("GET", `${url}/list?type=project`, true);
    reqProjectList.setRequestHeader("AUTHORIZATION", token);
    reqProjectList.onreadystatechange = () => {
      if(reqProjectList.readyState == 4 && reqProjectList.status == 200) {
        const projects = JSON.parse(reqProjectList.responseText).map(p => {
          return { id: p.id, name: p.name, color: p._color, sort: p._sort, shared: p._shared == "y", tasksNumber: p._count }
        })

        const ul = document.createElement('ul')
        const liNextAction = document.createElement('li')
        ul.appendChild(liNextAction)
        liNextAction.id = "next_action"
        liNextAction.classList.add('projectLink')
        const name = document.createElement('div')
        name.classList.add('name')
        name.innerHTML = "Prioryty"
        liNextAction.appendChild(name)
        const number = document.createElement('span')
        number.classList.add('tasksNumber')
        liNextAction.appendChild(number)
        calculateNextActionsNumber()

        projects.sort((a, b) => {
          if ( b.sort == 0 || a.sort > b.sort ){ return 1; }
          if ( a.sort == 0 || a.sort < b.sort ){ return -1; }
          return 0;
        })
        projects.forEach(p => {
          const li = document.createElement('li')
          ul.appendChild(li)
          li.id = p.id
          li.classList.add('projectLink')
          if (p.shared) { li.classList.add('shared') }
          if (p.color.length != 0) {
            li.classList.add(`x${p.color}`)
          }
          const name = document.createElement('div')
          name.classList.add('name')
          name.innerHTML = p.name
          li.appendChild(name)
          const number = document.createElement('span')
          number.classList.add('tasksNumber')
          number.innerHTML = p.tasksNumber
          li.appendChild(number)
        })
        const projectListResult = document.querySelector(".projectList .result")
        projectListResult.innerHTML = ul.innerHTML || ''
        chrome.storage.sync.set({projectsList: projectListResult.innerHTML})
      }
    }
    reqProjectList.send()
  }

  const calculateNextActionsNumber = () => {
    const reqNextActionNumber = new XMLHttpRequest();
    reqNextActionNumber.open("GET", `${url}/tasks?type=next_action`, true);
    reqNextActionNumber.setRequestHeader("AUTHORIZATION", token);
    reqNextActionNumber.onreadystatechange = () => {
      if (reqNextActionNumber.readyState == 4 &&
        reqNextActionNumber.status == 200) {
        document.querySelector("li#next_action .tasksNumber")
          .innerHTML = JSON.parse(reqNextActionNumber.responseText).length
      }
    }
    reqNextActionNumber.send()
  }

  const openProject = (id, name) => {
    projectId = id
    chrome.storage.sync.set({projectId: id, projectName: name})
    document.querySelector(".projectList").style.display = "none"
    document.querySelector(".back").style.visibility = "visible"
    document.querySelector(".back .arrow").style.visibility = "visible"
    document.querySelector(".project").style.display = "block"
    document.querySelector(".projectName").innerHTML = name || ''
    document.querySelector(".project .name").focus()

    const reqProject = new XMLHttpRequest();
    if (id == "next_action") {
      reqProject.open("GET", `${url}/tasks?type=next_action`, true);
    } else {
      reqProject.open("GET", `${url}/tasks?type=project&id=${id}`, true);
    }

    reqProject.setRequestHeader("AUTHORIZATION", token);
    reqProject.onreadystatechange = () => {
      const ul = document.createElement('ul')

      if (reqProject.readyState == 4 && reqProject.status == 200) {
        JSON.parse(reqProject.responseText)
          .sort((a, b) => {
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
          })
        const projectResult = document.querySelector(".project .result")
        projectResult.innerHTML = ul.innerHTML || ''
        chrome.storage.sync.set({tasksList: projectResult.innerHTML})
      }
    };
    reqProject.send()
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

    const reqTaskDet = new XMLHttpRequest();
    reqTaskDet.open("GET", `${url}/task?id=${id}`, true);
    reqTaskDet.setRequestHeader("AUTHORIZATION", token);
    reqTaskDet.onreadystatechange = () => {
      if(reqTaskDet.readyState == 4 && reqTaskDet.status == 200) {
        const task = JSON.parse(reqTaskDet.responseText)

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
            content.innerHTML = comment.body
            info.innerHTML = `${comment._user_name} - ${comment._created_at_s }`
            ul.appendChild(li)
          })
        }

        const taskResult = document.querySelector(".taskView .result")
        taskResult.innerHTML = ul.innerHTML || ''
        chrome.storage.sync.set({taskInfo: taskInfo.innerHTML, commentsList: taskResult.innerHTML})
      }
    }
    reqTaskDet.send()
  }

  document.addEventListener('click', (e) => {
    if ((e.target.classList.contains('task') || 
         e.target.parentElement.classList.contains('task')) &&
        !e.target.classList.contains('star') &&
        !e.target.classList.contains('state')
    ) {
      let target = e.target
      if (e.target.parentElement.classList.contains('task')) {
        target = e.target.parentElement
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
      const reqTask = new XMLHttpRequest();
      target.classList.toggle('completed')
      target.classList.toggle('todo')
      reqTask.open("PUT", `${url}/task`, true);
      reqTask.setRequestHeader("AUTHORIZATION", token);
      reqTask.onreadystatechange = () => {
        if(reqTask.status != 200) {
          target.classList.toggle('completed')
          target.classList.toggle('todo')
          alert(reqTask.responseText)
        }
      }
      reqTask.send(`id=${taskId}&completed=${completed}`)
    } else if (e.target.classList.contains('star')) {
      const taskId = e.target.parentElement.id
      const next = !e.target.classList.contains('next')
      const reqNextAction = new XMLHttpRequest();
      e.target.classList.toggle('next')
      reqNextAction.open("PUT", `${url}/task`, true);
      reqNextAction.setRequestHeader("AUTHORIZATION", token);
      reqNextAction.onreadystatechange = () => {
        if(reqNextAction.status != 200) {
          e.target.classList.toggle('next')
          alert(reqNextAction.responseText)
        }
      }
      reqNextAction.send(`id=${taskId}&next=${next}`)
    } else if (e.target.classList.contains('projectLink') ||
               e.target.parentElement.classList.contains('projectLink')) {
      let target = e.target
      if (e.target.parentElement.classList.contains('projectLink')) {
        target = e.target.parentElement
      }
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
