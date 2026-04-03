import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "../lib/authApi.js";
import { setToken, startGuestSession } from "../lib/auth.js";

function mapAuthErrorMessage(msg) {
  const m = String(msg || "");
  if (m === "Missing fields") return "Zəhmət olmasa bütün xanaları doldurun.";
  if (m === "Email already used") return "Bu email artıq istifadə olunub.";
  if (m === "Invalid credentials") return "Email və ya şifrə yanlışdır.";
  if (m === "Unauthorized") return "Sessiya bitib. Yenidən daxil olun.";
  return m || "Xəta baş verdi";
}

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // login | register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef(null);
  const navigate = useNavigate();

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();

    if (!email || !password) return setError("Email və şifrə tələb olunur.");

    abortRef.current?.abort?.();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    try {
      const result = await loginApi({ email, password }, ac.signal);
      if (!result?.token) return setError("Token alınmadı (backend cavabını yoxlayın).");

      setToken(result.token);
      navigate(result?.user?.role === "ADMIN" ? "/admin/dashboard" : "/home");
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(mapAuthErrorMessage(err?.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();
    const password2 = String(fd.get("password2") || "").trim();

    if (!name || !email || !password) return setError("Zəhmət olmasa bütün xanaları doldurun.");
    if (password.length < 6) return setError("Şifrə ən az 6 simvol olmalıdır.");
    if (password !== password2) return setError("Şifrələr uyğun deyil.");

    abortRef.current?.abort?.();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    try {
      const result = await registerApi({ name, email, password }, ac.signal);
      if (!result?.token) return setError("Token alınmadı (backend cavabını yoxlayın).");

      setToken(result.token);
      navigate("/home");
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(mapAuthErrorMessage(err?.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page page-auth">
      <section className="brand">
        <div className="brand__icon" aria-hidden="true">
          <i className="fa-solid fa-heart"></i>
        </div>
        <h1 className="brand__name">MedSearch</h1>
        <p className="brand__tagline">Dərman axtarış platforması</p>
      </section>

      <section className="card" aria-live="polite">
        <div className="card__panel">
          <h2 className="card__title">{mode === "login" ? "Giriş" : "Qeydiyyat"}</h2>

          {error ? <div className="info-box">{error}</div> : null}

          {mode === "login" ? (
            <form className="form" onSubmit={handleLoginSubmit}>
              <label className="field">
                <span className="field__label">Email</span>
                <span className="input">
                  <i className="fa-regular fa-envelope input__icon" aria-hidden="true"></i>
                  <input
                    className="input__control"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    required
                    disabled={loading}
                  />
                </span>
              </label>

              <label className="field">
                <span className="field__label">Şifrə</span>
                <span className="input">
                  <i className="fa-solid fa-lock input__icon" aria-hidden="true"></i>
                  <input
                    className="input__control"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </span>
              </label>

              <button className="btn btn--primary" type="submit" disabled={loading}>
                {loading ? "Yüklənir..." : "Daxil ol"}
              </button>

              <p className="hint">
                <a
                  className="link link--primary"
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault();
                    if (loading) return;
                    setMode("register");
                    setError("");
                  }}
                >
                  Hesabınız yoxdur? Qeydiyyatdan keçin
                </a>
              </p>
            </form>
          ) : (
            <form className="form" onSubmit={handleRegisterSubmit}>
              <label className="field">
                <span className="field__label">Adınız və Soyadınız</span>
                <span className="input">
                  <i className="fa-regular fa-user input__icon" aria-hidden="true"></i>
                  <input
                    className="input__control"
                    name="name"
                    type="text"
                    placeholder="Adınızı daxil edin"
                    required
                    disabled={loading}
                  />
                </span>
              </label>

              <label className="field">
                <span className="field__label">Email</span>
                <span className="input">
                  <i className="fa-regular fa-envelope input__icon" aria-hidden="true"></i>
                  <input
                    className="input__control"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    required
                    disabled={loading}
                  />
                </span>
              </label>

              <label className="field">
                <span className="field__label">Şifrə</span>
                <span className="input">
                  <i className="fa-solid fa-lock input__icon" aria-hidden="true"></i>
                  <input
                    className="input__control"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </span>
              </label>

              <label className="field">
                <span className="field__label">Şifrəni təsdiqlə</span>
                <span className="input">
                  <i className="fa-solid fa-lock input__icon" aria-hidden="true"></i>
                  <input
                    className="input__control"
                    name="password2"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </span>
              </label>

              <button className="btn btn--primary" type="submit" disabled={loading}>
                {loading ? "Yüklənir..." : "Qeydiyyatdan keç"}
              </button>

              <p className="hint">
                <a
                  className="link link--primary"
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault();
                    if (loading) return;
                    setMode("login");
                    setError("");
                  }}
                >
                  Artıq hesabınız var? Daxil olun
                </a>
              </p>
            </form>
          )}

          <p className="hint">
            <a
              className="link"
              href="#"
              onClick={(ev) => {
                ev.preventDefault();
                if (loading) return;
                setError("");
                startGuestSession();
                navigate("/home");
              }}
            >
              Qonaq kimi davam et
            </a>
          </p>
        </div>
      </section>

      <footer className="footnote">Məlumatlarınız təhlükəsizdir və qorunur</footer>
    </main>
  );
}
