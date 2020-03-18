<template>
  <div>
    <div class="header">
      <button class="back">
        <div class="arrow hidden"></div>
      </button>
      <h1 class="title">Nozbe</h1>
      <button class="btnLogout">Logout</button>
    </div>

    <project-list-view></project-list-view>
    <project-view ref="projectView" :project="project || {}"></project-view>
    <task-view ref="taskView" :project="project || {}" :task="task || {}"></task-view>
  </div>
</template>

<script>
require("./popup.js")

import axios from "axios"
import { url, getToken } from "./shared"
import ProjectListView from "./ProjectListView"
import ProjectView from "./ProjectView"
import TaskView from "./TaskView"

export default {
  components: {
    ProjectListView,
    ProjectView,
    TaskView
  },
  data() {
    return {
      project: null,
      task: null
    };
  },
  methods: {
    async openProject(project) {
      const token = await getToken()
      this.project = project
      const id = project.id
      const name = project.name
      this.$refs.projectView.tasks = []
      this.$refs.projectView.fetchTasks()
      chrome.storage.sync.set({projectId: id, projectName: name})
      document.querySelector(".projectList").style.display = "none"
      document.querySelector(".taskView").style.display = "none"
      document.querySelector(".back").style.visibility = "visible"
      document.querySelector(".back .arrow").style.visibility = "visible"
      document.querySelector(".project").style.display = "block"
      this.$refs.projectView.$refs.taskInput.focus()
    },
    async openTask(task) {
      const token = await getToken()
      this.task = task
      chrome.storage.sync.set({taskId: task.id})
      this.$refs.taskView.comments = []
      this.$refs.taskView.fetchComments()
      chrome.storage.sync.set({taskInfo: task})
      document.querySelector(".projectList").style.display = "none"
      document.querySelector(".back").style.visibility = "visible"
      document.querySelector(".back .arrow").style.visibility = "visible"
      document.querySelector(".project").style.display = "none"
      document.querySelector(".taskView").style.display = "block"

      this.$refs.taskView.$refs.commentInput.focus()
    },
  },
  beforeCreate() {
    chrome.storage.sync.get(['projectId', 'projectName', 'taskInfo'], r => {
      if(r.projectId) {
        this.project = {
          id: r.projectId,
          name: r.projectName
        }
      }
      if(r.taskInfo) {
        this.task = r.taskInfo
      }
    })
  }
};
</script>

<style lang="scss">
.projectLink {
  &.x84ecaf:before { background-color: #84ecaf; }
  &.xcddc39:before { background-color: #cddc39; }
  &.x29e271:before { background-color: #29e271; }
  &.xaeb4bf:before { background-color: #aeb4bf; }
  &.x65808E:before { background-color: #65808E; }
  &.x7ADBEC:before { background-color: #7ADBEC; }
  &.x00B0FF:before { background-color: #00b0ff; }
  &.xffc24a:before { background-color: #ffc24a; }
  &.xFF9800:before { background-color: #FF9800; }
  &.xedcf9a:before { background-color: #edcf9a; }
  &.xc96d3f:before { background-color: #c96d3f; }
  &.xff947f:before { background-color: #ff947f; }
  &.xFF5252:before { background-color: #FF5252; }
  &.xFF61CF:before { background-color: #FF61CF; }
  &.xC555F9:before { background-color: #C555F9; }
}
</style>
