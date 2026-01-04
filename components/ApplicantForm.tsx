import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Applicant, ApplicationStatus } from '../types';
import { saveApplicant, uploadCV } from '../utils/storage';
import { Loader2, Upload, CheckCircle, ArrowRight } from 'lucide-react';

const ApplicantForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<Applicant>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let cvUrl = undefined;
      
      // Upload du fichier vers le bucket 'cv' si présent
      if (file) {
        const url = await uploadCV(file);
        if (url) {
          cvUrl = url;
        } else {
          throw new Error("Erreur lors de l'upload du CV");
        }
      }

      const newApplicant: Applicant = {
        id: uuidv4(),
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        email: formData.email!,
        phone: formData.phone!,
        position: formData.position!,
        startDate: formData.startDate!,
        endDate: formData.endDate!,
        notes: formData.notes || '',
        cvFileName: file?.name,
        cvUrl: cvUrl, // Stockage de l'URL au lieu du Base64
        submittedAt: Date.now(),
        status: ApplicationStatus.NEW
      };

      await saveApplicant(newApplicant);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Échec de l'envoi de la candidature. Vérifiez votre connexion ou réessayez plus tard.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#DAF6FC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-green-500">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-[#061E3E] mb-2">Merci !</h2>
          <p className="text-gray-600 mb-8">
            Votre candidature pour le poste de <span className="font-semibold text-[#145A8B]">{formData.position}</span> a bien été reçue. Nous vous contacterons bientôt !
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-[#145A8B] hover:text-[#061E3E] font-medium"
          >
            Soumettre une autre candidature
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DAF6FC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#061E3E] mb-8 leading-tight tracking-tight">
            Rejoignez l'équipe de SOPHIA <br className="hidden md:block"/> pour la saison 2026 !
          </h1>
          
          <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-600 leading-8 text-justify md:text-center px-2">
            <p>
              On cherche avant tout des personnalités. Des gens à l’aise avec les autres, qui aiment recevoir, bouger, travailler en équipe et donner de l’énergie à un lieu.
            </p>
            <p>
              Chez Sophia, on veut une ambiance simple et sincère, où chacun trouve sa place, progresse et prend plaisir à venir travailler. On aime les personnes impliquées, curieuses, respectueuses, qui ont envie de bien faire.
            </p>
            <p className="font-medium text-[#145A8B] text-xl pt-2">
              Si tu cherches un endroit vivant, solaire, avec une vraie dynamique d’équipe et l’envie de construire quelque chose sur la durée, tu es au bon endroit.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#145A8B]/20">
          <div className="h-2 bg-[#145A8B] w-full"></div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#061E3E] mb-2">Prénom</label>
                <input
                  required
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#061E3E] focus:ring-2 focus:ring-[#145A8B] focus:border-transparent outline-none transition-all"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#061E3E] mb-2">Nom</label>
                <input
                  required
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#061E3E] focus:ring-2 focus:ring-[#145A8B] focus:border-transparent outline-none transition-all"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#061E3E] mb-2">Adresse Email</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#061E3E] focus:ring-2 focus:ring-[#145A8B] focus:border-transparent outline-none transition-all"
                  placeholder="jean.dupont@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#061E3E] mb-2">Numéro de téléphone</label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#061E3E] focus:ring-2 focus:ring-[#145A8B] focus:border-transparent outline-none transition-all"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#061E3E] mb-2">Poste souhaité</label>
              <select
                required
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#061E3E] focus:ring-2 focus:ring-[#145A8B] focus:border-transparent outline-none transition-all"
              >
                <option value="">Sélectionnez un poste...</option>
                <option value="Serveur">Serveur / Serveuse</option>
                <option value="Cuisinier">Cuisinier</option>
                <option value="Barman">Barman</option>
                <option value="Plongeur">Plongeur</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#061E3E] mb-2">Disponible du</label>
                <input
                  required
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 text-lg rounded-lg border border-gray-300 bg-white text-[#061E3E] focus:ring-2 focus:ring-[#145A8B] focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#061E3E] mb-2">Au</label>
                <input
                  required
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 text-lg rounded-lg border border-gray-300 bg-white text-[#061E3E] focus:ring-2 focus:ring-[#145A8B] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#061E3E] mb-2">CV / Lettre de motivation</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-[#DAF6FC] transition-colors cursor-pointer relative bg-white">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="font-medium text-[#145A8B] hover:text-[#061E3E]">
                      {file ? file.name : "Télécharger un fichier"}
                    </span>
                    {!file && <p className="pl-1">ou glisser-déposer</p>}
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, PNG, JPG jusqu'à 10MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#061E3E] mb-2">Informations complémentaires</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#061E3E] focus:ring-2 focus:ring-[#145A8B] focus:border-transparent outline-none transition-all"
                placeholder="Parlez-nous un peu de vous et de votre expérience..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#145A8B] hover:bg-[#061E3E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#145A8B] disabled:opacity-50 transition-all transform hover:scale-[1.01]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...
                </>
              ) : (
                <>
                  Envoyer ma candidature <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicantForm;