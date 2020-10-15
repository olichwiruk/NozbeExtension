<template>
  <button @click="logout" class="btnLogout">Logout</button>
</template>

<script>
export default {
  name: "logout-button",
  data() {
    return {};
  },
  methods: {
    logout() {
      chrome.storage.sync.set({
        token: null, projectId: null, projectName: null,
        taskId: null, projectsList: null, tasksList: null,
        taskInfo: null, commentsList: null
      })
      chrome.browserAction.setBadgeText({ text: '' });
      window.close()
    }
  },
};
</script>

<style lang="scss" scoped>
  .btnLogout {
    border: 1px solid #575757;
    border-radius: 2px;
    color: #575757;
    background-color: rgba(0, 0, 0, .1);
    font-size: 11px;
    height: 100%;
    &:hover {
      color: #171717;
      cursor: pointer;
      background-color: rgba(0, 0, 0, .2);
    }
  }
</style>
