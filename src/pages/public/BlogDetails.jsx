import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import dayjs from 'dayjs'
import { getPublicBlogBySlug } from '@/api/blog'

export default function BlogDetails() {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    getPublicBlogBySlug(slug)
      .then((res) => setBlog(res.data.blog))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>

  if (notFound || !blog) {
    return (
      <div>
        <p className="text-sm text-gray-500">Blog post not found.</p>
        <Link to="/blog" className="mt-2 inline-block text-sm font-medium text-gray-900 hover:underline">
          Back to blog
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl">
      <Helmet>
        <title>{blog.metaTitle || blog.title}</title>
        {blog.metaDescription && <meta name="description" content={blog.metaDescription} />}
        {blog.metaKeywords?.length > 0 && <meta name="keywords" content={blog.metaKeywords.join(', ')} />}
        {blog.schemaMarkup && <script type="application/ld+json">{JSON.stringify(blog.schemaMarkup)}</script>}
      </Helmet>

      <Link to="/blog" className="text-sm font-medium text-gray-500 hover:text-gray-900">
        ← Back to blog
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-gray-900 sm:text-3xl">{blog.title}</h1>
      <p className="mt-2 text-sm text-gray-400">
        {dayjs(blog.publishedAt || blog.createdAt).format('MMMM D, YYYY')}
      </p>

      {blog.featuredImage && (
        <img src={blog.featuredImage} alt={blog.title} className="mt-6 w-full rounded-lg object-cover" />
      )}

      <div
        className="prose prose-sm sm:prose-base mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </article>
  )
}
