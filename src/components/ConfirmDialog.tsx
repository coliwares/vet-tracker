import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText: string;
  requireTyping?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  requireTyping,
  onConfirm,
  onCancel,
}: Props) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  if (!open) return null;

  const needsTyping = Boolean(requireTyping);
  const canConfirm = needsTyping ? typed === requireTyping : true;

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <div className="dialog">
        <h3>{title}</h3>
        {description ? <p className="muted small">{description}</p> : null}

        {needsTyping ? (
          <label>
            Escribe "{requireTyping}" para confirmar
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireTyping}
            />
          </label>
        ) : null}

        <div className="row">
          <button className="btn secondary" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="btn danger"
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
