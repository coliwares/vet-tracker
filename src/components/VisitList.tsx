import React, { useMemo } from "react";
import type { Pet, VetVisit } from "../types";


type Props = {
pets: Pet[];
visits: VetVisit[];
filterPetId: string;
search: string;
onChangePetId: (petId: string) => void;
onChangeSearch: (q: string) => void;
onDelete: (visitId: string) => void;
};

function formatCLP(n?: number) {
if (!n && n !== 0) return "—";
try {
return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
} catch {
return `$${n}`;
}
}

export function VisitList({ pets, visits, filterPetId, search, onChangePetId, onChangeSearch, onDelete }: Props) {
const petById = useMemo(() => new Map(pets.map((p) => [p.id, p])), [pets]);


const filtered = useMemo(() => {
const q = search.trim().toLowerCase();
return visits
.filter((v) => (filterPetId ? v.petId === filterPetId : true))
.filter((v) => {
if (!q) return true;
const hay = [
v.reason,
v.clinic,
v.vet,
v.diagnosis,
v.treatment,
v.notes,
petById.get(v.petId)?.name,
]
.filter(Boolean)
.join(" ")
.toLowerCase();
return hay.includes(q);
})
.sort((a, b) => (a.date < b.date ? 1 : -1));
}, [visits, filterPetId, search, petById]);

const total = useMemo(() => filtered.reduce((acc, v) => acc + (v.costCLP ?? 0), 0), [filtered]);


return (
<section className="card">
<h2>📚 Historial</h2>


<div className="toolbar">
<label className="inline">
Perrita
<select value={filterPetId} onChange={(e) => onChangePetId(e.target.value)}>
<option value="">Todas</option>
{pets.map((p) => (
<option key={p.id} value={p.id}>
{p.name}
</option>
))}
</select>
</label>


<label className="inline grow">
Buscar
<input value={search} onChange={(e) => onChangeSearch(e.target.value)} placeholder="vacuna, clínica, diagnóstico…" />
</label>


<div className="pill">Total filtrado: <b>{formatCLP(total)}</b></div>
</div>

{filtered.length === 0 ? (
<p className="muted">No hay visitas con esos filtros.</p>
) : (
<div className="table">
<div className="thead">
<div>Fecha</div>
<div>Perrita</div>
<div>Motivo</div>
<div>Clínica</div>
<div>Costo</div>
<div></div>
</div>


{filtered.map((v) => (
<div key={v.id} className="trow">
<div>{v.date}</div>
<div>{petById.get(v.petId)?.name ?? "—"}</div>
<div>
<div className="strong">{v.reason}</div>
<div className="muted small">
{v.diagnosis ? `Dx: ${v.diagnosis} · ` : ""}
{v.nextVisitDate ? `Próx: ${v.nextVisitDate}` : ""}
</div>
{v.treatment ? <div className="muted small">Tx: {v.treatment}</div> : null}
{v.notes ? <div className="muted small">Notas: {v.notes}</div> : null}
</div>
<div>{v.clinic ?? "—"}</div>
<div>{formatCLP(v.costCLP)}</div>
<div className="right">
<button className="btn danger" onClick={() => onDelete(v.id)}>
Eliminar
</button>
</div>
</div>
))}
</div>
)}
</section>
);
}