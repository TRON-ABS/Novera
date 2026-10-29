import { useEffect } from 'react'
import {
  createMemoryHistory, createRootRoute, createRoute, createRouter,
  Outlet, useSearch,
} from '@tanstack/react-router'
import type { AnyRoute } from '@tanstack/react-router'

export type DashboardPageLoaders = Record<string, () => Promise<{ Route: AnyRoute }>>

/** Reuse complete pages, route parameters and validation in a private history. */
export async function createDashboardRouter(
  initialPath: string, onExit: (model?: ThreadModel) => void, pages: DashboardPageLoaders
) {
  const root = createRootRoute({ component: Outlet })
  function Complete() {
    const search = useSearch({ strict: false }) as { threadModel?: ThreadModel }
    useEffect(() => { onExit(search.threadModel) }, [search.threadModel])
    return null
  }
  const children = await Promise.all(Object.entries(pages).map(async ([file, load]) => {
    const { Route } = await load()
    const path = file.replace('../routes', '').replace(/\.tsx$/, '').replace(/\/index$/, '/')
    return createRoute({ getParentRoute: () => root, path,
      component: Route.options.component, validateSearch: Route.options.validateSearch })
  }))
  const exit = createRoute({ getParentRoute: () => root, path: '/', component: Complete,
    validateSearch: (search: Record<string, unknown>) => search })
  return createRouter({ routeTree: root.addChildren([...children, exit]),
    history: createMemoryHistory({ initialEntries: [initialPath] }) })
}
