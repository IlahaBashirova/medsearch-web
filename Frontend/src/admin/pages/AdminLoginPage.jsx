import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminLoginApi } from "../lib/adminAuthApi.js";
import { setToken } from "../../lib/auth.js";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await adminLoginApi(form);
      setToken(result.token);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Giriş mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <section className="admin-login__card">
        <div className="admin-login__brand">
          <div className="admin-login__logo">MS</div>
          <div>
            <h1>MedSearch Admin</h1>
            <p>Admin panelinə daxil olun</p>
          </div>
        </div>

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <label className="admin-login__field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="admin@medsearch.az"
            />
          </label>

          <label className="admin-login__field">
            <span>Şifrə</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="********"
            />
          </label>

          {error ? <div className="admin-login__error">{error}</div> : null}

          <button type="submit" className="admin-login__submit" disabled={loading}>
            {loading ? "Daxil olunur..." : "Daxil ol"}
          </button>
        </form>

        <p className="admin-login__linkline">
          <Link to="/auth" className="admin-login__link">
            İstifadəçi girişi
          </Link>
        </p>
      </section>
    </main>
  );
}
