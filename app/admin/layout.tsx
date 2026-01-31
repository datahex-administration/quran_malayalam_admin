'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiBook,
  FiFileText,
  FiMessageSquare,
  FiInfo,
  FiUser,
  FiPhone,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiCheckCircle,
  FiEdit,
  FiActivity,
} from 'react-icons/fi';

interface UserSession {
  loginCode: string;
  role: 'creator' | 'verifier';
}

const menuItems = [
  { name: 'Suras', href: '/admin/suras', icon: FiBook },
  { name: 'Translations', href: '/admin/translations', icon: FiFileText },
  { name: 'Interpretations', href: '/admin/interpretations', icon: FiMessageSquare },
  { name: 'About Us', href: '/admin/about', icon: FiInfo },
  { name: 'Author', href: '/admin/author', icon: FiUser },
  { name: 'Contact Us', href: '/admin/contact', icon: FiPhone },
  { name: 'Help', href: '/admin/help', icon: FiHelpCircle },
  { name: 'Audit Log', href: '/admin/audit', icon: FiActivity },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Fetch user session
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiBook className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">Quran Malayalam</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    user.role === 'verifier'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
                  {user.role === 'verifier' ? (
                    <FiCheckCircle className="w-5 h-5" />
                  ) : (
                    <FiEdit className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[140px]">
                    {user.loginCode}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      user.role === 'verifier'
                        ? 'text-blue-600'
                        : 'text-green-600'
                    }`}
                  >
                    {user.role === 'verifier' ? 'Verifier' : 'Creator'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-green-100 text-green-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:hidden text-center">
              <span className="font-semibold text-gray-800">Quran Malayalam</span>
            </div>
            <div className="w-10 lg:hidden" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
