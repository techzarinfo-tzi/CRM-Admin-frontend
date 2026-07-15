import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { listAdminBlogs, deleteBlog, toggleBlogStatus } from '@/api/blog'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function AdminBlogList() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('latest')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const res = await listAdminBlogs({ search, sort })
      setBlogs(res.data.blogs)
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
  }, [search, sort])

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
    try {
      await deleteBlog(id)
      setBlogs((prev) => prev.filter((b) => b._id !== id))
      toast.success('Blog deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete blog')
    }
  }

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
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
        >
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Image</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
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
                  <td className="px-4 py-3">
                    {blog.featuredImage ? (
                      <img src={blog.featuredImage} alt="" className="h-10 w-16 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-16 rounded bg-gray-100" />
                    )}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-gray-900">{blog.title}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-500">{blog.slug}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(blog._id)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {blog.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{dayjs(blog.createdAt).format('MMM D, YYYY')}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
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
