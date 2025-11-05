import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Pages
import LoginPage from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Upload from './pages/Upload.tsx'
import Rewards from './pages/Rewards.tsx'
import Admin from './pages/Admin.tsx'
import Database from './pages/Database.tsx'
import UserManagement from './pages/UserManagement.tsx'
import RewardManagement from './pages/RewardManagement.tsx'

// Components
import Layout from './components/Layout.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute roleRequired="student">
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute roleRequired="student">
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'upload',
        element: (
          <ProtectedRoute roleRequired="student">
            <Upload />
          </ProtectedRoute>
        ),
      },
      {
        path: 'rewards',
        element: (
          <ProtectedRoute roleRequired="student">
            <Rewards />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute roleRequired="admin">
            <Admin />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute roleRequired="admin">
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: 'rewards-admin',
        element: (
          <ProtectedRoute roleRequired="admin">
            <RewardManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: 'database',
        element: (
          <ProtectedRoute roleRequired="admin">
            <Database />
          </ProtectedRoute>
        ),
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)