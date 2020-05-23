<template>
  <div>
    <div class="header">
      <button @click="goBack" class="back">
        <div v-show="backTarget" class="arrow"></div>
      </button>
      <h1 class="title">Nozbe</h1>
      <button class="btnLogout">Logout</button>
    </div>

    <router-view :key="$route.fullPath"></router-view>
  </div>
</template>

<script>
require("./popup.js")

import axios from "axios"
import { url, getToken, calculateNextActionsNumber } from "./shared"

export default {
  data() {
    return {
      project: null,
      task: null,
      backTarget: null
    };
  },
  methods: {
    goBack() {
      this.$router.push(this.backTarget)
      this.backTarget = null
    }
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
  },
  async created() {
    if(await getToken()) {
      await calculateNextActionsNumber()
    } else {
      chrome.runtime.openOptionsPage()
    }
  }
};
</script>

<style lang="scss">
a {
  color: #000;
  text-decoration: none;
}
.projectLink {
  &:before { background-color: #27343b; }
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
