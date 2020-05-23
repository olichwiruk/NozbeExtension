<template>
    <router-link :to="{ name: 'project', params: { projectId: project.id, projectProp: project } }">
  <li class="projectLink"
    :class="[{ shared }, color]">
      <div class="name"><slot /></div>
      <span class="tasksNumber">
        <slot name="tasksNumber" />
      </span>
  </li>
    </router-link>
</template>

<script>
export default {
  name: "project-list-item",
  props: ["shared", "color", "project"],
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
}
</style>
