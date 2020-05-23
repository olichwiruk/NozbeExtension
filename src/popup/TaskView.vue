<template>
  <div class="taskView">
    <h2 @click="openTask" class="projectName">{{ task._project_name }}</h2>
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
    <comment-list :comments="sortedComments"></comment-list>
  </div>
</template>

<script>
import axios from "axios"
import { url, nozbeAppHref, getToken } from "./shared"
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
  computed: {
    sortedComments() {
      return this.comments.sort((a, b) => {
        if (a.pinned) return -1
        if (b.pinned) return 1
        if (a._created_at_gmt > b._created_at_gmt) return -1
        else if (a._created_at_gmt < b._created_at_gmt) return 1
        return 0
      })
    }
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
          this.comments = task.comments.map((comment) => {
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
    openTask() {
      chrome.tabs.create({
        url: `${nozbeAppHref}/#projects-${this.task.project_id}/task-${this.task.id}`
      });
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
  async mounted() {
    this.$parent.backTarget = {
      name: 'project',
      params: {
        project: {
          id: this.task.project_id,
          name: this.task._project_name
        }
      }
    }

    chrome.storage.sync.get(['commentsList'], r => {
      if (r.commentsList) {
        this.comments = r.commentsList
      }
    })

    chrome.storage.sync.set({ taskId: this.taskId, task: this.task })

    const token = await getToken()
    axios.get(`${url}/task?id=${this.taskId}`, {
      headers: {
        "Authorization": token
      }
    }).then(response => {
      this.task = response.data
      this.comments = this.task.comments || []
    })

    this.$refs.commentInput.focus()
    this.fetchComments()
  },
};
</script>

<style lang="scss" scoped>
  .projectName {
    margin: 8px 0;
    cursor: pointer;
  }

  .newCommentContent {
    font-family: inherit;
    resize: none;
    min-width: 98%;
    color: #151515;
    border: 1px solid #c7c7c7;
    border-radius: 3px;
    outline-color: #61ca59;
  }

  .btnSendComment {
    float: right;
    border: 1px solid #575757;
    border-radius: 2px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    background-color: #62cd63;
    height: 100%;

    &:hover {
      cursor: pointer;
    }
  }
</style>
