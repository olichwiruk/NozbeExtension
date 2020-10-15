import ProjectListView from "./components/ProjectListView/ProjectListView"
import ProjectView from "./components/ProjectView/ProjectView"
import TaskView from "./components/TaskView/TaskView"

export default [
  { path: '/projects', name: 'projects', component: ProjectListView, },
  { path: '/projects/:projectId', name: 'project', props: true, component: ProjectView, },
  { path: '/projects/:projectId/tasks/:taskId', name: 'task', props: true, component: TaskView, },
];
