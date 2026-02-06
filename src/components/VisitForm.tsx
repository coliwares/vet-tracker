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

  const canAdd = useMemo(
    () => pets.length > 0 && petId && reason.trim().length >= 3 && date,
    [pets.length, petId, reason, date],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) return;

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
        <p className="muted">
          Primero agrega al menos una perrita para registrar visitas.
        </p>
      ) : (
        <form onSubmit={submit} className="grid">
          <label>
            Perrita *
            <select value={petId} onChange={(e) => setPetId(e.target.value)}>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Fecha *
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label>
            Clínica
            <input
              value={clinic}
              onChange={(e) => setClinic(e.target.value)}
              placeholder="Ej: Vet Los Dominicos"
            />
          </label>

          <label>
            Veterinario/a
            <input
              value={vet}
              onChange={(e) => setVet(e.target.value)}
              placeholder="Nombre"
            />
          </label>

          <label className="col-span">
            Motivo *
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Vacuna, control, vómitos, piel, etc."
            />
          </label>

          <label className="col-span">
            Diagnóstico
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Opcional"
            />
          </label>

          <label className="col-span">
            Tratamiento
            <input
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Medicamentos / indicaciones"
            />
          </label>

          <label>
            Costo (CLP)
            <input
              value={costCLP}
              onChange={(e) => setCostCLP(e.target.value)}
              placeholder="Ej: 25000"
              inputMode="numeric"
            />
          </label>

          <label>
            Próxima cita
            <input
              type="date"
              value={nextVisitDate}
              onChange={(e) => setNextVisitDate(e.target.value)}
            />
          </label>

          <label className="col-span">
            Notas
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones, exámenes, etc."
            />
          </label>

          <div className="row">
            <button className="btn" type="submit" disabled={!canAdd}>
              + Guardar visita
            </button>
            {!canAdd ? (
              <span className="muted">Completa perrita + fecha + motivo.</span>
            ) : null}
          </div>
        </form>
      )}
    </section>
  );
}
