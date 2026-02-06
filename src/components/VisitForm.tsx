import React, { useMemo, useState } from "react";
import type { Pet, VetVisit } from "../types";
import { newId } from "../storage";

type Props = {
  pets: Pet[];
  defaultPetId?: string;
  onAdd: (visit: VetVisit) => void;
};

export function VisitForm({ pets, defaultPetId, onAdd }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const [petId, setPetId] = useState(defaultPetId ?? pets[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [clinic, setClinic] = useState("");
  const [vet, setVet] = useState("");
  const [reason, setReason] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [costCLP, setCostCLP] = useState<string>("");
  const [nextVisitDate, setNextVisitDate] = useState("");
  const [notes, setNotes] = useState("");
  const [petTouched, setPetTouched] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);
  const [reasonTouched, setReasonTouched] = useState(false);

  const petValid = Boolean(petId);
  const dateValid = Boolean(date);
  const reasonValid = reason.trim().length >= 3;

  const canAdd = useMemo(
    () => pets.length > 0 && petValid && reasonValid && dateValid,
    [pets.length, petValid, reasonValid, dateValid],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) {
      setPetTouched(true);
      setDateTouched(true);
      setReasonTouched(true);
      return;
    }

    const nowIso = new Date().toISOString();
    const parsedCost = costCLP.trim()
      ? Number(costCLP.replace(/[^0-9]/g, ""))
      : undefined;

    onAdd({
      id: newId(),
      petId,
      date,
      clinic: clinic.trim() || undefined,
      vet: vet.trim() || undefined,
      reason: reason.trim(),
      diagnosis: diagnosis.trim() || undefined,
      treatment: treatment.trim() || undefined,
      costCLP: Number.isFinite(parsedCost as number) ? parsedCost : undefined,
      nextVisitDate: nextVisitDate || undefined,
      notes: notes.trim() || undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    // reset parcial
    setReason("");
    setDiagnosis("");
    setTreatment("");
    setCostCLP("");
    setNextVisitDate("");
    setNotes("");
  }

  return (
    <section className="card">
      <h2>🩺 Nueva visita</h2>

      {pets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">Primero registra una perrita</div>
          <div className="muted small">
            Luego podrás anotar vacunas, controles y tratamientos.
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="grid">
          <label>
            Perrita *
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
              <span className="field-helper error">Selecciona una perrita.</span>
            ) : null}
          </label>

          <label>
            Fecha *
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onBlur={() => setDateTouched(true)}
              className={dateTouched ? (dateValid ? "success" : "error") : ""}
            />
            {dateTouched && !dateValid ? (
              <span className="field-helper error">Selecciona una fecha.</span>
            ) : null}
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
          </label>

          <label className="col-span">
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

          <label className="col-span">
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
            Costo (CLP)
            <input
              value={costCLP}
              onChange={(e) => setCostCLP(e.target.value)}
              placeholder="Ej: 25000"
              inputMode="numeric"
            />
            <span className="field-helper">
              Opcional: solo números, sin puntos ni comas.
            </span>
          </label>

          <label>
            Próxima cita
            <input
              type="date"
              value={nextVisitDate}
              onChange={(e) => setNextVisitDate(e.target.value)}
            />
            <span className="field-helper">
              Opcional: fecha de control o vacuna.
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

          <div className="row">
            <button className="btn" type="submit" disabled={!canAdd}>
              + Guardar visita
            </button>
            {!canAdd ? (
              <span className="muted small">
                Completa perrita + fecha + motivo.
              </span>
            ) : null}
          </div>
        </form>
      )}
    </section>
  );
}
