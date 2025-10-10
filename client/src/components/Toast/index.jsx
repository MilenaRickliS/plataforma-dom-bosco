import { useEffect, useState } from "react";

export default function Toast({ message, type = "sucesso", onClose }) {
  const [show, setShow] = useState(Boolean(message));
  useEffect(() => {
    if (!message) return;
    setShow(true);
    const t = setTimeout(() => { setShow(false); onClose?.(); }, 3000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!show || !message) return null;
  return <div className={`toast ${type}`}>{message}</div>;
}
