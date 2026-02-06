import { useId, useState } from "react";

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
  if (!open) return null;

  return (
    <DialogContent
      title={title}
      description={description}
      confirmText={confirmText}
      requireTyping={requireTyping}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

type ContentProps = Omit<Props, "open">;

function DialogContent({
  title,
  description,
  confirmText,
  requireTyping,
  onConfirm,
  onCancel,
}: ContentProps) {
  const [typed, setTyped] = useState("");
  const titleId = useId();
  const descriptionId = useId();
  const inputId = useId();
  const needsTyping = Boolean(requireTyping);
  const canConfirm = needsTyping ? typed === requireTyping : true;

  return (
    <div
      className="dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div className="dialog">
        <h3 id={titleId}>{title}</h3>
        {description ? (
          <p id={descriptionId} className="muted small">
            {description}
          </p>
        ) : null}

        {needsTyping ? (
          <label htmlFor={inputId}>
            Escribe "{requireTyping}" para confirmar
            <input
              id={inputId}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireTyping}
              autoComplete="off"
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
