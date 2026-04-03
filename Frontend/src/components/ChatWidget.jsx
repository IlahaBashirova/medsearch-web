import React, { useEffect, useMemo, useRef, useState } from "react";
import { getSessionUser } from "../lib/auth.js";
import { getMySupportConversation, sendSupportMessage } from "../lib/supportApi.js";

function mapConversationMessages(conversation) {
  const items = Array.isArray(conversation?.messages) ? conversation.messages : [];

  return items.map((item) => ({
    id: item._id || `${item.senderRole}-${item.createdAt}`,
    from: item.senderRole === "ADMIN" ? "bot" : "user",
    text: item.message
  }));
}

function getConversationSignature(conversation) {
  if (!conversation?._id) return "";
  const messageCount = Array.isArray(conversation.messages) ? conversation.messages.length : 0;
  return [conversation._id, conversation.lastMessageAt || "", conversation.updatedAt || "", messageCount].join("|");
}

export default function ChatWidget({ open, onClose, pharmacy }) {
  const abortRef = useRef(null);
  const isFetchingRef = useRef(false);
  const conversationSignatureRef = useRef("");
  const previousMessageCountRef = useRef(0);
  const [text, setText] = useState("");
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bodyRef = useRef(null);
  const session = getSessionUser();
  const conversationParams = useMemo(
    () => ({
      pharmacyRef: pharmacy?.id || "",
      pharmacyName: pharmacy?.name || ""
    }),
    [pharmacy]
  );

  useEffect(() => {
    if (!open) return undefined;
    if (session.isGuest || !session.id) {
      setConversation(null);
      setMessages([]);
      setError("");
      return undefined;
    }

    let intervalId = null;

    async function loadConversation({ silent = false } = {}) {
      if (isFetchingRef.current) return;

      const ac = new AbortController();
      abortRef.current = ac;
      isFetchingRef.current = true;

      if (!silent) {
        setLoading(true);
      }
      try {
        const result = await getMySupportConversation(conversationParams, ac.signal);
        const nextSignature = getConversationSignature(result);

        if (nextSignature !== conversationSignatureRef.current) {
          conversationSignatureRef.current = nextSignature;
          setConversation(result);
          setMessages(mapConversationMessages(result));
        }

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
    }

    loadConversation();
    intervalId = window.setInterval(() => {
      loadConversation({ silent: true });
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
      abortRef.current?.abort?.();
      isFetchingRef.current = false;
    };
  }, [conversationParams, open, session.id, session.isGuest]);

  useEffect(() => {
    if (!open) return;
    if (messages.length < previousMessageCountRef.current) {
      previousMessageCountRef.current = messages.length;
      return;
    }

    const hasNewMessages = messages.length > previousMessageCountRef.current;
    previousMessageCountRef.current = messages.length;

    if (!hasNewMessages && messages.length !== 0) return;

    requestAnimationFrame(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    });
  }, [open, messages.length]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;

    if (session.isGuest || !session.id) {
      setError("Mesaj göndərmək üçün giriş edin.");
      return;
    }

    abortRef.current?.abort?.();
    setSending(true);
    try {
      const result = await sendSupportMessage({
        subject: conversation?.subject || `Online Konsultasiya - ${pharmacy?.name || "Aptek"}`,
        message: trimmedText,
        pharmacyRef: pharmacy?.id || "",
        pharmacyName: pharmacy?.name || ""
      });
      conversationSignatureRef.current = getConversationSignature(result);
      setConversation(result);
      setMessages(mapConversationMessages(result));
      setText("");
      setError("");
    } catch (err) {
      setError(err?.message || "Mesaj göndərilmədi");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="chat" aria-label="Online Konsultasiya">
      <header className="chat__head">
        <div className="chat__head-left">
          <i className="fa-regular fa-comment-dots chat__head-icon" aria-hidden="true"></i>
          <span className="chat__head-title">Online Konsultasiya</span>
        </div>

        <button className="chat__close" type="button" onClick={onClose} aria-label="Bağla">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>

      <div className="chat__body" ref={bodyRef}>
        {loading ? <div className="msg"><div className="msg__bubble">Yüklənir...</div></div> : null}
        {error ? <div className="msg"><div className="msg__bubble">{error}</div></div> : null}
        {!loading && !error && session.isGuest ? (
          <div className="msg">
            <div className="msg__bubble">Mesaj göndərmək üçün giriş edin.</div>
          </div>
        ) : null}
        {!loading && !error && !session.isGuest && messages.length === 0 ? (
          <div className="msg">
            <div className="msg__bubble">Salam! Sizə necə kömək edə bilərəm?</div>
          </div>
        ) : null}
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.from === "user" ? "msg--user" : "msg--bot"}`}>
            <div className="msg__bubble">{m.text}</div>
          </div>
        ))}
      </div>

      <form className="chat__foot" onSubmit={handleSubmit}>
        <input
          className="chat__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mesajınızı yazın..."
          autoComplete="off"
          disabled={sending}
        />
        <button className="chat__send" type="submit" disabled={sending}>
          {sending ? "Göndərilir..." : "Göndər"}
        </button>
      </form>
    </section>
  );
}
