import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Pet, VetVisit } from "../types";
import { newId } from "../storage";
import { formatCLP, parseCLP } from "../utils/currency";
import {
  formatIsoToLocal,
  normalizeLocalDateInput,
  parseLocalDate,
} from "../utils/date";

type Props = {
  pets: Pet[];
  defaultPetId?: string;
  onAdd: (visit: VetVisit) => void;
};

export function VisitForm({ pets, defaultPetId, onAdd }: Props) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const toastTimerRef = useRef<number | null>(null);

  const [petId, setPetId] = useState(defaultPetId ?? pets[0]?.id ?? "");
  const [date, setDate] = useState(todayIso);
  const [dateInput, setDateInput] = useState(formatIsoToLocal(todayIso));
  const [reason, setReason] = useState("");
  const [costInput, setCostInput] = useState<string>("");
  const [clinic, setClinic] = useState("");
  const [vet, setVet] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [nextVisitDate, setNextVisitDate] = useState("");
  const [nextVisitDateInput, setNextVisitDateInput] = useState("");
  const [notes, setNotes] = useState("");
  const [petTouched, setPetTouched] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);
  const [reasonTouched, setReasonTouched] = useState(false);
  const [costTouched, setCostTouched] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const visitDatePickerRef = useRef<HTMLInputElement | null>(null);
  const nextVisitDatePickerRef = useRef<HTMLInputElement | null>(null);

  const reasonTemplates = [
    "Vacuna",
    "Control",
    "Piel",
    "Vómitos",
    "Cirugía",
    "Exámenes",
  ];

  const petValid = Boolean(petId);
  const dateValid = Boolean(date);
  const reasonValid = reason.trim().length >= 3;
  const parsedCostValue = useMemo(() => parseCLP(costInput), [costInput]);
  const costValid =
    costInput.trim() === "" ||
    (!Number.isNaN(parsedCostValue) && parsedCostValue >= 0);

  const canAdd = useMemo(
    () => pets.length > 0 && petValid && reasonValid && dateValid && costValid,
    [pets.length, petValid, reasonValid, dateValid, costValid],
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  function resetForm(keepPet: boolean) {
    if (!keepPet) setPetId("");
    setDate(todayIso);
    setDateInput(formatIsoToLocal(todayIso));
    setReason("");
    setCostInput("");
    setClinic("");
    setVet("");
    setDiagnosis("");
    setTreatment("");
    setNextVisitDate("");
    setNextVisitDateInput("");
    setNotes("");
    setReasonTouched(false);
    setDateTouched(false);
    setPetTouched(false);
    setCostTouched(false);
    setDetailsOpen(false);
  }

  function handleDateInput(value: string) {
    const normalized = normalizeLocalDateInput(value);
    setDateInput(normalized);
    const parsed = parseLocalDate(normalized);
    setDate(parsed);
  }

  function handleNextVisitInput(value: string) {
    const normalized = normalizeLocalDateInput(value);
    setNextVisitDateInput(normalized);
    const parsed = parseLocalDate(normalized);
    setNextVisitDate(parsed);
  }

  function openDatePicker(ref: React.RefObject<HTMLInputElement | null>) {
    const picker = ref.current;
    if (!picker) return;
    if (picker.showPicker) {
      picker.showPicker();
      return;
    }
    picker.focus();
    picker.click();
  }

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }

  function handleCostChange(value: string) {
    const digits = value.replace(/[^0-9]/g, "");
    if (!digits) {
      setCostInput("");
      return;
    }
    const numeric = Number(digits);
    setCostInput(Number.isNaN(numeric) ? "" : formatCLP(numeric));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) {
      setPetTouched(true);
      setDateTouched(true);
      setReasonTouched(true);
      setCostTouched(true);
      return;
    }

    const nowIso = new Date().toISOString();
    const parsedCost =
      costInput.trim() === "" || Number.isNaN(parsedCostValue)
        ? undefined
        : parsedCostValue;

    const petName = pets.find((p) => p.id === petId)?.name ?? "tu mascota";

    onAdd({
      id: newId(),
      petId,
      date,
      clinic: clinic.trim() || undefined,
      vet: vet.trim() || undefined,
      reason: reason.trim(),
      diagnosis: diagnosis.trim() || undefined,
      treatment: treatment.trim() || undefined,
      costCLP: parsedCost,
      nextVisitDate: nextVisitDate || undefined,
      notes: notes.trim() || undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    showToast(
      `✅ Visita guardada para ${petName} – ${formatIsoToLocal(date)}`,
    );
    resetForm(true);
  }

  return (
    <section className="card">
      <h2>🩺 Nueva visita</h2>

      {toast ? (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}

      {pets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">Primero registra una mascota</div>
          <div className="muted small">
            Luego podrás anotar vacunas, controles y tratamientos.
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="grid">
          <label>
            Mascota *
            <select
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              onBlur={() => setPetTouched(true)}
              className={petTouched ? (petValid ? "success" : "error") : ""}
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {petTouched && !petValid ? (
              <span className="field-helper error">Selecciona una mascota.</span>
            ) : null}
          </label>

          <label>
            Fecha *
            <div className="date-row">
              <input
                value={dateInput || formatIsoToLocal(date)}
                onChange={(e) => handleDateInput(e.target.value)}
                onBlur={() => setDateTouched(true)}
                className={dateTouched ? (dateValid ? "success" : "error") : ""}
                placeholder="dd/mm/aaaa"
                inputMode="numeric"
              />
              <button
                type="button"
                className="date-picker-btn"
                onClick={() => openDatePicker(visitDatePickerRef)}
                aria-label="Abrir selector de fecha"
              >
                📅
              </button>
              <input
                ref={visitDatePickerRef}
                className="date-picker-native"
                type="date"
                value={date}
                onChange={(e) => {
                  const next = e.target.value;
                  setDate(next);
                  setDateInput(formatIsoToLocal(next));
                }}
              />
            </div>
            {dateTouched && !dateValid ? (
              <span className="field-helper error">Selecciona una fecha.</span>
            ) : null}
          </label>

          <label className="col-span">
            Motivo *
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setReasonTouched(true)}
              className={reasonTouched ? (reasonValid ? "success" : "error") : ""}
              placeholder="Vacuna, control, vómitos, piel, etc."
            />
            {reasonTouched && !reasonValid ? (
              <span className="field-helper error">
                Describe el motivo en al menos 3 caracteres.
              </span>
            ) : null}
            <div className="chip-group">
              {reasonTemplates.map((template) => (
                <button
                  key={template}
                  type="button"
                  className="chip-btn"
                  aria-pressed={reason === template}
                  onClick={() => {
                    setReason(template);
                    setReasonTouched(true);
                  }}
                >
                  {template}
                </button>
              ))}
            </div>
          </label>

          <label>
            Costo (CLP)
            <input
              value={costInput}
              onChange={(e) => handleCostChange(e.target.value)}
              onBlur={() => setCostTouched(true)}
              className={costTouched ? (costValid ? "success" : "error") : ""}
              placeholder="$25.000"
              inputMode="numeric"
            />
            {costTouched && !costValid ? (
              <span className="field-helper error">
                El costo debe ser un número mayor o igual a 0.
              </span>
            ) : (
              <span className="field-helper">Opcional: escribe el monto.</span>
            )}
          </label>

          <details
            className="details col-span"
            open={detailsOpen}
            onToggle={(e) =>
              setDetailsOpen((e.target as HTMLDetailsElement).open)
            }
          >
            <summary>Agregar detalles</summary>
            <div className="grid">
              <label>
                Diagnóstico
                <input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Opcional"
                />
                <span className="field-helper">
                  Opcional: resultado o impresión diagnóstica.
                </span>
              </label>

              <label>
                Tratamiento
                <input
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Medicamentos / indicaciones"
                />
                <span className="field-helper">
                  Opcional: medicamentos, dosis o cuidados.
                </span>
              </label>

              <label>
                Clínica
                <input
                  value={clinic}
                  onChange={(e) => setClinic(e.target.value)}
                  placeholder="Ej: Vet Los Dominicos"
                />
                <span className="field-helper">
                  Opcional: agrega el nombre de la clínica.
                </span>
              </label>

              <label>
                Veterinario/a
                <input
                  value={vet}
                  onChange={(e) => setVet(e.target.value)}
                  placeholder="Nombre"
                />
                <span className="field-helper">
                  Opcional: nombre de la persona que atendió.
                </span>
              </label>

              <label className="col-span">
                Notas
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones, exámenes, etc."
                />
                <span className="field-helper">
                  Opcional: detalles extra o recomendaciones.
                </span>
              </label>
            </div>
          </details>

          <label>
            Próxima cita
            <div className="date-row">
              <input
                value={nextVisitDateInput || formatIsoToLocal(nextVisitDate)}
                onChange={(e) => handleNextVisitInput(e.target.value)}
                placeholder="dd/mm/aaaa"
                inputMode="numeric"
              />
              <button
                type="button"
                className="date-picker-btn"
                onClick={() => openDatePicker(nextVisitDatePickerRef)}
                aria-label="Abrir selector de fecha"
              >
                📅
              </button>
              <input
                ref={nextVisitDatePickerRef}
                className="date-picker-native"
                type="date"
                value={nextVisitDate}
                onChange={(e) => {
                  const next = e.target.value;
                  setNextVisitDate(next);
                  setNextVisitDateInput(formatIsoToLocal(next));
                }}
              />
            </div>
            <span className="field-helper">
              Opcional: fecha de control o vacuna.
            </span>
          </label>

          <div className="row">
            <button className="btn" type="submit" disabled={!canAdd}>
              Guardar visita
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => resetForm(true)}
            >
              + Agregar otra visita
            </button>
            {!canAdd ? (
              <span className="muted small">
                Completa mascota + fecha + motivo.
              </span>
            ) : null}
          </div>
        </form>
      )}
    </section>
  );
}
