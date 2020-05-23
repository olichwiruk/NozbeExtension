<template>
  <li
    :id="task.id"
    class="task"
    :class="[{ todo: !task.completed }, { completed: task.completed }]"
    >
    <div class="state" @click="toggleState"></div>

    <router-link tag="div" class="content" :to="{ name: 'task', params: { projectId: nextActions ? 'next_action' : task.project_id, taskId: task.id, taskProp: task } }">
      {{ task.name }}
      {{ task.comment_number > 0 ? ` [${task.comment_number}]` : "" }}
      <div class="info">

        <router-link tag="span"
          :to="{ name: 'project', params: { projectId: task.project_id } }"
          v-show="nextActions"
          :id="task.project_id"
          class="projectLink"
          :class="['x'+task._project_color]">
          <div class="name" style="display: inline;">
            {{ task._project_name }}
          </div>
          &#8226;
        </router-link>
        <span class="time" v-show="task._time_s"> {{ task._time_s }} &#8226;</span>
        <span class="recur" v-show="task.recur != 0 && task.recur != 1405"> {{ task._recur_name }} &#8226;</span>
        <span v-show="task.datetime"
          class="datetime"
          :class="{ overdated: isOverdated }">
          {{ task._datetime_s }} </span>
      </div>
    </router-link>
    <div class="star" :class="{ next: task.next }" @click="toggleNextAction"></div>
  </li>
</template>

<script>
import axios from "axios"
import { url, getToken, calculateNextActionsNumber } from "./shared"

export default {
  name: "task-list-item",
  props: ["task", "nextActions"],
  data() {
    return {};
  },
  computed: {
    isOverdated() {
      return (new Date(this.task.datetime).getTime() < Date.now())
    }
  },
  methods: {
    async toggleState() {
      const token = await getToken()
      const id = this.task.id
      const completed = !this.task.completed
      this.task.completed = completed

      axios.put(`${url}/task`, `id=${id}&completed=${completed}`, {
        headers: {
          "Authorization": token
        },
      }).catch(e => {
        this.task.completed = !completed
        alert(e)
      })
    },
    async toggleNextAction() {
      const token = await getToken()
      const id = this.task.id
      const next = !this.task.next
      this.task.next = next

      axios.put(`${url}/task`, `id=${id}&next=${next}`, {
        headers: {
          "Authorization": token
        },
      })
        .then(async r => await calculateNextActionsNumber())
        .catch(e => {
          this.task.next = !next
          alert(e)
        })
    },
  }
};
</script>

<style lang="scss" scoped>
.task {
  padding: 0 10px;
  cursor: pointer;
  list-style-type: none;
  border-bottom: 1px solid;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:nth-child(1) {
    border-top: 1px solid #dadada;
  }

  & .state {
    border: 1px solid #27343b;
    border-radius: 13px;
    min-height: 20px;
    min-width: 20px;

    &:hover {
      &:before {
        content: '';
        display: inline-block;
        width: 7px;
        height: 1px;
        transform: translateX(3px) translateY(2px) rotate(50deg);
        background-color: #27343b;
      }
      &:after {
        content: '';
        display: inline-block;
        width: 12px;
        height: 1px;
        transform: translateX(-1px) translateY(-1px) rotate(-63deg);
        background-color: #27343b;
      }
    }
  }

  &.todo {
    background-color: #ffffff;
    border-color: #dadada;
  }

  &.completed {
    color: #959595;
    background-color: #f9f9f9;
    border-color: #e7e7e7;

    & .state {
      border-color: #848484;

      &:before, &:after {
        background-color: #848484;
      }

      &:before {
        content: '';
        display: inline-block;
        width: 7px;
        height: 1px;
        transform: translateX(3px) translateY(2px) rotate(50deg);
        background-color: #27343b;
      }
      &:after {
        content: '';
        display: inline-block;
        width: 12px;
        height: 1px;
        transform: translateX(-1px) translateY(-1px) rotate(-63deg);
        background-color: #27343b;
      }
    }

    & .content .info {
      color: #cccccc;

      & .datetime.overdated {
        color: #cccccc;
        font-weight: 400;
      }
    }
  }

  & .content {
    flex-grow: 2;
    padding: 12px 0;
    margin: 0 10px;

    & .info {
      color: #888888;

      & .projectLink {
        cursor: pointer;

        &:hover {
          color: #454545;
        }

        &:before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          margin-right: 7px;
          border-radius: 7.5px;
          background-color: #27343b;
        }
      }

      & .datetime.overdated {
        color: #ca4343;
        font-weight: 600;
      }
    }
  }

  & .star {
    margin: 5px 0;
    position: relative;
    display: block;
    color: #61ca59;
    width: 0px;
    height: 0px;
    border-right: 10px solid transparent;
    border-bottom: 7px solid;
    border-bottom-color: #dadada;
    border-left: 10px solid transparent;
    transform: rotate(35deg);

    &:before {
      border-bottom: 8px solid;
      border-bottom-color: #dadada;
      border-left: 3px solid transparent;
      border-right: 3px solid transparent;
      position: absolute;
      height: 0;
      width: 0;
      top: -5px;
      left: -6px;
      display: block;
      content: '';
      transform: rotate(-35deg);
    }

    &:after {
      position: absolute;
      display: block;
      color: #61ca59;
      top: 0px;
      left: -10px;
      width: 0px;
      height: 0px;
      border-right: 10px solid transparent;
      border-bottom: 7px solid;
      border-bottom-color: #dadada;
      border-left: 10px solid transparent;
      transform: rotate(-70deg);
      content: '';
    }

    &.next {
      border-bottom-color: #61ca59;

      &:before, &:after {
        border-bottom-color: #61ca59;
      }
    }
  }
}
</style>
