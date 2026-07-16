import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { listAdminBlogs, deleteBlog, toggleBlogStatus } from '@/api/blog'
import { resolveAssetUrl } from '@/api/axios'
import ConfirmDialog from '@/components/ConfirmDialog'

const ROWS_PER_PAGE_OPTIONS = [5, 10, 15, 20]
const emptyPagination = { page: 1, limit: 10, total: 0, pages: 1 }

export default function AdminBlogList() {
  const [blogs, setBlogs] = useState([])
  const [pagination, setPagination] = useState(emptyPagination)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const res = await listAdminBlogs({ search, sort, page, limit })
      setBlogs(res.data.blogs)
      setPagination(res.data.pagination)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchBlogs, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, page, limit])

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleSortChange = (e) => {
    setSort(e.target.value)
    setPage(1)
  }

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value))
    setPage(1)
  }

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleBlogStatus(id)
      setBlogs((prev) => prev.map((b) => (b._id === id ? res.data.blog : b)))
      toast.success(`Blog ${res.data.blog.status === 'published' ? 'published' : 'unpublished'}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = async () => {
    const id = pendingDeleteId
    setPendingDeleteId(null)

    // Remove immediately so the UI feels instant; roll back if the request fails.
    let removed
    let removedIndex
    let remainingOnPage = 0
    setBlogs((prev) => {
      removedIndex = prev.findIndex((b) => b._id === id)
      removed = prev[removedIndex]
      const next = prev.filter((b) => b._id !== id)
      remainingOnPage = next.length
      return next
    })
    setPagination((prev) => ({
      ...prev,
      total: Math.max(prev.total - 1, 0),
      pages: Math.max(Math.ceil(Math.max(prev.total - 1, 0) / prev.limit), 1),
    }))
    toast.success('Blog deleted')

    // If that was the last row on a page beyond the first, step back a page
    // instead of leaving an empty page with stale pagination controls.
    if (remainingOnPage === 0 && page > 1) {
      setPage((p) => p - 1)
    }

    try {
      await deleteBlog(id)
    } catch (err) {
      if (removed) {
        setBlogs((prev) => {
          const next = [...prev]
          next.splice(removedIndex, 0, removed)
          return next
        })
      }
      setPagination((prev) => ({
        ...prev,
        total: prev.total + 1,
        pages: Math.max(Math.ceil((prev.total + 1) / prev.limit), 1),
      }))
      toast.error(err.response?.data?.message || 'Failed to delete blog')
    }
  }

  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Blogs</h2>
        <Link
          to="/blogs/new"
          className="rounded-md bg-brand-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-800"
        >
          New Blog
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={handleSearchChange}
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
        />
        <select
          value={sort}
          onChange={handleSortChange}
          className="rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
        >
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-20 px-4 py-3 text-center font-medium text-gray-500">Image</th>
              <th className="min-w-35 px-4 py-3 text-left font-medium text-gray-500">Title</th>
              <th className="hidden w-48 px-4 py-3 text-left font-medium text-gray-500 lg:table-cell">Slug</th>
              <th className="w-28 px-4 py-3 text-center font-medium text-gray-500">Status</th>
              <th className="hidden w-32 px-4 py-3 text-left font-medium text-gray-500 sm:table-cell">Created</th>
              <th className="w-28 px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && blogs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No blogs found.
                </td>
              </tr>
            )}
            {!loading &&
              blogs.map((blog) => (
                <tr key={blog._id}>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-center">
                      {blog.featuredImage ? (
                        <img
                          src={resolveAssetUrl(blog.featuredImage)}
                          alt=""
                          className="h-10 w-16 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-16 shrink-0 rounded bg-gray-100" />
                      )}
                    </div>
                  </td>
                  <td className="max-w-0 truncate px-4 py-3.5 font-medium text-gray-900">{blog.title}</td>
                  <td className="hidden max-w-0 truncate px-4 py-3.5 text-gray-500 lg:table-cell">{blog.slug}</td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => handleToggleStatus(blog._id)}
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {blog.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3.5 text-gray-500 sm:table-cell">
                    {dayjs(blog.createdAt).format('MMM D, YYYY')}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-4 whitespace-nowrap">
                      <Link to={`/blogs/${blog._id}/edit`} className="font-medium text-gray-600 hover:text-gray-900">
                        Edit
                      </Link>
                      <button
                        onClick={() => setPendingDeleteId(blog._id)}
                        className="font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && pagination.total > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{rangeStart}</span>&ndash;
              <span className="font-medium text-gray-700">{rangeEnd}</span> of{' '}
              <span className="font-medium text-gray-700">{pagination.total}</span> blogs
            </p>
            <label className="flex items-center gap-2 text-sm text-gray-500">
              Rows per page
              <select
                value={limit}
                onChange={handleLimitChange}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-brand-600 focus:outline-none"
              >
                {ROWS_PER_PAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <span className="px-2 text-sm text-gray-500 whitespace-nowrap">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete blog"
        message="This will permanently delete the blog post. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}
