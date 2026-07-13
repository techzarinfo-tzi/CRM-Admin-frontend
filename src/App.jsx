import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/layouts/DashboardLayout'
import PublicLayout from '@/layouts/PublicLayout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import AdminBlogList from '@/pages/admin/AdminBlogList'
import AdminBlogForm from '@/pages/admin/AdminBlogForm'
import BlogList from '@/pages/public/BlogList'
import BlogDetails from '@/pages/public/BlogDetails'

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<PublicLayout />}>
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogDetails />} />
            </Route>

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route
                path="blogs"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminBlogList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="blogs/new"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminBlogForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="blogs/:id/edit"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminBlogForm />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
