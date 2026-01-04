import { Applicant } from "../types";

// Ce fichier est conservé pour éviter les erreurs d'import, mais les fonctions sont désactivées.
// Aucune clé API n'est requise et aucun coût ne sera engendré.

export const generateFlyerBackground = async (prompt: string): Promise<string | null> => {
  console.log("La génération de flyers est désactivée.");
  return null;
};

export const analyzeApplicant = async (applicant: Applicant): Promise<{ summary: string; score: number } | null> => {
  console.log("L'analyse IA est désactivée.");
  return null;
};