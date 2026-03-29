import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import {
  getAdminSupportConversations,
  replyToSupportConversation,
  updateSupportConversationStatus
} from "../lib/adminApi.js";

function SupportBadge({ status }) {
  const tone = status === "RESOLVED" ? "success" : status === "PENDING" ? "warning" : "neutral";
  const label = status === "RESOLVED" ? "Həll olundu" : status === "PENDING" ? "Gözləyir" : "Aktiv";

  return <span className={`admin-status admin-status--${tone}`}>{label}</span>;
}

function formatMessageTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminSupportPage() {
  const abortRef = useRef(null);
  const isFetchingRef = useRef(false);
  const conversationsSignatureRef = useRef("");
  const [searchParams] = useSearchParams();
  const pendingConversationIdRef = useRef(searchParams.get("conversationId") || "");
  const [status, setStatus] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const loadConversations = useCallback(async ({ silent = false } = {}) => {
    if (isFetchingRef.current) return;

    const ac = new AbortController();
    abortRef.current = ac;
    isFetchingRef.current = true;

    if (!silent) {
      setLoading(true);
    }

    try {
      const res = await getAdminSupportConversations({ status, limit: 30 }, ac.signal);
      const data = Array.isArray(res?.data) ? res.data : [];
      const nextSignature = JSON.stringify(
        data.map((item) => [item._id, item.status, item.lastMessageAt || "", item.messages?.length || 0])
      );

      if (nextSignature !== conversationsSignatureRef.current) {
        conversationsSignatureRef.current = nextSignature;
        setConversations(data);
      }
      setSelectedId((current) => {
        const requestedConversationId = pendingConversationIdRef.current;

        if (requestedConversationId && data.some((item) => item._id === requestedConversationId)) {
          pendingConversationIdRef.current = "";
          return requestedConversationId;
        }

        return current || data[0]?._id || "";
      });
      setError("");
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Mesajları yükləmək mümkün olmadı");
    } finally {
      isFetchingRef.current = false;
      if (!silent) {
        setLoading(false);
      }
    }
  }, [status]);

  useEffect(() => {
    loadConversations();
    const intervalId = window.setInterval(() => {
      loadConversations({ silent: true });
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
      abortRef.current?.abort();
      isFetchingRef.current = false;
    };
  }, [loadConversations]);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item._id === selectedId) || null,
    [conversations, selectedId]
  );

  async function handleReply(event) {
    event.preventDefault();
    if (!selectedConversation || !message.trim()) return;

    setReplyLoading(true);

    try {
      await replyToSupportConversation(selectedConversation._id, { message: message.trim() });
      setMessage("");
      await loadConversations();
    } catch (err) {
      window.alert(err?.message || "Cavab göndərilmədi");
    } finally {
      setReplyLoading(false);
    }
  }

  async function handleResolve() {
    if (!selectedConversation) return;
    setStatusLoading(true);

    try {
      await updateSupportConversationStatus(selectedConversation._id, { status: "RESOLVED" });
      await loadConversations();
    } catch (err) {
      window.alert(err?.message || "Status yenilənmədi");
    } finally {
      setStatusLoading(false);
    }
  }

  return (
    <AdminLayout title="Dəstək & Chat" subtitle="İstifadəçi mesajlarını idarə edin">
      {loading ? (
        <section className="admin-empty-state">Yüklənir...</section>
      ) : error ? (
        <section className="admin-empty-state admin-empty-state--error">{error}</section>
      ) : conversations.length === 0 ? (
        <section className="admin-empty-state">Mesaj tapılmadı</section>
      ) : (
        <section className="admin-support-shell">
          <aside className="admin-support-list">
            <div className="admin-support-list__head">
              <div>
                <h3>Mesajlar</h3>
                <p>{conversations.filter((item) => item.status !== "RESOLVED").length} aktiv söhbət</p>
              </div>

              <label className="admin-select">
                <i className="fa-solid fa-filter" aria-hidden="true"></i>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Hamısı</option>
                  <option value="OPEN">Aktiv</option>
                  <option value="PENDING">Gözləyir</option>
                  <option value="RESOLVED">Həll olunub</option>
                </select>
              </label>
            </div>

            <div className="admin-support-list__items">
              {conversations.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  className={`admin-support-list__item${
                    item._id === selectedId ? " admin-support-list__item--active" : ""
                  }`}
                  onClick={() => setSelectedId(item._id)}
                >
                  <div className="admin-user-cell">
                    <div className="admin-avatar">{item.userId?.name?.slice(0, 1) || "U"}</div>
                    <div>
                      <strong>{item.userId?.name || "İstifadəçi"}</strong>
                      <span>{item.userId?.email || "—"}</span>
                    </div>
                  </div>

                  <p>{item.messages?.[item.messages.length - 1]?.message || item.subject}</p>

                  <div className="admin-support-list__meta">
                    <span>{item.messages?.length || 0} mesaj</span>
                    <SupportBadge status={item.status} />
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div className="admin-support-chat">
            {selectedConversation ? (
              <>
                <div className="admin-support-chat__head">
                  <div className="admin-user-cell">
                    <div className="admin-avatar">{selectedConversation.userId?.name?.slice(0, 1) || "U"}</div>
                    <div>
                      <strong>{selectedConversation.userId?.name || "İstifadəçi"}</strong>
                      <span>{selectedConversation.userId?.email || "—"}</span>
                    </div>
                  </div>

                  <button type="button" className="admin-link-btn" onClick={handleResolve} disabled={statusLoading}>
                    {statusLoading ? "Yenilənir..." : "Həll olundu kimi işarələ"}
                  </button>
                </div>

                <div className="admin-support-chat__messages">
                  {selectedConversation.messages?.map((item) => (
                    <div
                      key={item._id}
                      className={`admin-support-chat__bubble${
                        item.senderRole === "ADMIN"
                          ? " admin-support-chat__bubble--admin"
                          : ""
                      }`}
                    >
                      <div>{item.message}</div>
                      <span>{formatMessageTime(item.createdAt)}</span>
                    </div>
                  ))}
                </div>

                <form className="admin-support-chat__composer" onSubmit={handleReply}>
                  <input
                    type="text"
                    placeholder="Mesajınızı yazın..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button type="submit" className="admin-primary-btn" disabled={replyLoading || !message.trim()}>
                    <i className="fa-regular fa-paper-plane"></i>
                    {replyLoading ? "Göndərilir..." : "Göndər"}
                  </button>
                </form>
              </>
            ) : (
              <div className="admin-empty-state">Söhbət seçin</div>
            )}
          </div>
        </section>
      )}
    </AdminLayout>
  );
}
