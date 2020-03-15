<template>
  <li class="projectLink"
    :class="[{ shared }, color]">
    <div class="name"><slot /></div>
    <span class="tasksNumber">
      <slot name="tasksNumber" />
    </span>
  </li>
</template>

<script>
export default {
  name: "project-list-item",
  props: ["shared", "color"],
  data() {
    return {};
  }
};
</script>

<style lang="scss" scoped>
.projectLink {
  cursor: pointer;
  list-style-type: none;
  padding: 8px 10px;
  font-size: 14px;

  .name {
    display: inline-block;
    margin: 0;
  }

  .tasksNumber {
    float: right;
    color: #888888;
    font-weight: 400;
  }

  &.shared {
    font-weight: 600;
  }

  &:before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 7px;
    -moz-border-radius: 7.5px;
    -webkit-border-radius: 7.5px;
    border-radius: 7.5px;
    background-color: #27343b;
  }
  &:hover:before {
    width: 12px;
    height: 12px;
  }

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
