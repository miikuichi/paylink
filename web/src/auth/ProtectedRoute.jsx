import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'ADMIN' ? '/hr/dashboard' : '/employee/dashboard'
    return <Navigate to={fallback} replace />
  }

  return children
}

export default ProtectedRoute
