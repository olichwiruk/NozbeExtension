document.addEventListener('DOMContentLoaded', () => {
  const url = "https://api.nozbe.com:3000"
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

    chrome.storage.sync.get(['projectId', 'projectName'], r => {
      if (r.projectId) {
        projectId = r.projectId
        openProject(r.projectId, r.projectName)
      }
    })

    const reqProjectList = new XMLHttpRequest();
    reqProjectList.open("GET", `${url}/list?type=project`, true);
    reqProjectList.setRequestHeader("AUTHORIZATION", token);
    reqProjectList.onreadystatechange = () => {
      if(reqProjectList.status == 200){
        const projects = JSON.parse(reqProjectList.responseText).map(p => {
          return { id: p.id, name: p.name }
        })

        const ul = document.createElement('ul')
        projects.forEach(p => {
          const li = document.createElement('li')
          ul.appendChild(li)
          li.id = p.id
          li.classList.add('projectLink')
          li.innerHTML = li.innerHTML + p.name
        })
        const projectListResult = document.querySelector(".projectList .result")
        projectListResult.innerHTML = ul.innerHTML
      } else {
        alert(reqProjectList.status)
      }
    }
    reqProjectList.send()
  }

  const openProject = (id, name) => {
    projectId = id
    chrome.storage.sync.set({projectId: id, projectName: name})
    document.querySelector(".projectList").style.display = "none"
    document.querySelector(".project").style.display = "block"
    document.querySelector(".projectName").innerHTML = name
    document.querySelector(".project .name").focus()

    const reqProject = new XMLHttpRequest();
    reqProject.open("GET", `${url}/tasks?type=project&id=${id}`, true);
    reqProject.setRequestHeader("AUTHORIZATION", token);
    reqProject.onreadystatechange = () => {
      const ul = document.createElement('ul')

      if (reqProject.readyState == 4) {
        if(reqProject.status == 200){
          console.log(reqProject.responseText)
          JSON.parse(reqProject.responseText)
            .sort((a, b) => {
              if (a.completed < b.completed) { return -1 }
              if (a.completed > b.completed) { return 1 }
              return 0
            }).forEach(t => {
              const li = document.createElement('li')
              ul.appendChild(li)
              li.id = t.id
              li.classList.add('task')
              li.classList.add(t.completed ? 'completed' : 'todo')
              li.innerHTML = li.innerHTML + t.name
            })
          const projectResult = document.querySelector(".project .result")
          projectResult.innerHTML = ul.innerHTML
        } else {
          console.log(reqProject.responseText)
        }
      }
    };
    reqProject.send()
  }

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('task')) {
      const taskId = e.target.id
      const completed = !e.target.classList.contains('completed')
      const reqTask = new XMLHttpRequest();
      reqTask.open("PUT", `${url}/task`, true);
      reqTask.setRequestHeader("AUTHORIZATION", token);
      reqTask.onreadystatechange = () => {
        if(reqTask.status == 200) {
          e.target.classList.toggle('completed').toggle('todo')
        } else {
          alert(reqTask.responseText)
        }
      }
      reqTask.send(`id=${taskId}&completed=${completed}`)
    } else if (e.target.classList.contains('projectLink')) {
      openProject(e.target.id, e.target.innerHTML)
    } else if (e.target.classList.contains('btnSend')) {
      const taskName = document.querySelector(".project .name").value
      const reqAddTask = new XMLHttpRequest();
      reqAddTask.open("POST", `${url}/task`, false);
      reqAddTask.setRequestHeader("AUTHORIZATION", token);
      reqAddTask.send(`name=${taskName}&project_id=${projectId}`)
    } else if (e.target.classList.contains('title')) {
      document.querySelector(".project").style.display = "none"
      const projectResult = document.querySelector(".project .result")
      projectResult.innerHTML = ""
      chrome.storage.sync.set({projectId: null, projectName: null})
      document.querySelector(".projectList").style.display = "block"
    } else if (e.target.classList.contains('btnLogout')) {
      chrome.storage.sync.set({ token: null })
      document.querySelector(".projectList .result").innerHTML = "Loged out"
    }
  })
});
