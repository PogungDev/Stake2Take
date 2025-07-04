import SidebarRight from '@/components/dashboard/sidebar-right'
import HeaderBar     from '@/components/dashboard/header-bar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-muted to-gray-100">
      <HeaderBar />                                             {/* 1. sticky header */}
      <main className="grid grid-cols-12 gap-8 max-w-screen-2xl mx-auto pt-10 px-6">
        <section className="col-span-12 xl:col-span-9 space-y-8">{children}</section>
        <aside   className="hidden xl:block col-span-3">
          <SidebarRight />                                      {/* 2. sticky sidebar */}
        </aside>
      </main>
    </div>
  )
}
