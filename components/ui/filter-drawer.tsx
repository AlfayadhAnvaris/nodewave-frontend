interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  onReset?: () => void
  children: React.ReactNode
}

export function FilterDrawer({ isOpen, onClose, onReset, children }: FilterDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full rounded-t-3xl border-t border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Filter Transactions & Records</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">{children}</div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          {onReset && (
            <button
              type="button"
              onClick={() => {
                onReset()
                onClose()
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Reset Filters
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}
