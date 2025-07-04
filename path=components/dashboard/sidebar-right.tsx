export default function SidebarRight() {
  return (
    <div className="sticky top-20 space-y-6">
      <AIAgentSummary   className="card-modern glass-elevated" />
      <QuickActions     className="card-modern" />
      <RecentAIActions  className="card-modern" />
      <AITipsCard       className="card-modern" />
    </div>
  )
}
