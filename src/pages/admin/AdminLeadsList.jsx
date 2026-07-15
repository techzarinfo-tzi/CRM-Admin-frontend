import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { listAdminLeads, toggleLeadStatus, deleteLead } from '@/api/lead'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useSocket } from '@/context/SocketContext'

export default function AdminLeadsList() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const socket = useSocket()

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await listAdminLeads({ search, status: status || undefined })
      setLeads(res.data.leads)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchLeads, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status])

  useEffect(() => {
    if (!socket) return

    const handleNewLead = (lead) => {
      if (search || status) return
      setLeads((prev) => [lead, ...prev])
    }

    socket.on('lead:new', handleNewLead)
    return () => socket.off('lead:new', handleNewLead)
  }, [socket, search, status])

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleLeadStatus(id)
      setLeads((prev) => prev.map((l) => (l._id === id ? res.data.lead : l)))
      toast.success(`Marked as ${res.data.lead.status}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = async () => {
    const id = pendingDeleteId
    setPendingDeleteId(null)
    try {
      await deleteLead(id)
      setLeads((prev) => prev.filter((l) => l._id !== id))
      toast.success('Lead deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lead')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Leads</h2>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Country</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Requirements</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Received</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  No leads found.
                </td>
              </tr>
            )}
            {!loading &&
              leads.map((lead) => (
                <tr key={lead._id}>
                  <td className="max-w-40 truncate px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                  <td className="max-w-48 truncate px-4 py-3 text-gray-500">{lead.email}</td>
                  <td className="px-4 py-3 text-gray-500">{lead.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{lead.country || '-'}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-500" title={lead.requirements}>
                    {lead.requirements}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(lead._id)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        lead.status === 'contacted'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-brand-100 text-brand-800 hover:bg-brand-200'
                      }`}
                    >
                      {lead.status === 'contacted' ? 'Contacted' : 'New'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{dayjs(lead.createdAt).format('MMM D, YYYY')}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setPendingDeleteId(lead._id)}
                      className="font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete lead"
        message="This will permanently delete this lead. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}
