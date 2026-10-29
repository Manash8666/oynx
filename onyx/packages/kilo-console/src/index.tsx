import "@kilocode/kilo-web-ui/styles"
import { Router, Route } from "@solidjs/router"
import { lazy } from "solid-js"
import { render } from "solid-js/web"
import App from "./App"
import "./styles.css"
import { ProfileRoute } from "./routes/profile/ProfileRoute"
import { OrganizationsRoute } from "./routes/cloud/OrganizationsRoute"
import { UsageRoute } from "./routes/cloud/UsageRoute"
import { CloudAgentRoute } from "./routes/cloud/CloudAgentRoute"
import { SessionsRoute } from "./routes/cloud/SessionsRoute"
import { WebhooksRoute } from "./routes/cloud/WebhooksRoute"
import { CodeReviewerRoute } from "./routes/cloud/CodeReviewerRoute"
import { SecurityAgentRoute } from "./routes/cloud/SecurityAgentRoute"
import { ProjectsRoute } from "./routes/projects/ProjectsRoute"
import { configSections } from "./routes/config/sections"

const ProjectConsoleRoute = lazy(() =>
  import("./routes/projects/ProjectConsoleRoute").then((mod) => ({ default: mod.ProjectConsoleRoute })),
)
const ConfigLayout = lazy(() => import("./layouts/ConfigLayout").then((mod) => ({ default: mod.ConfigLayout })))
const LoginRoute = lazy(() => import("./routes/profile/LoginRoute").then((mod) => ({ default: mod.LoginRoute })))

const root = document.getElementById("root")
if (!root) throw new Error("Missing root element")

const base = import.meta.env.BASE_URL.replace(/\/$/, "")

function routes() {
  return configSections.map((item) => <Route path={item.path} component={item.component} />)
}

render(
  () => (
    <Router root={App} base={base || undefined}>
      <Route path="/" component={ProfileRoute} />
      <Route path="/profile" component={ProfileRoute} />
      <Route path="/organizations" component={OrganizationsRoute} />
      <Route path="/usage" component={UsageRoute} />
      <Route path="/cloud-agent" component={CloudAgentRoute} />
      <Route path="/sessions" component={SessionsRoute} />
      <Route path="/webhooks" component={WebhooksRoute} />
      <Route path="/code-reviewer" component={CodeReviewerRoute} />
      <Route path="/security-agent" component={SecurityAgentRoute} />
      <Route path="/projects" component={ProjectsRoute} />
      <Route path="/projects/:project" component={ProjectConsoleRoute} />
      <Route path="/projects/:project/settings" component={ConfigLayout}>
        {routes()}
      </Route>
      <Route path="/login" component={LoginRoute} />
      <Route path="/onyx/login" component={LoginRoute} />
      <Route path="/kilo/login" component={LoginRoute} />
      <Route path="/settings" component={ConfigLayout}>
        {routes()}
      </Route>
      <Route path="/config" component={ConfigLayout}>
        {routes()}
      </Route>
      <Route path="*" component={ProfileRoute} />
    </Router>
  ),
  root,
)
