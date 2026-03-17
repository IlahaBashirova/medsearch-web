import React from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminHeader from "../components/AdminHeader.jsx";

export default function AdminLayout({ title, subtitle, children }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div className="admin-shell__main">
        <AdminHeader title={title} subtitle={subtitle} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
