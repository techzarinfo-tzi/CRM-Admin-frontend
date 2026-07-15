export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
