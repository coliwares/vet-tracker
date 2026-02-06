import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import type { AppState, Pet, VetVisit } from "./types";
import { emptyState, loadState, saveState } from "./storage";
import { PetForm } from "./components/PetForm";
import { VisitForm } from "./components/VisitForm";
import { VisitList } from "./components/VisitList";
import { BackupTools } from "./components/BackupTools";

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [filterPetId, setFilterPetId] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    saveState(state);
  }, [state]);

  const totalsByPet = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of state.visits) {
      map.set(v.petId, (map.get(v.petId) ?? 0) + (v.costCLP ?? 0));
    }
    return map;
  }, [state.visits]);

  const totalAll = useMemo(
    () => state.visits.reduce((acc, v) => acc + (v.costCLP ?? 0), 0),
    [state.visits],
  );

  function addPet(pet: Pet) {
    setState((s) => ({ ...s, pets: [pet, ...s.pets] }));
    // si es la primera, la dejamos como filtro por defecto (opcional)
    if (state.pets.length === 0) setFilterPetId(pet.id);
  }

  function deletePet(petId: string) {
    const petName =
      state.pets.find((p) => p.id === petId)?.name ?? "esta perrita";
    const ok = confirm(
      `¿Eliminar ${petName}? También se eliminarán sus visitas asociadas.`,
    );
    if (!ok) return;

    setState((s) => ({
      ...s,
      pets: s.pets.filter((p) => p.id !== petId),
      visits: s.visits.filter((v) => v.petId !== petId),
    }));

    if (filterPetId === petId) setFilterPetId("");
  }

  function addVisit(visit: VetVisit) {
    setState((s) => ({ ...s, visits: [visit, ...s.visits] }));
  }

  function deleteVisit(visitId: string) {
    setState((s) => ({
      ...s,
      visits: s.visits.filter((v) => v.id !== visitId),
    }));
  }

  function importState(next: AppState) {
    const ok = confirm(
      "Esto reemplazará tus datos actuales por los del backup. ¿Continuar?",
    );
    if (!ok) return;
    setState(next);
    setFilterPetId("");
    setSearch("");
  }

  function resetAll() {
    const ok = confirm(
      "Esto borrará TODO (perritas y visitas) en este navegador. ¿Seguro?",
    );
    if (!ok) return;
    setState(emptyState);
    setFilterPetId("");
    setSearch("");
  }

  function formatCLP(n: number) {
    try {
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `$${n}`;
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>🐾 Vet Visits Tracker</h1>
          <p className="muted">
            Registro simple de visitas al veterinario para tus perritas
            (offline).
          </p>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="muted small">Visitas</div>
            <div className="strong">{state.visits.length}</div>
          </div>
          <div className="stat">
            <div className="muted small">Perritas</div>
            <div className="strong">{state.pets.length}</div>
          </div>
          <div className="stat">
            <div className="muted small">Gasto total</div>
            <div className="strong">{formatCLP(totalAll)}</div>
          </div>
        </div>
      </header>

      {state.pets.length > 0 ? (
        <section className="card">
          <h2>📊 Gasto por perrita</h2>
          <div className="chips">
            {state.pets.map((p) => (
              <div key={p.id} className="chip">
                <span className="chip-icon" aria-hidden="true">
                  {p.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="strong">{p.name}</span>
                <span className="chip-amount">
                  {formatCLP(totalsByPet.get(p.id) ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="layout">
        <div className="col">
          <PetForm pets={state.pets} onAdd={addPet} onDelete={deletePet} />
          <VisitForm
            pets={state.pets}
            defaultPetId={filterPetId || state.pets[0]?.id}
            onAdd={addVisit}
          />
          <BackupTools state={state} onImport={importState} />

          <section className="card">
            <h2>🧹 Mantenimiento</h2>
            <button className="btn danger" onClick={resetAll}>
              Borrar todo
            </button>
            <p className="muted small">
              Esto solo afecta este navegador (LocalStorage).
            </p>
          </section>
        </div>

        <div className="col">
          <VisitList
            pets={state.pets}
            visits={state.visits}
            filterPetId={filterPetId}
            search={search}
            onChangePetId={setFilterPetId}
            onChangeSearch={setSearch}
            onDelete={deleteVisit}
          />
        </div>
      </div>

      <footer className="footer muted small">
        Hecho para registrar visitas vet. Persistencia: LocalStorage. Exporta
        backups si lo necesitas.
      </footer>
    </div>
  );
}
