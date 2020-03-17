<template>
  <li
    :id="task.id"
    class="task"
    :class="[{ todo: !task.completed }, { completed: task.completed }]"
    >
    <div class="state"></div>
    <div class="content">
      {{ task.name }}
      {{ task.comment_number > 0 ? ` [${task.comment_number}]` : "" }}
      <div class="info" v-show="nextActions">
        <span
          :id="task.project_id"
          @click="openProject"
          class="projectLink"
          :class="['x'+task._project_color]">
          <div class="name" style="display: inline;">
            {{ task._project_name }} 
          </div>
        </span>
        <span class="time" v-show="task._time_s">&#8226; {{ task._time_s }} </span>
        <span class="recur" v-show="task.recur != 1405">&#8226; {{ task._recur_name }} </span>
        <span v-show="task.datetime"
          class="datetime"
          :class="{ overdated: isOverdated(task.datetime) }">
          &#8226; {{ task._datetime_s }} </span>
      </div>
    </div>
    <div class="star" :class="{ next: task.next }"></div>
  </li>
</template>

<script>
export default {
  name: "task-list-item",
  props: ["task", "nextActions"],
  data() {
    return {};
  },
  methods: {
    isOverdated(datetime) {
      return (new Date(datetime).getTime() < Date.now())
    },
    openProject() {
      this.$root.$children[0].openProject({
        id: this.task.project_id,
        name: this.task._project_name
      })
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
