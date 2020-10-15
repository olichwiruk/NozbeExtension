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
import { url, getToken } from "../../shared"
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
  .comment {
    list-style-type: none;
    border: 1px solid #575757;
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0;
  }

  .comment.deleted {
    border-color: #acacac;
    color: #acacac;
  }

  .comment.pinned {
    border-style: dashed;
  }
</style>
