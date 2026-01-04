import { createClient } from '@supabase/supabase-js';
import { Applicant } from '../types';

// Configuration Supabase
const supabaseUrl = 'https://geqxvlieqwrssuipypju.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXh2bGllcXdyc3N1aXB5cGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODI0ODMsImV4cCI6MjA3MDA1ODQ4M30.5aW8yfRTzeKSI7Y9JTs9WL9IASo5h-DzsWIbGUL3Xe0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper pour mapper les données de la DB (snake_case) vers notre app (camelCase)
const mapFromDb = (row: any): Applicant => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  phone: row.phone,
  position: row.position,
  startDate: row.start_date,
  endDate: row.end_date,
  notes: row.notes,
  cvFileName: row.cv_file_name,
  cvUrl: row.cv_file_path, // Mapping de la colonne cv_file_path vers la propriété interne cvUrl
  submittedAt: new Date(row.created_at).getTime(),
  status: row.status
});

// Fonction pour uploader le CV avec fallback Base64 si le bucket n'est pas accessible
export const uploadCV = async (file: File): Promise<string | null> => {
  try {
    // 1. Tentative d'upload vers Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('cv')
      .upload(filePath, file);

    if (uploadError) {
      // Info plutôt que Warn pour ne pas inquiéter si le fallback est le comportement attendu
      console.info("Storage non disponible (RLS ou inexistant). Passage automatique en mode stockage interne (Base64).");
      throw uploadError; // Déclenche le catch pour le fallback
    }

    // Récupération de l'URL publique si l'upload réussit
    const { data } = supabase.storage
      .from('cv')
      .getPublicUrl(filePath);

    return data.publicUrl;

  } catch (error) {
    // 2. Fallback: Conversion en Data URI (Base64) pour stockage direct en base de données
    // Cela permet de ne pas bloquer l'utilisateur si le bucket est mal configuré
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return base64;
    } catch (fallbackError) {
      console.error("Erreur critique: Impossible de traiter le fichier CV.", fallbackError);
      return null;
    }
  }
};

export const getApplicants = async (): Promise<Applicant[]> => {
  const { data, error } = await supabase
    .from('applicants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des candidats:', error);
    return [];
  }

  return data ? data.map(mapFromDb) : [];
};

export const saveApplicant = async (applicant: Applicant): Promise<void> => {
  // On omet l'ID pour laisser Supabase le générer via uuid_generate_v4()
  // ou on utilise celui généré par le front si nécessaire.
  const { error } = await supabase.from('applicants').insert([{
    id: applicant.id, 
    first_name: applicant.firstName,
    last_name: applicant.lastName,
    email: applicant.email,
    phone: applicant.phone,
    position: applicant.position,
    start_date: applicant.startDate,
    end_date: applicant.endDate,
    notes: applicant.notes,
    cv_file_name: applicant.cvFileName,
    cv_file_path: applicant.cvUrl, // Peut contenir une URL ou une Data URI
    status: 'NEW'
  }]);

  if (error) {
    console.error("Erreur lors de la sauvegarde du candidat:", error);
    // Message d'erreur plus explicite pour le débogage
    if (error.code === '42P01') {
      console.error("LA TABLE 'applicants' N'EXISTE PAS. Veuillez exécuter le script SQL de création de table.");
    }
    throw error;
  }
};

export const updateApplicant = async (applicant: Applicant): Promise<void> => {
  const { error } = await supabase.from('applicants').update({
    status: applicant.status,
    position: applicant.position
  }).eq('id', applicant.id);

  if (error) console.error("Erreur lors de la mise à jour:", error);
};

export const deleteApplicant = async (id: string): Promise<void> => {
  const { error } = await supabase.from('applicants').delete().eq('id', id);
  if (error) console.error("Erreur lors de la suppression:", error);
};