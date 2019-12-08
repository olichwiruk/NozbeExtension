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
          return { id: p.id, name: p.name, color: p._color, sort: p._sort, shared: p._shared == "y"}
        })

        const ul = document.createElement('ul')
        const liNextAction = document.createElement('li')
        ul.appendChild(liNextAction)
        liNextAction.id = "next_action"
        liNextAction.classList.add('projectLink')
        liNextAction.innerHTML = liNextAction.innerHTML + "Priorytety"

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
    document.querySelector(".back .arrow").style.visibility = "visible"
    document.querySelector(".project").style.display = "block"
    document.querySelector(".projectName").innerHTML = name
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

      if (reqProject.readyState == 4) {
        if(reqProject.status == 200){
          JSON.parse(reqProject.responseText)
            .sort((a, b) => {
              if (a.completed < b.completed) { return -1 }
              if (a.completed > b.completed) { return 1 }
              return 0
            }).forEach(t => {
              const li = document.createElement('li')
              const content = document.createElement('div')
              const star = document.createElement('div')
              star.classList.add('star')
              li.appendChild(content)
              li.appendChild(star)
              ul.appendChild(li)
              li.id = t.id
              li.classList.add('task')
              if (t.next) {
                star.classList.add('next')
              }
              li.classList.add(t.completed ? 'completed' : 'todo')
              content.innerHTML = t.name
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
    if ((e.target.classList.contains('task') || 
         e.target.parentElement.classList.contains('task')) &&
        !e.target.classList.contains('star')
    ) {
      let target = e.target
      if (e.target.parentElement.classList.contains('task')) {
        target = e.target.parentElement
      }
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
    } else if (e.target.classList.contains('projectLink')) {
      openProject(e.target.id, e.target.innerHTML)
    } else if (e.target.classList.contains('btnSend')) {
      let taskName = document.querySelector(".project .name").value
      if (projectId == 'next_action') { taskName += " #!" }

      const reqAddTask = new XMLHttpRequest();
      reqAddTask.open("POST", `${url}/task`, false);
      reqAddTask.setRequestHeader("AUTHORIZATION", token);
      reqAddTask.send(`name=${taskName}&project_id=${projectId}`)
    } else if (e.target.classList.contains('back') ||
               e.target.parentElement.classList.contains('back')) {
      document.querySelector(".project").style.display = "none"
      document.querySelector(".back .arrow").style.visibility = "hidden"
      const projectResult = document.querySelector(".project .result")
      projectResult.innerHTML = ""
      chrome.storage.sync.set({projectId: null, projectName: null})
      document.querySelector(".projectList").style.display = "block"
    } else if (e.target.classList.contains('btnLogout')) {
      chrome.storage.sync.set({ token: null })
      document.querySelector(".projectList .result").innerHTML = "Loged out"
    } else if (e.target.classList.contains('title')) {
      chrome.tabs.create({ url: nozbeAppHref });
    } else if (e.target.classList.contains('projectName')) {
      chrome.tabs.create({ url: `${nozbeAppHref}/#projects-${projectId}`});
    }
  })
});
