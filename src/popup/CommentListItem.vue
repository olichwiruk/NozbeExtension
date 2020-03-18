<template>
  <li class="comment"
    :class="{ pinned: comment.pinned, deleted: comment.deleted }">
    <div class="content">{{ parseBody(comment) }}</div>
    <div class="info">{{ comment._user_name }} - {{ comment._created_at_s }}</div>
  </li>
</template>

<script>
export default {
  name: "comment-list-item",
  props: ["comment"],
  data() {
    return {};
  },
  methods: {
    parseBody(comment) {
      return comment.body
    }
  }
};
</script>

<style lang="scss" scoped>
  .comment {
    .content {
      white-space: pre-line;
    }
  }
</style>
