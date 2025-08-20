import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Building2, LogOut, LayoutDashboard, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from './Toast';
import { useToast } from '../hooks/useToast';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast, hideToast } = useToast();

  React.useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'hod') {
        navigate('/hod');
      }
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8" />
              <span className="font-bold text-xl">Patrician Halls</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-indigo-200">
                    {user.name} ({user.role.toUpperCase()})
                  </span>
                  {user.role === 'admin' && (
                    <div className="flex items-center space-x-1 text-indigo-200">
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Admin Dashboard</span>
                    </div>
                  )}
                  {user.role === 'hod' && (
                    <div className="flex items-center space-x-1 text-indigo-200">
                      <Calendar className="h-5 w-5" />
                      <span>HOD Dashboard</span>
                    </div>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:text-indigo-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
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