import { RouterProvider } from 'react-router-dom'
import AuthProvider from '../features/auth/AuthProvider'
import { router } from '../routes/AppRoutes'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
