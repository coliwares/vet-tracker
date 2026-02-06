import React, { useRef } from "react";
import type { AppState } from "../types";
import { downloadJson, readJsonFile } from "../storage";

type Props = {
  state: AppState;
  onImport: (state: AppState) => void;
};

export function BackupTools({ state, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = (await readJsonFile(file)) as AppState;
      if (!parsed || parsed.version !== 1) throw new Error("Formato inválido");
      if (!Array.isArray(parsed.pets) || !Array.isArray(parsed.visits))
        throw new Error("Formato inválido");

      onImport(parsed);
    } catch {
      alert("No pude importar ese archivo. Revisa que sea un backup válido.");
    } finally {
      // reset para poder reimportar el mismo archivo si quieres
      if (fileRef.current) fileRef.current.value = "";
    }
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
    </section>
  );
}
