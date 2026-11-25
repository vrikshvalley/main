import "@/styles/admin.scss";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }) {
  return <div className="vv-admin">{children}</div>;
}
