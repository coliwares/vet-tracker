import type { AppState } from "./types";


const STORAGE_KEY = "vet-visits-tracker:v1";
const BACKUP_META_KEY = "vet-visits-tracker:last-backup";

export type BackupMeta = {
	timestamp: string;
	petsCount: number;
	visitsCount: number;
};


export const emptyState: AppState = {
version: 1,
pets: [],
visits: [],
};


export function loadState(): AppState {
try {
const raw = localStorage.getItem(STORAGE_KEY);
if (!raw) return emptyState;
const parsed = JSON.parse(raw) as AppState;


// Validación mínima
if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.pets) || !Array.isArray(parsed.visits)) {
return emptyState;
}


return parsed;
} catch {
return emptyState;
}
}


export function saveState(state: AppState) {
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function saveBackupMeta(meta: BackupMeta) {
try {
localStorage.setItem(BACKUP_META_KEY, JSON.stringify(meta));
} catch {
// ignore storage errors
}
}

export function loadBackupMeta(): BackupMeta | null {
try {
const raw = localStorage.getItem(BACKUP_META_KEY);
if (!raw) return null;
const parsed = JSON.parse(raw) as BackupMeta;
if (!parsed || !parsed.timestamp) return null;
return parsed;
} catch {
return null;
}
}


export function downloadJson(filename: string, data: unknown) {
const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();
URL.revokeObjectURL(url);
}


export async function readJsonFile(file: File): Promise<AppState> {
const text = await file.text();
return JSON.parse(text) as AppState;
}


export function newId(): string {
// Navegadores modernos
if ("randomUUID" in crypto) return crypto.randomUUID();
// Fallback simple
return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}