import React, { useEffect, useRef, useState } from "react";

export default function ChatWidget({ open, onClose }) {
  const [messages, setMessages] = useState([
    { from: "user", text: "salam" },
    { from: "bot", text: "Salam! Sizə necə kömək edə bilərəm?" }
  ]);
  const [text, setText] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    });
  }, [open, messages.length]);

  if (!open) return null;

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
        {messages.map((m, idx) => (
          <div key={idx} className={`msg ${m.from === "user" ? "msg--user" : "msg--bot"}`}>
            <div className="msg__bubble">{m.text}</div>
          </div>
        ))}
      </div>

      <form
        className="chat__foot"
        onSubmit={(e) => {
          e.preventDefault();
          const t = text.trim();
          if (!t) return;

          setMessages((prev) => [...prev, { from: "user", text: t }]);
          setText("");

          setTimeout(() => {
            setMessages((prev) => [...prev, { from: "bot", text: "Salam! Sizə necə kömək edə bilərəm?" }]);
          }, 350);
        }}
      >
        <input
          className="chat__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mesajınızı yazın..."
          autoComplete="off"
        />
        <button className="chat__send" type="submit">
          Göndər
        </button>
      </form>
    </section>
  );
}