import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import ApplicantForm from './components/ApplicantForm';
import AdminDashboard from './components/AdminDashboard';
import { Shield, PenTool, Menu, X, Utensils } from 'lucide-react';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#DAF6FC] p-4">
      <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-xl border border-[#145A8B]/20 text-center">
        <div className="w-12 h-12 bg-[#DAF6FC] rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6 text-[#145A8B]" />
        </div>
        <h2 className="text-xl font-bold text-[#061E3E] mb-2">Accès Administrateur</h2>
        <p className="text-gray-500 mb-6 text-sm">Veuillez entrer le mot de passe administrateur pour continuer.</p>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          if (password === 'Crokette64') setIsAuthenticated(true);
          else alert('Mot de passe incorrect');
        }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 mb-4 focus:ring-2 focus:ring-[#145A8B] outline-none"
            placeholder="Mot de passe"
            autoFocus
          />
          <button 
            type="submit"
            className="w-full bg-[#145A8B] text-white py-3 rounded-lg font-medium hover:bg-[#061E3E] transition-colors"
          >
            Accéder au tableau de bord
          </button>
        </form>
      </div>
    </div>
  );
};

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { path: '/apply', label: 'Candidature', icon: PenTool },
  ];

  return (
    <nav className="bg-white border-b border-[#145A8B]/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="bg-[#145A8B] p-2 rounded-lg">
              <img src="/icon.png" alt="Logo Sophia" className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-[#061E3E] hidden sm:block">Recrutement SOPHIA - Saison 2026</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-2 my-auto rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-[#DAF6FC] text-[#145A8B]' 
                      : 'text-gray-600 hover:text-[#145A8B] hover:bg-[#DAF6FC]/50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-[#DAF6FC] focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-[#DAF6FC] text-[#145A8B]'
                    : 'text-gray-600 hover:text-[#145A8B] hover:bg-[#DAF6FC]/50'
                }`}
              >
                <div className="flex items-center">
                  <link.icon className="w-4 h-4 mr-3" />
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-[#DAF6FC] font-sans text-[#061E3E]">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/apply" replace />} />
            <Route path="/apply" element={<ApplicantForm />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <div className="h-[calc(100vh-64px)]">
                  <AdminDashboard />
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;