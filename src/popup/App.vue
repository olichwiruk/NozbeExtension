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

    <div class="project">
      <h2 class="projectName"></h2>
      <form>
        <input placeholder="Add task..." type="text" class="name"></input>
        <button style="display: none" class="btnSend"></button>
      </form>
      <br>
      <div class="result"></div>
    </div>

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

import ProjectListView from "./ProjectListView"

export default {
  components: {
    ProjectListView
  },
  data() {
    return {};
  },
};
</script>
