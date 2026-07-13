import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import dayjs from 'dayjs'
import { listPublicBlogs } from '@/api/blog'

export default function BlogList() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listPublicBlogs()
      .then((res) => setBlogs(res.data.blogs))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <Helmet>
        <title>Blog | CRM-admin</title>
        <meta name="description" content="Latest articles and updates." />
      </Helmet>

      <h1 className="text-2xl font-semibold text-gray-900">Blog</h1>

      {loading && <p className="mt-6 text-sm text-gray-400">Loading...</p>}

      {!loading && blogs.length === 0 && <p className="mt-6 text-sm text-gray-400">No blog posts yet.</p>}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            to={`/blog/${blog.slug}`}
            className="group overflow-hidden rounded-lg border border-gray-200 transition hover:shadow-md"
          >
            {blog.featuredImage ? (
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="h-44 w-full object-cover transition group-hover:scale-105"
              />
            ) : (
              <div className="h-44 w-full bg-gray-100" />
            )}
            <div className="p-4">
              <h2 className="line-clamp-2 text-base font-semibold text-gray-900">{blog.title}</h2>
              <p className="mt-1 text-xs text-gray-400">
                {dayjs(blog.publishedAt || blog.createdAt).format('MMM D, YYYY')}
              </p>
              {blog.metaDescription && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">{blog.metaDescription}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
