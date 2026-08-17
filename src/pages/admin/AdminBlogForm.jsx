import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import RichTextEditor from '@/components/RichTextEditor'
import { getAdminBlogById, createBlog, updateBlog, uploadBlogImage } from '@/api/blog'
import { resolveAssetUrl } from '@/api/axios'
import { slugify } from '@/utils/slugify'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const emptyForm = {
  title: '',
  slug: '',
  content: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  status: 'draft',
}

export default function AdminBlogForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [schemaPreview, setSchemaPreview] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const slugManuallyEdited = useRef(false)

  useEffect(() => {
    if (!isEdit) return
    getAdminBlogById(id)
      .then((res) => {
        const blog = res.data.blog
        setForm({
          title: blog.title || '',
          slug: blog.slug || '',
          content: blog.content || '',
          metaTitle: blog.metaTitle || '',
          metaDescription: blog.metaDescription || '',
          metaKeywords: (blog.metaKeywords || []).join(', '),
          status: blog.status || 'draft',
        })
        setImagePreview(blog.featuredImage || '')
        setSchemaPreview(blog.schemaMarkup || null)
        slugManuallyEdited.current = true
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load blog'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleTitleChange = (e) => {
    const title = e.target.value
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugManuallyEdited.current ? prev.slug : slugify(title),
    }))
  }

  const handleSlugChange = (e) => {
    slugManuallyEdited.current = true
    setForm((prev) => ({ ...prev, slug: e.target.value }))
  }

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be 5MB or smaller')
      e.target.value = ''
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'Blog title is required'
    if (!form.slug.trim()) next.slug = 'Slug is required'
    if (!form.content.trim() || form.content === '<p><br></p>') next.content = 'Blog content is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (status) => {
    if (!validate()) return
    setSubmitting(true)
    try {
      let featuredImage
      if (imageFile) {
        const uploadRes = await uploadBlogImage(imageFile)
        featuredImage = uploadRes.data.url
      }

      const payload = {
        title: form.title,
        slug: slugify(form.slug),
        content: form.content,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        metaKeywords: form.metaKeywords,
        status,
        ...(featuredImage !== undefined && { featuredImage }),
      }

      if (isEdit) {
        await updateBlog(id, payload)
        toast.success('Blog updated')
      } else {
        await createBlog(payload)
        toast.success('Blog created')
      }
      navigate('/blogs')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save blog')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-400">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Blog' : 'New Blog'}</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(form.status)
        }}
        className="mt-6 space-y-6"
      >
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900">Content</h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Blog Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleTitleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleSlugChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
            />
            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Featured Image</label>
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-colors hover:border-brand-400 hover:bg-brand-50">
              <input
                type="file"
                name="featuredImage"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-700 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white file:transition-colors hover:file:bg-brand-800"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP or GIF. Max 5MB.</p>
            {imagePreview && (
              <img
                src={resolveAssetUrl(imagePreview)}
                alt=""
                className="mt-3 h-32 w-full max-w-xs rounded-md object-cover"
              />
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Blog Content</label>
            <RichTextEditor
              value={form.content}
              onChange={(content) => setForm((prev) => ({ ...prev, content }))}
              placeholder="Write your blog content..."
            />
            {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content}</p>}
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900">SEO</h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Meta Title</label>
            <input
              type="text"
              name="metaTitle"
              value={form.metaTitle}
              onChange={handleChange('metaTitle')}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Meta Description</label>
            <textarea
              rows={3}
              name="metaDescription"
              value={form.metaDescription}
              onChange={handleChange('metaDescription')}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Meta Keywords</label>
            <input
              type="text"
              name="metaKeywords"
              placeholder="comma, separated, keywords"
              value={form.metaKeywords}
              onChange={handleChange('metaKeywords')}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Schema (JSON-LD)</label>
            <p className="mb-2 text-xs text-gray-400">
              Generated automatically from the title, meta description, featured image, and publish dates above —
              nothing to fill in here.
            </p>
            {schemaPreview ? (
              <pre className="max-h-56 overflow-auto rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-600">
                {JSON.stringify(schemaPreview, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-gray-400">Structured data will appear here once the blog is saved.</p>
            )}
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={submitting}
            onClick={() => submit('draft')}
            className="rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => submit('published')}
            className="rounded-md bg-brand-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </form>
    </div>
  )
}
