<template>
  <div class="projectList">
    <ul>
      <project-list-item
        v-for="project in projects"
        :key="project.id"
        :id="project.id"
        :shared="project.shared"
        :project="project"
        :color="project.color">
        {{ project.name }}
        <template v-slot:tasksNumber>
          {{ project.tasksNumber }}
        </template>
      </project-list-item>
    </ul>
  </div>
</template>

<script>
import axios from "axios"
import { url, getToken } from "./shared"
import ProjectListItem from "./ProjectListItem"

export default {
  name: "project-list-view",
  components: {
    ProjectListItem
  },
  data() {
    return {
      projects: []
    };
  },
  beforeCreate() {
    chrome.storage.sync.get(['projectsList'], r => {
      if (r.projectsList) {
        this.projects = r.projectsList
      }
    })
  },
  async created() {
    const token = await getToken()
    const nextActionsNumber = await browser.browserAction.getBadgeText({})
    if(this.projects.length > 0) {
      this.projects[0].tasksNumber = nextActionsNumber || ''
    }

    axios.get(`${url}/list?type=project`, {
      headers: {
        "Authorization": token
      }
    }).then(response => {
      const projects = response.data.map(p => {
        return {
          id: p.id,
          name: p.name,
          color: p._color ? "x" + p._color : null,
          sort: p._sort,
          shared: p._shared == "y",
          tasksNumber: p._count
        }
      })
      projects.sort((a, b) => {
        if ( b.sort == 0 || a.sort > b.sort ){ return 1; }
        if ( a.sort == 0 || a.sort < b.sort ){ return -1; }
        return 0;
      })
      this.projects = [
        { id: "next_action", name: "Priority", tasksNumber: nextActionsNumber },
        ...projects
      ]
      chrome.storage.sync.set({projectsList: this.projects})
    })
  },
};
</script>

<style scoped>
</style>
