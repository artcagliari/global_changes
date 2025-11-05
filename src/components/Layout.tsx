import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

const Layout = () => {
  const currentUser = useAuthStore((state) => state.currentUser)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/upload', label: 'Enviar Vídeo' },
    { to: '/rewards', label: 'Recompensas' },
  ]

  const adminLinks = [
    { to: '/admin', label: 'Moderação' },
    { to: '/users', label: 'Usuários' },
    { to: '/rewards-admin', label: 'Recompensas' },
    { to: '/database', label: 'Banco de Dados' },
  ]

  const links = currentUser?.role === 'student' ? studentLinks : adminLinks

  return (
    <div className="app-container">
      <header className="header-modern">
        <div className="header-content">
          <Link to={currentUser?.role === 'student' ? '/dashboard' : '/admin'} className="logo-link">
            <h1 className="logo">Global Changes</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {links.map((link) => (
              <Link 
                key={link.to} 
                to={link.to}
                className="nav-link"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
            {currentUser && (
              <button onClick={handleLogout} className="logout-button-desktop">
                {currentUser.name}
              </button>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            {links.map((link) => (
              <Link 
                key={link.to} 
                to={link.to}
                className="mobile-nav-link"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
            {currentUser && (
              <button onClick={handleLogout} className="logout-button-mobile">
                Sair ({currentUser.name})
              </button>
            )}
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout