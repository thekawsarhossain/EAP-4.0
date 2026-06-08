"use client"

import { EmptyState } from "@/components/shared/empty-state"
import { MemberCardsSkeleton } from "@/components/shared/skeletons"
import { SearchInput } from "@/components/shared/search-input"
import { MemberCard } from "@/components/team/member-card"
import { Spinner } from "@/components/ui/spinner"
import { useDebounce } from "@/hooks/use-debounce"
import { useGetUsersQuery } from "@/store/api/users-api"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"
import { useState } from "react"

export default function TeamPage() {
  const [search, setSearch] = useState("")
  const debounced = useDebounce(search, 300)

  const { data: users = [], isLoading, isFetching } = useGetUsersQuery({
    search: debounced || undefined,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search members..."
          className="w-56"
        />
        {(isFetching || search !== debounced) && (
          <Spinner className="h-4 w-4 text-primary" />
        )}
      </div>

      {isLoading ? (
        <MemberCardsSkeleton />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No members found" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className={cn(isFetching && "animate-pulse")}>
              <MemberCard user={user} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
