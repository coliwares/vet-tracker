import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import type { AppState, Pet, VetVisit } from "./types";
import { emptyState, loadState, saveState } from "./storage";
import { PetForm } from "./components/PetForm";
import { VisitForm } from "./components/VisitForm";
import { VisitList } from "./components/VisitList";
import { BackupTools } from "./components/BackupTools";
import { ConfirmDialog } from "./components/ConfirmDialog";
import {
  getDashboardStats,
  type VisitRange,
} from "./utils/visits";
import type { SortKey } from "./utils/visitFilters";
import { formatIsoToDisplay } from "./utils/date";

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [filterPetId, setFilterPetId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [activeSection, setActiveSection] = useState<
    "dashboard" | "visits" | "pets" | "settings"
  >("dashboard");
  const [dashboardRange, setDashboardRange] = useState<VisitRange>("90d");
  const [visitRange, setVisitRange] = useState<VisitRange>("all");
  const [visitSort, setVisitSort] = useState<SortKey>("newest");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [undoVisit, setUndoVisit] = useState<
    { visit: VetVisit; timeoutId: number } | null
  >(null);
  const visitFormRef = useRef<HTMLDivElement | null>(null);
  const visitListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const dashboardStats = useMemo(
    () => getDashboardStats(state.visits, dashboardRange),
    [state.visits, dashboardRange],
  );

  const {
    filteredVisits,
    totalsByPet,
    petsInRangeCount,
    totalCost,
    lastVisit,
    nextAppointment,
  } = dashboardStats;

  function addPet(pet: Pet) {
    setState((s) => ({ ...s, pets: [pet, ...s.pets] }));
    // si es la primera, la dejamos como filtro por defecto (opcional)
    if (state.pets.length === 0) setFilterPetId(pet.id);
  }

  function updatePet(nextPet: Pet) {
    setState((s) => ({
      ...s,
      pets: s.pets.map((p) => (p.id === nextPet.id ? nextPet : p)),
    }));
  }

  function deletePet(petId: string) {
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
    const visit = state.visits.find((v) => v.id === visitId);
    if (!visit) return;
    setState((s) => ({
      ...s,
      visits: s.visits.filter((v) => v.id !== visitId),
    }));
    setUndoVisit((prev) => {
      if (prev) window.clearTimeout(prev.timeoutId);
      const timeoutId = window.setTimeout(() => {
        setUndoVisit(null);
      }, 6500);
      return { visit, timeoutId };
    });
  }

  function importState(next: AppState) {
    setState(next);
    setFilterPetId("");
    setSearch("");
  }

  function resetAll() {
    setState(emptyState);
    setFilterPetId("");
    setSearch("");
    setShowResetDialog(false);
  }

  function undoDeleteVisit() {
    if (!undoVisit) return;
    window.clearTimeout(undoVisit.timeoutId);
    setState((s) => ({ ...s, visits: [undoVisit.visit, ...s.visits] }));
    setUndoVisit(null);
  }

  function formatCLP(n?: number) {
    if (n === undefined || n === null) return "—";
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

  function handleViewVisits(petId: string) {
    setFilterPetId(petId);
    setSearch("");
    setVisitRange("all");
    setVisitSort("newest");
    setActiveSection("visits");
    requestAnimationFrame(() => {
      visitListRef.current?.scrollIntoView({
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
              { id: "pets", label: "Mascotas" },
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
          <div className="dashboard-controls">
            <div className="muted small">Rango</div>
            <div className="range-filter" role="group" aria-label="Rango">
              {(
                [
                  { id: "30d", label: "Últimos 30" },
                  { id: "90d", label: "Últimos 90" },
                  { id: "year", label: "Año" },
                  { id: "all", label: "Todo" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`range-btn ${
                    dashboardRange === item.id ? "active" : ""
                  }`}
                  onClick={() => setDashboardRange(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <header className="header">
            <div>
              <h1>🐾 Vet Visits Tracker</h1>
              <p className="muted">
                Registro simple de visitas al veterinario para tus mascotas
                (offline).
              </p>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="muted small">Visitas</div>
                <div className="strong">{filteredVisits.length}</div>
              </div>
              <div className="stat">
                <div className="muted small">Mascotas</div>
                <div className="strong">{petsInRangeCount}</div>
              </div>
              <div className="stat">
                <div className="muted small">Gasto total</div>
                <div className="strong">{formatCLP(totalCost)}</div>
              </div>
            </div>
          </header>

          <div className="dashboard-cards">
            <section className="card">
              <h2>📅 Próxima cita</h2>
              {nextAppointment ? (
                <div className="card-body">
                  <div className="strong">
                    {formatIsoToDisplay(nextAppointment.date)}
                  </div>
                  <div className="muted small">
                    {state.pets.find((p) => p.id === nextAppointment.visit.petId)
                      ?.name ?? "Mascota"}
                    {nextAppointment.visit.clinic
                      ? ` · ${nextAppointment.visit.clinic}`
                      : ""}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-title">Sin próximas citas</div>
                  <div className="muted small">
                    Crea una visita y agenda la próxima fecha de control.
                  </div>
                  <button className="btn secondary" onClick={handleNewVisit}>
                    Crear visita
                  </button>
                </div>
              )}
            </section>

            <section className="card">
              <h2>🧾 Última visita registrada</h2>
              {lastVisit ? (
                <div className="card-body">
                  <div className="strong">{formatIsoToDisplay(lastVisit.date)}</div>
                  <div className="muted small">{lastVisit.reason}</div>
                  <div className="chip-amount">
                    {formatCLP(lastVisit.costCLP)}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-title">Sin visitas en este rango</div>
                  <div className="muted small">
                    Prueba otro rango o crea una visita para verlo aqui.
                  </div>
                  <button className="btn secondary" onClick={handleNewVisit}>
                    Crear visita
                  </button>
                </div>
              )}
            </section>
          </div>

          {filteredVisits.length > 0 ? (
            <section className="card">
              <h2>📊 Gasto por mascota</h2>
              <div className="chips">
                {state.pets.map((p) => {
                  const amount = totalsByPet.get(p.id);
                  if (amount === undefined) return null;
                  return (
                    <div key={p.id} className="chip">
                      <span className="chip-icon" aria-hidden="true">
                        {p.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="strong">{p.name}</span>
                      <span className="chip-amount">
                        {formatCLP(amount ?? 0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="card">
              <h2>📊 Gasto por mascota</h2>
              <div className="empty-state">
                <div className="empty-title">Sin datos para este rango</div>
                <div className="muted small">
                  Crea una visita o ajusta el rango para ver resultados.
                </div>
                <button className="btn secondary" onClick={handleNewVisit}>
                  Crear visita
                </button>
              </div>
            </section>
          )}

          <VisitList
            pets={state.pets}
            visits={state.visits}
            filterPetId={filterPetId}
            search={search}
            range={dashboardRange}
            sortKey={visitSort}
            onChangePetId={setFilterPetId}
            onChangeSearch={setSearch}
            onChangeRange={setDashboardRange}
            onChangeSort={setVisitSort}
            onDelete={deleteVisit}
            onClearFilters={() => {
              setFilterPetId("");
              setSearch("");
              setDashboardRange("90d");
              setVisitSort("newest");
            }}
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
          </div>

          <div className="layout">
            <div className="col" ref={visitFormRef}>
              <VisitForm
                pets={state.pets}
                defaultPetId={filterPetId || state.pets[0]?.id}
                onAdd={addVisit}
              />
            </div>

            <div className="col" ref={visitListRef}>
              <VisitList
                pets={state.pets}
                visits={state.visits}
                filterPetId={filterPetId}
                search={search}
                range={visitRange}
                sortKey={visitSort}
                onChangePetId={setFilterPetId}
                onChangeSearch={setSearch}
                onChangeRange={setVisitRange}
                onChangeSort={setVisitSort}
                onDelete={deleteVisit}
                onClearFilters={() => {
                  setFilterPetId("");
                  setSearch("");
                  setVisitRange("all");
                  setVisitSort("newest");
                }}
              />
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === "pets" ? (
        <section className="section">
          <div className="section-header">
            <div>
              <h2>Mascotas</h2>
              <p className="muted small">
                Administra perfiles, notas y datos base.
              </p>
            </div>
          </div>

          <div className="layout single">
            <div className="col">
              <PetForm
                pets={state.pets}
                onAdd={addPet}
                onUpdate={updatePet}
                onDelete={deletePet}
                onViewVisits={handleViewVisits}
              />
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
                <button
                  className="btn danger"
                  onClick={() => setShowResetDialog(true)}
                >
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
      {undoVisit ? (
        <div className="undo-toast" role="status" aria-live="polite">
          <span>
            Visita eliminada. Puedes deshacer durante unos segundos.
          </span>
          <button className="btn secondary" type="button" onClick={undoDeleteVisit}>
            Deshacer
          </button>
        </div>
      ) : null}
      <ConfirmDialog
        open={showResetDialog}
        title="Borrar todo"
        description="Esto eliminará mascotas y visitas en este navegador. Esta acción no se puede deshacer."
        confirmText="Borrar todo"
        requireTyping="BORRAR"
        onConfirm={resetAll}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
}
