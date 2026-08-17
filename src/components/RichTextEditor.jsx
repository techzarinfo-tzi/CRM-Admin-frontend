import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link'],
    ['clean'],
  ],
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  return (
    <div className="rounded-md border border-gray-300 bg-white [&_.ql-container]:min-h-56 [&_.ql-container]:rounded-b-md [&_.ql-toolbar]:rounded-t-md">
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={modules} placeholder={placeholder} />
    </div>
  )
}
