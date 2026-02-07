import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Pet } from "../types";
import { newId } from "../storage";
import { formatAge } from "../utils/formatAge";
import {
  formatIsoToDisplay,
  formatIsoToLocal,
  normalizeLocalDateInput,
  parseLocalDate,
} from "../utils/date";
import { ConfirmDialog } from "./ConfirmDialog";

type Props = {
  pets: Pet[];
  onAdd: (pet: Pet) => void;
  onUpdate: (pet: Pet) => void;
  onDelete: (petId: string) => void;
  onViewVisits: (petId: string) => void;
};

export function PetForm({ pets, onAdd, onUpdate, onDelete, onViewVisits }: Props) {
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [petType, setPetType] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthDateInput, setBirthDateInput] = useState("");
  const [notes, setNotes] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Pet | null>(null);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameTouched, setEditNameTouched] = useState(false);
  const [editType, setEditType] = useState("");
  const [editBreed, setEditBreed] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editBirthDateInput, setEditBirthDateInput] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const birthDatePickerRef = useRef<HTMLInputElement | null>(null);
  const editBirthDatePickerRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nameValid = useMemo(() => name.trim().length >= 2, [name]);
  const editNameValid = useMemo(() => editName.trim().length >= 2, [editName]);
  const canAdd = nameValid;
  const petTypeOptions = ["Perro", "Gato", "Conejo", "Otro"];
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        globalThis.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) {
      setNameTouched(true);
      return;
    }

    const petName = name.trim();

    onAdd({
      id: newId(),
      name: petName,
      petType: petType || undefined,
      breed: breed.trim() || undefined,
      birthDate: birthDate || undefined,
      notes: notes.trim() || undefined,
    });

    setToast(`✅ ${petName} guardada correctamente.`);
    if (toastTimerRef.current) globalThis.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = globalThis.setTimeout(() => {
      setToast(null);
    }, 3200);

    setName("");
    setPetType("");
    setBreed("");
    setBirthDate("");
    setBirthDateInput("");
    setNotes("");
  }

  function handleBirthDateInput(value: string) {
    const normalized = normalizeLocalDateInput(value);
    setBirthDateInput(normalized);
    const parsed = parseLocalDate(normalized);
    setBirthDate(parsed);
  }

  function handleEditBirthDateInput(value: string) {
    const normalized = normalizeLocalDateInput(value);
    setEditBirthDateInput(normalized);
    const parsed = parseLocalDate(normalized);
    setEditBirthDate(parsed);
  }

  function openBirthDatePicker() {
    const picker = birthDatePickerRef.current;
    if (!picker) return;
    if (picker.showPicker) {
      picker.showPicker();
      return;
    }
    picker.focus();
    picker.click();
  }

  function openEditBirthDatePicker() {
    const picker = editBirthDatePickerRef.current;
    if (!picker) return;
    if (picker.showPicker) {
      picker.showPicker();
      return;
    }
    picker.focus();
    picker.click();
  }

  function startEdit(pet: Pet) {
    setEditingPet(pet);
    setEditName(pet.name);
    setEditType(pet.petType ?? "");
    setEditBreed(pet.breed ?? "");
    setEditBirthDate(pet.birthDate ?? "");
    setEditBirthDateInput(formatIsoToLocal(pet.birthDate));
    setEditNotes(pet.notes ?? "");
    setEditNameTouched(false);
    setMenuOpenId(null);
  }

  function cancelEdit() {
    setEditingPet(null);
  }

  function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPet) return;
    if (!editNameValid) {
      setEditNameTouched(true);
      return;
    }

    onUpdate({
      ...editingPet,
      name: editName.trim(),
      petType: editType || undefined,
      breed: editBreed.trim() || undefined,
      birthDate: editBirthDate || undefined,
      notes: editNotes.trim() || undefined,
    });

    setEditingPet(null);
  }

  function handleDeleteConfirm() {
    if (!pendingDelete) return;
    onDelete(pendingDelete.id);
    setMenuOpenId(null);
    setPendingDelete(null);
  }

  return (
    <section className="card">
      <h2>🐶 Mascotas</h2>

      {toast ? (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}

      <form onSubmit={submit} className="grid">
        <label>
          Nombre *
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setNameTouched(true)}
            className={nameTouched ? (nameValid ? "success" : "error") : ""}
            placeholder="Ginger, Luna, Gin…"
            tabIndex={1}
          />
          {nameTouched && !nameValid ? (
            <span className="field-helper error">
              Escribe al menos 2 caracteres.
            </span>
          ) : null}
        </label>

        <label>
          Tipo de mascota
          <select
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
            tabIndex={2}
          >
            <option value="">Selecciona un tipo</option>
            {petTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Raza
          <input
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="Pug, Schnoodle…"
            tabIndex={3}
          />
        </label>

        <label>
          Nacimiento
          <div className="date-row">
            <input
              value={birthDateInput || formatIsoToLocal(birthDate)}
              onChange={(e) => handleBirthDateInput(e.target.value)}
              placeholder="dd/mm/aaaa"
              inputMode="numeric"
              tabIndex={4}
            />
            <button
              type="button"
              className="date-picker-btn"
              onClick={openBirthDatePicker}
              aria-label="Abrir selector de fecha"
            >
              📅
            </button>
            <input
              ref={birthDatePickerRef}
              className="date-picker-native"
              type="date"
              value={birthDate}
              onChange={(e) => {
                const next = e.target.value;
                setBirthDate(next);
                setBirthDateInput(formatIsoToLocal(next));
              }}
            />
          </div>
        </label>

        <label className="col-span">
          Notas
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alergias, medicamentos, etc."
            tabIndex={5}
          />
        </label>

        <div className="row">
          <button className="btn" type="submit" disabled={!canAdd} tabIndex={6}>
            + Agregar mascota
          </button>
          <span className="muted small">
            Tip: puedes cargar varias y luego filtrar visitas.
          </span>
        </div>
      </form>

      {pets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">Aún no agregas mascotas</div>
          <div className="muted small">
            Comienza registrando a tu primera mascota para crear visitas.
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
                    {p.petType ? `Tipo: ${p.petType}` : "Tipo: —"}
                  </div>
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
                        className="menu-item"
                        type="button"
                        onClick={() => startEdit(p)}
                      >
                        Editar mascota
                      </button>
                      <button
                        className="menu-item danger"
                        type="button"
                        onClick={() => setPendingDelete(p)}
                      >
                        Eliminar mascota
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
                  <div className="strong">
                    {formatIsoToDisplay(p.birthDate)}
                  </div>
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
      {editingPet ? (
        <div
          className="dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-mascota-title"
        >
          <div className="dialog">
            <h3 id="edit-mascota-title">Editar mascota</h3>
            <form onSubmit={submitEdit} className="grid">
              <label>
                Nombre *
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => setEditNameTouched(true)}
                  className={
                    editNameTouched ? (editNameValid ? "success" : "error") : ""
                  }
                  placeholder="Ginger, Luna, Gin…"
                />
                {editNameTouched && !editNameValid ? (
                  <span className="field-helper error">
                    Escribe al menos 2 caracteres.
                  </span>
                ) : null}
              </label>

              <label>
                Tipo de mascota
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                >
                  <option value="">Selecciona un tipo</option>
                  {petTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Raza
                <input
                  value={editBreed}
                  onChange={(e) => setEditBreed(e.target.value)}
                  placeholder="Pug, Schnoodle…"
                />
              </label>

              <label>
                Nacimiento
                <div className="date-row">
                  <input
                    value={editBirthDateInput || formatIsoToLocal(editBirthDate)}
                    onChange={(e) => handleEditBirthDateInput(e.target.value)}
                    placeholder="dd/mm/aaaa"
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    className="date-picker-btn"
                    onClick={openEditBirthDatePicker}
                    aria-label="Abrir selector de fecha"
                  >
                    📅
                  </button>
                  <input
                    ref={editBirthDatePickerRef}
                    className="date-picker-native"
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => {
                      const next = e.target.value;
                      setEditBirthDate(next);
                      setEditBirthDateInput(formatIsoToLocal(next));
                    }}
                  />
                </div>
              </label>

              <label className="col-span">
                Notas
                <input
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Alergias, medicamentos, etc."
                />
              </label>

              <div className="row">
                <button className="btn secondary" type="button" onClick={cancelEdit}>
                  Cancelar
                </button>
                <button className="btn" type="submit" disabled={!editNameValid}>
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={
          pendingDelete
            ? `Eliminar ${pendingDelete.name}`
            : "Eliminar mascota"
        }
        description="Esto eliminará la mascota y todas sus visitas asociadas."
        confirmText="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
