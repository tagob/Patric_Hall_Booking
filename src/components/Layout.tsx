import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Calendar, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from './Toast';
import { useToast } from '../hooks/useToast';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, hideToast } = useToast();

  const handleVenuesClick = () => {
    navigate('/venues');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8" />
              <span className="font-bold text-xl">Patrician Halls</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleVenuesClick}
                className="flex items-center space-x-1 hover:text-indigo-200 text-white transition-colors duration-200"
              >
                <Building2 className="h-5 w-5" />
                <span>Multiple Venues</span>
              </button>
              {user ? (
                <>
                  <Link to="/bookings" className="flex items-center space-x-1 hover:text-indigo-200">
                    <Calendar className="h-5 w-5" />
                    <span>My Bookings</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center space-x-1 hover:text-indigo-200">
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:text-indigo-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                location.pathname !== '/login' && (
                  <Link 
                    to="/login" 
                    className="flex items-center space-x-1 hover:text-indigo-200"
                  >
                    <User className="h-5 w-5" />
                    <span>Login</span>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={hideToast}
        />
      )}
    </div>
  );
}