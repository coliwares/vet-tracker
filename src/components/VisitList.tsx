import { useMemo } from "react";
import type { Pet, VetVisit } from "../types";
import { formatCLP } from "../utils/currency";
import { formatIsoToDisplay } from "../utils/date";
import {
  applyFilters,
  type SortKey,
} from "../utils/visitFilters";
import type { VisitRange } from "../utils/visits";

type Props = {
  pets: Pet[];
  visits: VetVisit[];
  filterPetId: string;
  search: string;
  range: VisitRange;
  sortKey: SortKey;
  onChangePetId: (petId: string) => void;
  onChangeSearch: (q: string) => void;
  onChangeRange: (range: VisitRange) => void;
  onChangeSort: (sortKey: SortKey) => void;
  onDelete: (visitId: string) => void;
  onClearFilters: () => void;
  onNewVisit?: () => void;
};

export function VisitList({
  pets,
  visits,
  filterPetId,
  search,
  range,
  sortKey,
  onChangePetId,
  onChangeSearch,
  onChangeRange,
  onChangeSort,
  onDelete,
  onClearFilters,
  onNewVisit,
}: Props) {
  const petById = useMemo(() => new Map(pets.map((p) => [p.id, p])), [pets]);

  const filtered = useMemo(
    () =>
      applyFilters(visits, {
        petId: filterPetId,
        range,
        query: search,
        sortKey,
      }),
    [visits, filterPetId, range, search, sortKey],
  );

  const total = useMemo(
    () => filtered.reduce((acc, v) => acc + (v.costCLP ?? 0), 0),
    [filtered],
  );

  return (
    <section className="card">
      <h2>📚 Historial</h2>

      <div className="visit-filters">
        <div role="group" aria-label="Filtro por mascota">
          <div className="muted small">Mascota</div>
          <div className="filter-chips">
            <button
              type="button"
              className={`chip-toggle ${filterPetId === "" ? "active" : ""}`}
              aria-pressed={filterPetId === ""}
              onClick={() => onChangePetId("")}
            >
              Todas
            </button>
            {pets.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`chip-toggle ${
                  filterPetId === p.id ? "active" : ""
                }`}
                aria-pressed={filterPetId === p.id}
                onClick={() => onChangePetId(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div role="group" aria-label="Orden de resultados">
          <div className="muted small">Orden</div>
          <div className="filter-chips">
            {(
              [
                { id: "newest", label: "Más nuevas" },
                { id: "oldest", label: "Más antiguas" },
                { id: "cost", label: "Mayor costo" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                className={`chip-toggle ${
                  sortKey === item.id ? "active" : ""
                }`}
                aria-pressed={sortKey === item.id}
                onClick={() => onChangeSort(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div role="group" aria-label="Rango de fechas">
          <div className="muted small">Rango</div>
          <div className="filter-chips">
            {(
              [
                { id: "30d", label: "30" },
                { id: "90d", label: "90" },
                { id: "year", label: "Año" },
                { id: "all", label: "Todo" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                className={`chip-toggle ${
                  range === item.id ? "active" : ""
                }`}
                aria-pressed={range === item.id}
                onClick={() => onChangeRange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <label className="inline grow">
          Buscar
          <input
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="motivo, clínica, diagnóstico..."
          />
        </label>

        {onNewVisit ? (
          <button className="btn secondary" type="button" onClick={onNewVisit}>
            Nueva visita
          </button>
        ) : null}

        <div className="pill">
          Total filtrado: <b>{formatCLP(total)}</b>
        </div>
      </div>

      {visits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">Aún no registras visitas</div>
          <div className="muted small">
            Crea tu primera visita para comenzar el historial.
          </div>
          {onNewVisit ? (
            <button className="btn secondary" type="button" onClick={onNewVisit}>
              Crear primera visita
            </button>
          ) : null}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">Sin resultados con estos filtros</div>
          <div className="muted small">
            Prueba ajustar el rango o limpiar la búsqueda.
          </div>
          <button className="btn secondary" type="button" onClick={onClearFilters}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="visit-cards">
          {filtered.map((v) => (
            <article key={v.id} className="visit-card">
              <div className="visit-card-header">
                <div className="visit-date">
                  <div className="muted small">Fecha</div>
                  <div className="strong">{formatIsoToDisplay(v.date)}</div>
                </div>
                <div className="visit-meta">
                  <div className="strong">{v.reason}</div>
                  <div className="muted small">
                    {petById.get(v.petId)?.name ?? "—"}
                    {v.clinic ? ` · ${v.clinic}` : ""}
                  </div>
                </div>
                <div className="visit-cost">
                  <div className="muted small">Costo</div>
                  <div className="strong">{formatCLP(v.costCLP)}</div>
                </div>
              </div>

              <details className="visit-details">
                <summary>Ver detalles</summary>
                <div className="visit-details-grid">
                  <div>
                    <div className="muted small">Diagnóstico</div>
                    <div>{v.diagnosis ?? "—"}</div>
                  </div>
                  <div>
                    <div className="muted small">Tratamiento</div>
                    <div>{v.treatment ?? "—"}</div>
                  </div>
                  <div>
                    <div className="muted small">Notas</div>
                    <div>{v.notes ?? "—"}</div>
                  </div>
                  <div>
                    <div className="muted small">Próxima cita</div>
                    <div>{formatIsoToDisplay(v.nextVisitDate)}</div>
                  </div>
                </div>
              </details>

              <div className="visit-actions">
                <button className="btn danger" onClick={() => onDelete(v.id)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
