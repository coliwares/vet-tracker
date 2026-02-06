import React, { useMemo, useState } from "react";
import type { Pet } from "../types";
import { newId } from "../storage";
import { formatAge } from "../utils/formatAge";
import { ConfirmDialog } from "./ConfirmDialog";

type Props = {
  pets: Pet[];
  onAdd: (pet: Pet) => void;
  onDelete: (petId: string) => void;
  onViewVisits: (petId: string) => void;
};

export function PetForm({ pets, onAdd, onDelete, onViewVisits }: Props) {
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [notes, setNotes] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Pet | null>(null);

  const nameValid = useMemo(() => name.trim().length >= 2, [name]);
  const canAdd = nameValid;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) {
      setNameTouched(true);
      return;
    }

    onAdd({
      id: newId(),
      name: name.trim(),
      breed: breed.trim() || undefined,
      birthDate: birthDate || undefined,
      notes: notes.trim() || undefined,
    });

    setName("");
    setBreed("");
    setBirthDate("");
    setNotes("");
  }

  function handleDeleteConfirm() {
    if (!pendingDelete) return;
    onDelete(pendingDelete.id);
    setMenuOpenId(null);
    setPendingDelete(null);
  }

  return (
    <section className="card">
      <h2>🐶 Perritas</h2>

      <form onSubmit={submit} className="grid">
        <label>
          Nombre *
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setNameTouched(true)}
            className={nameTouched ? (nameValid ? "success" : "error") : ""}
            placeholder="Ginger, Luna, Gin…"
          />
          {nameTouched && !nameValid ? (
            <span className="field-helper error">
              Escribe al menos 2 caracteres.
            </span>
          ) : null}
        </label>

        <label>
          Raza
          <input
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="Pug, Schnoodle…"
          />
        </label>

        <label>
          Nacimiento
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </label>

        <label className="col-span">
          Notas
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alergias, medicamentos, etc."
          />
        </label>

        <div className="row">
          <button className="btn" type="submit" disabled={!canAdd}>
            + Agregar perrita
          </button>
          <span className="muted small">
            Tip: puedes cargar varias y luego filtrar visitas.
          </span>
        </div>
      </form>

      {pets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">Aún no agregas perritas</div>
          <div className="muted small">
            Comienza registrando a tu primera perrita para crear visitas.
          </div>
        </div>
      ) : (
        <div className="pet-cards">
          {pets.map((p) => (
            <article key={p.id} className="pet-card">
              <div className="pet-card-header">
                <div>
                  <div className="strong pet-name">{p.name}</div>
                  <div className="muted small">
                    {p.breed ? `Raza: ${p.breed}` : "Raza: —"}
                  </div>
                </div>

                <div className="menu">
                  <button
                    className="menu-trigger"
                    type="button"
                    aria-label="Opciones"
                    aria-haspopup="menu"
                    aria-expanded={menuOpenId === p.id}
                    onClick={() =>
                      setMenuOpenId((prev) => (prev === p.id ? null : p.id))
                    }
                  >
                    ⋯
                  </button>
                  {menuOpenId === p.id ? (
                    <div className="menu-panel">
                      <button
                        className="menu-item danger"
                        type="button"
                        onClick={() => setPendingDelete(p)}
                      >
                        Eliminar perrita
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="pet-meta">
                <div>
                  <div className="muted small">Edad</div>
                  <div className="strong">{formatAge(p.birthDate)}</div>
                </div>
                <div>
                  <div className="muted small">Nacimiento</div>
                  <div className="strong">{p.birthDate ?? "—"}</div>
                </div>
              </div>

              {p.notes ? <div className="muted small">{p.notes}</div> : null}

              <div className="pet-actions">
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => {
                    setMenuOpenId(null);
                    onViewVisits(p.id);
                  }}
                >
                  Ver visitas
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={
          pendingDelete
            ? `Eliminar ${pendingDelete.name}`
            : "Eliminar perrita"
        }
        description="Esto eliminará la perrita y todas sus visitas asociadas."
        confirmText="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
