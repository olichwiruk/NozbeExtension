<template>
  <div class="commentList">
    <ul>
      <comment-list-item
        v-for="comment in comments"
        :key = "comment._created_at_gmt"
        :comment="comment"
        >
      </comment-list-item>
    </ul>
  </div>
</template>

<script>
import axios from "axios"
import { url, getToken } from "./shared"
import CommentListItem from "./CommentListItem"

export default {
  name: "comment-list",
  components: {
    CommentListItem
  },
  props: ["comments"],
  data() {
    return {};
  },
  computed: {
  },
};
</script>

<style scoped>
  ul {
    padding: 0;
  }
</style>
