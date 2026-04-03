import React from "react";

export default function Topbar({ title, subtitle, left, right }) {
  return (
    <header className="topbar">
      {left}
      <div className="topbar__titles">
        <div className="topbar__title">{title}</div>
        {subtitle ? <div className="topbar__subtitle">{subtitle}</div> : null}
      </div>
      {right}
    </header>
  );
}