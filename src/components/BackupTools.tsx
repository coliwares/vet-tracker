import React, { useRef, useState } from "react";
import type { AppState } from "../types";
import { downloadJson, readJsonFile } from "../storage";
import { mergeData, type MergeSummary } from "../utils/backupMerge";

type Props = {
  state: AppState;
  onImport: (state: AppState) => void;
};

export function BackupTools({ state, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);
  const [mergeSummary, setMergeSummary] = useState<MergeSummary | null>(null);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = (await readJsonFile(file)) as AppState;
      if (!parsed || parsed.version !== 1) throw new Error("Formato inválido");
      if (!Array.isArray(parsed.pets) || !Array.isArray(parsed.visits))
        throw new Error("Formato inválido");

      setPendingImport(parsed);
    } catch {
      alert("No pude importar ese archivo. Revisa que sea un backup válido.");
    } finally {
      // reset para poder reimportar el mismo archivo si quieres
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleReplace() {
    if (!pendingImport) return;
    const result = mergeData(state, pendingImport, "replace");
    onImport(result.state);
    setMergeSummary(result.summary);
    setPendingImport(null);
  }

  function handleMerge() {
    if (!pendingImport) return;
    const result = mergeData(state, pendingImport, "merge");
    onImport(result.state);
    setMergeSummary(result.summary);
    setPendingImport(null);
  }

  function handleCancel() {
    setPendingImport(null);
    setMergeSummary(null);
  }

  return (
    <section className="card">
      <h2>💾 Respaldo</h2>

      <div className="row">
        <button
          className="btn"
          onClick={() =>
            downloadJson(
              `vet-visits-backup-${new Date().toISOString().slice(0, 10)}.json`,
              state,
            )
          }
        >
          Exportar JSON
        </button>

        <label className="btn secondary">
          Importar JSON
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={handlePick}
            style={{ display: "none" }}
          />
        </label>

        <span className="muted">
          Recomendado: exporta 1 vez al mes o antes de cambiar de PC.
        </span>
      </div>

      {pendingImport ? (
        <div className="backup-preview">
          <div className="strong">
            Vas a importar {pendingImport.visits.length} visitas y {" "}
            {pendingImport.pets.length} mascotas.
          </div>
          <div className="muted small">
            Puedes reemplazar todo o combinar (deduplicar) usando las claves
            sugeridas.
          </div>
          <div className="row">
            <button className="btn" type="button" onClick={handleReplace}>
              Reemplazar todo
            </button>
            <button className="btn secondary" type="button" onClick={handleMerge}>
              Combinar (deduplicar)
            </button>
            <button className="btn secondary" type="button" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {mergeSummary ? (
        <div className="merge-summary" role="status" aria-live="polite">
          <div className="strong">Resultado de la combinacion</div>
          <div className="muted small">
            Mascotas: {mergeSummary.pets.kept} mantenidas, {" "}
            {mergeSummary.pets.discarded} descartadas.
          </div>
          <div className="muted small">
            Visitas: {mergeSummary.visits.kept} mantenidas, {" "}
            {mergeSummary.visits.discarded} descartadas.
          </div>
        </div>
      ) : null}
    </section>
  );
}
