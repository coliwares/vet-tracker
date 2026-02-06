import React, { useMemo, useState } from "react";
import type { Pet } from "../types";
import { newId } from "../storage";

type Props = {
  pets: Pet[];
  onAdd: (pet: Pet) => void;
  onDelete: (petId: string) => void;
};

export function PetForm({ pets, onAdd, onDelete }: Props) {
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [notes, setNotes] = useState("");

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
        <ul className="list">
          {pets.map((p) => (
            <li key={p.id} className="list-item">
              <div>
                <div className="strong">{p.name}</div>
                <div className="muted small">
                  {p.breed ? `Raza: ${p.breed} · ` : ""}
                  {p.birthDate ? `Nacimiento: ${p.birthDate}` : ""}
                </div>
                {p.notes ? <div className="muted small">{p.notes}</div> : null}
              </div>

              <button
                className="btn danger"
                onClick={() => onDelete(p.id)}
                title="Eliminar perrita"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
