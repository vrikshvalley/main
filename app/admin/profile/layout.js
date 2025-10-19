import AdminNavbar from '@/components/admin/AdminNavbar.jsx'

export default function ProfileLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNavbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow">
                    {children}
                </div>
            </div>
        </div>
    )
}