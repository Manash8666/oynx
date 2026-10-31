import { createSignal, Show } from "solid-js"
import type { JSX } from "solid-js"
import { useLocation } from "@solidjs/router"
import { AppHeader } from "../components/app-header/AppHeader"
import { AppSidebar } from "../components/app-sidebar/AppSidebar"
import type { Path } from "../shared/navigation"

type Props = {
  children: JSX.Element
  path: Path
}

export function ConsoleLayout(props: Props) {
  const [collapsed, setCollapsed] = createSignal(false)
  const loc = useLocation()

  const isAuthPage = () =>
    loc.pathname === "/login" ||
    loc.pathname === "/onyx/login" ||
    loc.pathname === "/kilo/login" ||
    loc.pathname.endsWith("/login")

  return (
    <div class="cloud-app-shell dark">
      <Show when={!isAuthPage()}>
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
      </Show>
      <Show when={isAuthPage()}>
        <main class="cloud-auth-full">{props.children}</main>
      </Show>
    </div>
  )
}
