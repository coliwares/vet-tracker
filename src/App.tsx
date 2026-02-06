import { useEffect, useMemo, useRef, useState } from "react";
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
  const [activeSection, setActiveSection] = useState<
    "dashboard" | "visits" | "pets" | "settings"
  >("dashboard");
  const visitFormRef = useRef<HTMLDivElement | null>(null);

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

  function handleNewVisit() {
    setActiveSection("visits");
    requestAnimationFrame(() => {
      visitFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <div className="logo" aria-hidden="true">
            🐾
          </div>
          <div>
            <div className="brand-title">Vet Visits Tracker</div>
            <div className="muted small">
              Registro simple de visitas al veterinario (offline).
            </div>
          </div>
        </div>

        <nav className="nav" aria-label="Secciones principales">
          {(
            [
              { id: "dashboard", label: "Dashboard" },
              { id: "visits", label: "Visitas" },
              { id: "pets", label: "Perritas" },
              { id: "settings", label: "Ajustes" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-btn ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(item.id)}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {activeSection === "dashboard" ? (
        <section className="section">
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

          <VisitList
            pets={state.pets}
            visits={state.visits}
            filterPetId={filterPetId}
            search={search}
            onChangePetId={setFilterPetId}
            onChangeSearch={setSearch}
            onDelete={deleteVisit}
            onNewVisit={handleNewVisit}
          />
        </section>
      ) : null}

      {activeSection === "visits" ? (
        <section className="section">
          <div className="section-header">
            <div>
              <h2>Visitas</h2>
              <p className="muted small">
                Registra nuevas visitas y consulta el historial filtrado.
              </p>
            </div>
            <div className="section-actions">
              <button className="btn" type="button" onClick={handleNewVisit}>
                Nueva visita
              </button>
            </div>
          </div>

          <div className="layout">
            <div className="col" ref={visitFormRef}>
              <VisitForm
                pets={state.pets}
                defaultPetId={filterPetId || state.pets[0]?.id}
                onAdd={addVisit}
              />
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
                onNewVisit={handleNewVisit}
              />
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === "pets" ? (
        <section className="section">
          <div className="section-header">
            <div>
              <h2>Perritas</h2>
              <p className="muted small">
                Administra perfiles, notas y datos base.
              </p>
            </div>
          </div>

          <div className="layout single">
            <div className="col">
              <PetForm pets={state.pets} onAdd={addPet} onDelete={deletePet} />
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === "settings" ? (
        <section className="section">
          <div className="section-header">
            <div>
              <h2>Ajustes</h2>
              <p className="muted small">
                Respaldo y mantenimiento de tus datos locales.
              </p>
            </div>
          </div>

          <div className="layout single">
            <div className="col">
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
          </div>
        </section>
      ) : null}

      <footer className="footer muted small">
        Hecho para registrar visitas vet. Persistencia: LocalStorage. Exporta
        backups si lo necesitas.
      </footer>
    </div>
  );
}
