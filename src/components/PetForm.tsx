import React, { useMemo, useState } from "react";
import type { Pet } from "../types";
import { newId } from "../storage";


type Props = {
pets: Pet[];
onAdd: (pet: Pet) => void;
onDelete: (petId: string) => void;
};

export function PetForm({ pets, onAdd, onDelete }: Props) {
const [name, setName] = useState("");
const [breed, setBreed] = useState("");
const [birthDate, setBirthDate] = useState("");
const [notes, setNotes] = useState("");


const canAdd = useMemo(() => name.trim().length >= 2, [name]);


function submit(e: React.FormEvent) {
e.preventDefault();
if (!canAdd) return;


onAdd({
id: newId(),
name: name.trim(),
breed: breed.trim() || undefined,
birthDate: birthDate || undefined,
notes: notes.trim() || undefined,
});


setName("");
setBreed("");
setBirthDate("");
setNotes("");
}



return (
<section className="card">
<h2>🐶 Perritas</h2>


<form onSubmit={submit} className="grid">
<label>
Nombre *
<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ginger, Luna, Gin…" />
</label>


<label>
Raza
<input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Pug, Schnoodle…" />
</label>


<label>
Nacimiento
<input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
</label>


<label className="col-span">
Notas
<input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alergias, medicamentos, etc." />
</label>


<div className="row">
<button className="btn" type="submit" disabled={!canAdd}>
+ Agregar perrita
</button>
<span className="muted">Tip: puedes cargar varias y luego filtrar visitas.</span>
</div>
</form>


{pets.length === 0 ? (
<p className="muted">Aún no agregas perritas.</p>
) : (
<ul className="list">
{pets.map((p) => (
<li key={p.id} className="list-item">
<div>
<div className="strong">{p.name}</div>
<div className="muted small">
{p.breed ? `Raza: ${p.breed} · ` : ""}
{p.birthDate ? `Nacimiento: ${p.birthDate}` : ""}
</div>
{p.notes ? <div className="muted small">{p.notes}</div> : null}
</div>


<button className="btn danger" onClick={() => onDelete(p.id)} title="Eliminar perrita">
Eliminar
</button>
</li>
))}
</ul>
)}
</section>
);
}