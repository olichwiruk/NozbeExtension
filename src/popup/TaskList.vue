<template>
  <div class="taskList">
    <ul>
      <task-list-item
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :nextActions="currentProject.id == 'next_action'"
        >
      </task-list-item>
    </ul>
  </div>
</template>

<script>
import axios from "axios"
import { url, getToken } from "./shared"
import TaskListItem from "./TaskListItem"

export default {
  name: "task-list",
  components: {
    TaskListItem
  },
  props: ["tasks"],
  data() {
    return {
    };
  },
  computed: {
    currentProject: function() {
      return this.$parent.project
    }
  },
};
</script>

<style scoped>
  ul {
    padding: 0;
  }
</style>
