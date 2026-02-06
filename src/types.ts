export type Pet = {
id: string;
name: string;
breed?: string;
birthDate?: string; // YYYY-MM-DD
notes?: string;
};


export type VetVisit = {
id: string;
petId: string;
date: string; // YYYY-MM-DD
clinic?: string;
vet?: string;
reason: string;
diagnosis?: string;
treatment?: string;
costCLP?: number;
nextVisitDate?: string; // YYYY-MM-DD
notes?: string;
createdAt: string; // ISO
updatedAt: string; // ISO
};


export type AppState = {
version: number;
pets: Pet[];
visits: VetVisit[];
};