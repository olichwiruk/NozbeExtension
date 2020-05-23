<template>
  <div class="project">
    <h2 class="projectName">{{ project.name }}</h2>
    <input
      type="text"
      class="name"
      ref="taskInput"
      v-model="taskName"
      @keyup.enter="addTask"
      placeholder="Add task..."></input>
    <br>
    <task-list :tasks="tasks"></task-list>
  </div>
</template>

<script>
import axios from "axios"
import { url, getToken, calculateNextActionsNumber } from "./shared"
import TaskList from "./TaskList"

export default {
  name: "project-view",
  components: {
    TaskList
  },
  props: ["projectId", "projectProp"],
  data() {
    return {
      project: this.projectProp || { id: this.projectId },
      taskName: '',
      tasks: []
    };
  },
  methods: {
    synchronize() {
      const tasksNumber = this.tasks.length
      const intr = setInterval(function(fetchTasks, tasks) {
        fetchTasks()
        if(tasksNumber == tasks.length) {
          clearInterval(intr)
        }
      }, 1000, this.fetchTasks, this.tasks)
    },
    async addTask() {
      const token = await getToken()
      if (this.project.id == 'next_action' && this.taskName.length > 0) {
        this.taskName += " #!"
      }
      axios.post(`${url}/task`, `name=${this.taskName}&project_id=${this.project.id}`, {
        headers: {
          "Authorization": token
        }
      }).then(async r => await calculateNextActionsNumber())
      this.taskName = ''
      this.synchronize()
    },
    async fetchTasks() {
      const token = await getToken()
      const id = this.project.id
      const name = this.project.name
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
        this.tasks = response.data.sort((a, b) => {
          if (a.completed < b.completed) { return -1 }
          if (a.completed > b.completed) { return 1 }
          return 0
        }).map(t => {
          let commentNumber = 0
          if (t._comment_count) {
            commentNumber = t._comment_count
          } else if (t.comments){
            commentNumber = t.comments.filter(c => !c.deleted).length
          }

          return {
            id: t.id, name: t.name, completed: t.completed,
            project_id: t.project_id, _project_color: t._project_color,
            _project_name: t._project_name, _time_s: t._time_s,
            recur: t.recur, _recur_name: t._recur_name,
            datetime: t.datetime, _datetime_s: t._datetime_s,
            next: t.next, comment_number: commentNumber
          }
        })
        chrome.storage.sync.set({tasksList: this.tasks})
      })
    }
  },
  beforeCreate() {
    chrome.storage.sync.get(['tasksList', 'projectId', 'projectName'], r => {
      if(this.project.id != r.projectId) { return }
      if (r.projectName) {
        this.project.name = r.projectName
      }
      if (r.tasksList) {
        this.tasks = r.tasksList
      }
    })

    this.$parent.backTarget = { name: 'projects' }
  },
  async mounted() {
    if(this.project.id == "next_action") {
      chrome.storage.sync.set({
        projectId: this.project.id,
        projectName: 'Priority'
      })
    } else {
      const token = await getToken()
      axios.get(`${url}/project?id=${this.projectId}`, {
        headers: {
          "Authorization": token
        }
      }).then(response => {
        const project = response.data
        this.project = {
          id: project.id,
          name: project.name
        }
        chrome.storage.sync.set({
          projectId: project.id,
          projectName: project.name
        })
      })
    }

    this.fetchTasks()
    this.$refs.taskInput.focus()
  },
  updated() {
    this.$refs.taskInput.focus()
  }
}
</script>

<style lang="scss" scoped>
  input {
    box-sizing: border-box;
    padding: 5px 5px;
    width: 100%;
    color: #151515;
    border: 1px solid #c7c7c7;
    border-radius: 3px;

    &:focus {
      outline-color: #61ca59;
    }
  }
</style>
