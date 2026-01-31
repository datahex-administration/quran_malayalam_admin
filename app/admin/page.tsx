import Link from 'next/link';
import {
  FiBook,
  FiFileText,
  FiMessageSquare,
  FiInfo,
  FiUser,
  FiPhone,
  FiHelpCircle,
  FiArrowRight,
} from 'react-icons/fi';

const cards = [
  {
    title: 'Suras',
    description: 'Manage Quran chapters with names, descriptions, and ayath counts',
    href: '/admin/suras',
    icon: FiBook,
    color: 'bg-green-500',
  },
  {
    title: 'Translations',
    description: 'Add and edit translations for Quran verses',
    href: '/admin/translations',
    icon: FiFileText,
    color: 'bg-blue-500',
  },
  {
    title: 'Interpretations',
    description: 'Manage verse interpretations and explanations',
    href: '/admin/interpretations',
    icon: FiMessageSquare,
    color: 'bg-purple-500',
  },
  {
    title: 'About Us',
    description: 'Edit about us page content',
    href: '/admin/about',
    icon: FiInfo,
    color: 'bg-orange-500',
  },
  {
    title: 'Author',
    description: 'Manage author information',
    href: '/admin/author',
    icon: FiUser,
    color: 'bg-pink-500',
  },
  {
    title: 'Contact Us',
    description: 'Update contact information',
    href: '/admin/contact',
    icon: FiPhone,
    color: 'bg-teal-500',
  },
  {
    title: 'Help',
    description: 'Manage help articles and FAQs',
    href: '/admin/help',
    icon: FiHelpCircle,
    color: 'bg-indigo-500',
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome to the Quran Malayalam Content Management System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 group"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                {card.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
