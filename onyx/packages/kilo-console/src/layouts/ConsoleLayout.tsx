import { createSignal } from "solid-js"
import type { JSX } from "solid-js"
import { AppHeader } from "../components/app-header/AppHeader"
import { AppSidebar } from "../components/app-sidebar/AppSidebar"
import type { Path } from "../shared/navigation"

type Props = {
  children: JSX.Element
  path: Path
}

export function ConsoleLayout(props: Props) {
  const [collapsed, setCollapsed] = createSignal(false)

  return (
    <div class="cloud-app-shell dark">
      <AppSidebar
        path={props.path}
        collapsed={collapsed()}
        onToggle={() => setCollapsed(!collapsed())}
      />
      <div class="cloud-main-area">
        <AppHeader
          collapsed={collapsed()}
          onToggleSidebar={() => setCollapsed(!collapsed())}
        />
        <main class="cloud-content-scroll">{props.children}</main>
      </div>
    </div>
  )
}
