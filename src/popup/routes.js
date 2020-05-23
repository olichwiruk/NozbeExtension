import ProjectListView from "./ProjectListView"
import ProjectView from "./ProjectView"
import TaskView from "./TaskView"

export default [
  { path: '/projects', name: 'projects', component: ProjectListView, },
  { path: '/projects/:projectId', name: 'project', props: true, component: ProjectView, },
  { path: '/projects/:projectId/tasks/:taskId', name: 'task', props: true, component: TaskView, },
];
