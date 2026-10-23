"use client";
export default function Modal({ title, onClose, wide, children }) {
  return (
    <div className="modal open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dlg" style={wide ? { maxWidth: 760 } : undefined}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
