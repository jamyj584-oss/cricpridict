export default function AdminDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success animate-pulse"></span>
            <span className="text-sm font-medium text-textMuted">System Online</span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-6 border-t-4 border-t-accent">
            <p className="text-textMuted text-sm font-semibold mb-1">Total Users</p>
            <p className="text-3xl font-bold text-white">---</p>
        </div>
        <div className="glass-card p-6 border-t-4 border-t-accent">
            <p className="text-textMuted text-sm font-semibold mb-1">Active Matches</p>
            <p className="text-3xl font-bold text-white">---</p>
        </div>
        <div className="glass-card p-6 border-t-4 border-t-accent">
            <p className="text-textMuted text-sm font-semibold mb-1">Total Teams Created</p>
            <p className="text-3xl font-bold text-white">---</p>
        </div>
        <div className="glass-card p-6 border-t-4 border-t-success">
            <p className="text-textMuted text-sm font-semibold mb-1">Pending KYC</p>
            <p className="text-3xl font-bold text-white">---</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 min-h-[300px]">
              <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Recent Matches</h3>
              <p className="text-textMuted text-sm">Fetch Firestore `matches` here...</p>
          </div>
          <div className="glass-card p-6 min-h-[300px]">
              <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">System Alerts</h3>
              <p className="text-textMuted text-sm">No new alerts.</p>
          </div>
      </div>
    </div>
  );
}
