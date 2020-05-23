<template>
  <div class="taskView">
    <h2 class="projectName">{{ task._project_name }}</h2>
    <ul class="taskInfo">
      <task-list-item :task="task" :nextActions="false"></task-list-item>
    </ul>
    <textarea
      ref="commentInput"
      @input="autoscaleTextarea"
      v-model="comment.body"
      rows="2"
      placeholder="Add comment..."
      class="newCommentContent"></textarea>
    <button class="btnSendComment" @click="addComment">Add</button>

    <br><br>
    <comment-list :comments="comments"></comment-list>
  </div>
</template>

<script>
import axios from "axios"
import { url, getToken } from "./shared"
import TaskListItem from "./TaskListItem"
import CommentList from "./CommentList"

export default {
  name: "task-view",
  props: ["projectId", "taskId", "taskProp"],
  components: {
    TaskListItem,
    CommentList
  },
  data() {
    return {
      task: this.taskProp,
      comments: [],
      comment:  {
        body: "",
        type: "markdown"
      }
    };
  },
  methods: {
    async fetchComments() {
      const token = await getToken()
      axios.get(`${url}/task?id=${this.task.id}`, {
        headers: {
          "Authorization": token
        }
      }).then(response => {
        const task = response.data
        if (task.comments) {
          this.comments = task.comments.sort((a, b) => {
            if (a.pinned) return -1
            if (b.pinned) return 1
            if (a._created_at_gmt > b._created_at_gmt) return -1
            else if (a._created_at_gmt < b._created_at_gmt) return 1
            return 0
          }).map((comment) => {
            return {
              pinned: comment.pinned,
              deleted: comment.deleted,
              type: comment.type,
              body: comment.body,
              _user_name: comment._user_name,
              _created_at_gmt: comment._created_at_gmt,
              _created_at_s: comment._created_at_s
            }
          })
        } else {
          this.comments = []
        }

        chrome.storage.sync.set({commentsList: this.comments})
      })
    },
    autoscaleTextarea() {
      const commentInput = this.$refs.commentInput
      commentInput.style.height = 'auto'
      commentInput.style.height = commentInput.scrollHeight + "px"
    },
    async addComment() {
      this.$refs.commentInput.focus()
      const token = await getToken()
      axios.post(`${url}/task/comment`,
        `body=${this.comment.body}&task_id=${this.task.id}&type=${this.comment.type}`,
        {
          headers: {
            "Authorization": token
          }
        })
      this.comment.body = ''
      this.synchronize()
    },
    synchronize() {
      const commentsNumber = this.comments.length
      const intr = setInterval(function(fetchComments, comments) {
        fetchComments()
        if(commentsNumber == comments.length) {
          clearInterval(intr)
        }
      }, 1000, this.fetchComments, this.comments)
    },
  },
  created() {
    this.$parent.backTarget = {
      name: 'project',
      params: {
        project: {
          id: this.task.project_id,
          name: this.task._project_name
        }
      }
    }

  },
  async mounted() {
    chrome.storage.sync.get(['project', 'commentsList'], r => {
      /*
      if (r.taskInfo) {
        this.task = r.taskInfo
      }
      */
      /*
      if (r.commentsList) {
        this.comments = r.commentsList
      }
      */
    })

    const token = await getToken()
    axios.get(`${url}/task?id=${this.taskId}`, {
      headers: {
        "Authorization": token
      }
    }).then(response => {
      this.task = response.data
      this.comments = this.task.comments
    })

    this.$refs.commentInput.focus()
    this.fetchComments()
  },
};
</script>

<style scoped>
  ul {
    padding: 0;
  }
</style>
