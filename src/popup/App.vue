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
    <project-view ref="projectView" :project="project"></project-view>

    <div class="taskView">
      <h2 class="projectName"></h2>
      <ul class="taskInfo"></ul>
      <form>
        <textarea rows="3" placeholder="Add comment..." class="newCommentContent"></textarea>
        <button class="btnSendComment">Add</button>
      </form>
      <br>
      <div class="result"></div>
    </div>
  </div>
</template>

<script>
require("./popup.js")

import axios from "axios"
import { url, getToken } from "./shared"
import ProjectListView from "./ProjectListView"
import ProjectView from "./ProjectView"

export default {
  components: {
    ProjectListView,
    ProjectView
  },
  data() {
    return {
      project: {
        id: null,
        name: ''
      }
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
      document.querySelector(".project .name").focus()
    }
  },
  beforeCreate() {
    chrome.storage.sync.get(['projectId', 'projectName'], r => {
      if(r.projectId) {
        this.project = {
          id: r.projectId,
          name: r.projectName
        }
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
