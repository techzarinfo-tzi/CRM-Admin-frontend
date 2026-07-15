import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { SocketProvider } from '@/context/SocketContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/layouts/DashboardLayout'
import PublicLayout from '@/layouts/PublicLayout'
import Login from '@/pages/Login'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import AdminLeadsList from '@/pages/admin/AdminLeadsList'
import AdminBlogList from '@/pages/admin/AdminBlogList'
import AdminBlogForm from '@/pages/admin/AdminBlogForm'
import BlogList from '@/pages/public/BlogList'
import BlogDetails from '@/pages/public/BlogDetails'

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

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
                <Route
                  index
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLeadsList />
                    </ProtectedRoute>
                  }
                />
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
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
