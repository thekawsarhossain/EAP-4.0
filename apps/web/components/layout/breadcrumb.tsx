"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { buildCrumbs } from "@/lib/breadcrumb"
import { useGetProjectQuery } from "@/store/api/projects-api"
import Link from "next/link"
import { Fragment } from "react"
import { usePathname } from "next/navigation"

function ProjectNameLabel({ id }: Readonly<{ id: string }>) {
  const { data } = useGetProjectQuery(id)
  return <>{data?.name ?? "Project"}</>
}

function CrumbLabel({ href, label }: Readonly<{ href: string; label: string }>) {
  const segments = href.split("/").filter(Boolean)
  const segment = segments.at(-1) ?? ""
  const parent = segments.at(-2) ?? ""

  if (parent === "projects") {
    return <ProjectNameLabel id={segment} />
  }
  return <>{label}</>
}

export function AppBreadcrumb() {
  const crumbs = buildCrumbs(usePathname())

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {crumbs.map(({ href, label, isLast }, i) => {
          const isFirst = i === 0
          const hiddenOnMobile = isFirst && !isLast

          return (
            <Fragment key={href}>
              {i > 0 && (
                <BreadcrumbSeparator
                  className={`shrink-0 ${i === 1 ? "hidden sm:flex" : ""}`}
                />
              )}
              <BreadcrumbItem
                className={isLast ? "min-w-0" : `shrink-0 ${hiddenOnMobile ? "hidden sm:flex" : ""}`}
              >
                {isLast ? (
                  <BreadcrumbPage className="block truncate">
                    <CrumbLabel href={href} label={label} />
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href} />}>
                    <CrumbLabel href={href} label={label} />
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
