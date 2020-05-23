<template>
  <button @click="goBack" class="back">
    <div v-show="target" class="arrow"></div>
  </button>
</template>

<script>
export default {
  name: "back-button",
  props: ["target"],
  data() {
    return {};
  },
  methods: {
    goBack() {
      this.$router.push(this.target)
      if(this.target.name == 'project') {
        chrome.storage.sync.set({taskId: null, task: null, commentsList: []})
      } else {
        chrome.storage.sync.set({projectId: null, project: null})
      }
      this.$parent.backTarget = null
    }
  },
};
</script>

<style lang="scss" scoped>
  .back {
    padding-top: 3px;
    border: 0px;
    background-color: transparent;
    width: 35px;
    height: 100%;
    cursor: pointer;

    &:focus {
      outline: 0;

      .arrow {
        color: #373737;
      }
    }

    &:hover {
      .arrow {
        color: #373737;
      }
    }

    .arrow {
      vertical-align: middle;
      box-sizing: border-box;
      color: #666;
      width: 0;
      height: 0;
      border-width: 6px;
      border-style: solid;
      border-bottom-color: transparent;
      border-left-color: transparent;
      margin: 5px;
      transform: rotate(-135deg);

      &:before {
        content: "";
        box-sizing: border-box;
        right: 0;
        top: -3px;
        position: absolute;
        height: 4px;
        box-shadow: inset 0 0 0 32px;
        transform: rotate(-45deg);
        width: 15px;
        transform-origin: right top;
      }
    }

    .arrow.hidden {
      visibility: hidden;
    }
  }
</style>
