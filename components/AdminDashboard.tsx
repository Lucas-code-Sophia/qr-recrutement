import React, { useState, useEffect, useRef } from 'react';
import { Applicant, ApplicationStatus } from '../types';
import { getApplicants, updateApplicant, deleteApplicant } from '../utils/storage';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Search, Mail, Phone, Calendar, FileText, Trash2, 
  Check, X, ChevronDown, User, QrCode, Download, Loader2, Edit2, Link as LinkIcon
} from 'lucide-react';
import html2canvas from 'html2canvas';

const AdminDashboard: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  
  // State pour l'URL du QR Code
  const [targetUrl, setTargetUrl] = useState('');
  
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
    // Calcul automatique de l'URL au chargement
    // Cela prendra automatiquement l'URL de Vercel une fois déployé
    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    // On s'assure qu'on pointe bien vers la page de candidature (#/apply)
    setTargetUrl(`${baseUrl}#/apply`);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const data = await getApplicants();
    setApplicants(data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    const applicant = applicants.find(a => a.id === id);
    if (applicant) {
      const updated = { ...applicant, status: newStatus };
      // Optimistic update
      setApplicants(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedApplicant?.id === id) setSelectedApplicant(updated);
      
      await updateApplicant(updated);
    }
  };

  const handlePositionChange = async (id: string, newPosition: string) => {
    const applicant = applicants.find(a => a.id === id);
    if (applicant) {
      const updated = { ...applicant, position: newPosition };
      // Optimistic update
      setApplicants(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedApplicant?.id === id) setSelectedApplicant(updated);
      
      await updateApplicant(updated);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) {
      await deleteApplicant(id);
      setApplicants(prev => prev.filter(a => a.id !== id));
      if (selectedApplicant?.id === id) setSelectedApplicant(null);
    }
  };

  const downloadQrCode = async () => {
    if (!qrRef.current) return;
    try {
      const canvas = await html2canvas(qrRef.current, { useCORS: true, scale: 2 });
      const link = document.createElement('a');
      link.download = 'sofia-recrutement-qrcode.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Failed to download QR code", err);
      alert("Impossible de télécharger l'image.");
    }
  };

  const statusLabels: Record<string, string> = {
    'NEW': 'Nouveau',
    'REVIEWING': 'En revue',
    'INTERVIEWING': 'Entretien',
    'HIRED': 'Embauché',
    'REJECTED': 'Rejeté',
    'ALL': 'Tous les statuts'
  };

  const positions = [
    "Serveur", "Cuisinier", "Barman", "Hôte", "Manager", "Plongeur"
  ];

  // Stats for Chart
  const statsData = [
    { name: 'Nouveau', value: applicants.filter(a => a.status === ApplicationStatus.NEW).length },
    { name: 'En revue', value: applicants.filter(a => a.status === ApplicationStatus.REVIEWING).length },
    { name: 'Entretien', value: applicants.filter(a => a.status === ApplicationStatus.INTERVIEWING).length },
    { name: 'Embauché', value: applicants.filter(a => a.status === ApplicationStatus.HIRED).length },
    { name: 'Rejeté', value: applicants.filter(a => a.status === ApplicationStatus.REJECTED).length },
  ];

  const filteredApplicants = applicants.filter(app => {
    const matchesFilter = filter === 'ALL' || app.status === filter;
    const matchesSearch = (app.firstName + ' ' + app.lastName + app.position).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Construction de l'URL de l'image QR Code via l'API (basée sur le state targetUrl)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}&bgcolor=FFFFFF&color=061E3E&margin=10`;

  return (
    <div className="flex flex-col h-full bg-[#DAF6FC]">
      {/* Top Stats Bar */}
      <div className="bg-white p-6 border-b border-[#145A8B]/20 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#061E3E]">Tableau de Bord</h1>
          <p className="text-sm text-gray-500">Gérez vos recrutements pour la saison 2026</p>
        </div>
        <button 
          onClick={() => setShowQrModal(true)}
          className="flex items-center gap-2 bg-[#145A8B] text-white px-4 py-2 rounded-lg hover:bg-[#061E3E] transition-colors shadow-sm font-medium"
        >
          <QrCode className="w-5 h-5" />
          QR Code Recrutement
        </button>
      </div>

      <div className="p-6 pb-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 h-48 bg-white p-4 rounded-xl border border-[#145A8B]/20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#145A8B', '#eab308', '#f97316', '#22c55e', '#ef4444'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-4">
             <div className="flex-1 p-4 bg-white rounded-xl border border-[#145A8B]/20 flex flex-col justify-center">
               <span className="text-[#145A8B] text-sm font-semibold uppercase tracking-wider">Total Candidats</span>
               <div className="text-4xl font-bold text-[#061E3E] mt-1">{applicants.length}</div>
             </div>
             <div className="flex-1 p-4 bg-green-50 rounded-xl border border-green-100 flex flex-col justify-center">
               <span className="text-green-600 text-sm font-semibold uppercase tracking-wider">Embauchés</span>
               <div className="text-4xl font-bold text-green-900 mt-1">
                 {applicants.filter(a => a.status === ApplicationStatus.HIRED).length}
               </div>
             </div>
          </div>
        </div>

      <div className="flex-1 flex overflow-hidden mt-6 border-t border-[#145A8B]/20">
        {/* Sidebar List */}
        <div className="w-full lg:w-96 bg-white border-r border-[#145A8B]/20 flex flex-col">
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#145A8B]"
              />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#145A8B]"
            >
              <option value="ALL">Tous les statuts</option>
              {Object.values(ApplicationStatus).map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
            </select>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 text-[#145A8B] animate-spin" />
              </div>
            ) : filteredApplicants.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Aucun candidat trouvé</div>
            ) : (
                filteredApplicants.map(applicant => (
                <div
                    key={applicant.id}
                    onClick={() => setSelectedApplicant(applicant)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-[#DAF6FC] ${selectedApplicant?.id === applicant.id ? 'bg-[#DAF6FC] border-l-4 border-l-[#145A8B]' : 'border-l-4 border-l-transparent'}`}
                >
                    <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-[#061E3E]">{applicant.firstName} {applicant.lastName}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium 
                        ${applicant.status === 'NEW' ? 'bg-indigo-100 text-indigo-700' : 
                        applicant.status === 'HIRED' ? 'bg-green-100 text-green-700' :
                        applicant.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                        {statusLabels[applicant.status]}
                    </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{applicant.position}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(applicant.submittedAt).toLocaleDateString('fr-FR')}
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="flex-1 overflow-y-auto bg-[#DAF6FC] p-6 lg:p-10">
          {selectedApplicant ? (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-[#145A8B]/20 overflow-hidden">
              {/* Header */}
              <div className="bg-[#061E3E] text-white p-8 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold">{selectedApplicant.firstName} {selectedApplicant.lastName}</h2>
                  
                  {/* Position Editor */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative group">
                      <select 
                        value={positions.includes(selectedApplicant.position) ? selectedApplicant.position : 'Autre'}
                        onChange={(e) => handlePositionChange(selectedApplicant.id, e.target.value)}
                        className="appearance-none bg-[#145A8B]/50 hover:bg-[#145A8B] text-[#DAF6FC] text-lg py-1 px-3 pr-8 rounded transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-[#DAF6FC]"
                      >
                         {positions.map(p => <option key={p} value={p}>{p}</option>)}
                         {!positions.includes(selectedApplicant.position) && <option value={selectedApplicant.position}>{selectedApplicant.position}</option>}
                      </select>
                      <Edit2 className="w-3 h-3 text-[#DAF6FC]/50 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <a href={`mailto:${selectedApplicant.email}`} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm">
                      <Mail className="w-4 h-4" /> Email
                    </a>
                    <a href={`tel:${selectedApplicant.phone}`} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm">
                      <Phone className="w-4 h-4" /> Appeler
                    </a>
                  </div>
                </div>
                
                <div className="relative group">
                  <select
                    value={selectedApplicant.status}
                    onChange={(e) => handleStatusChange(selectedApplicant.id, e.target.value as ApplicationStatus)}
                    className="appearance-none bg-white text-[#061E3E] font-semibold py-2 pl-4 pr-10 rounded-lg cursor-pointer focus:ring-2 focus:ring-[#145A8B] outline-none"
                  >
                     {Object.values(ApplicationStatus).map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-600 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Disponibilité</h4>
                    <div className="flex items-center gap-2 text-[#061E3E] bg-[#DAF6FC]/50 p-4 rounded-lg border border-[#145A8B]/10">
                      <Calendar className="w-5 h-5 text-[#145A8B]" />
                      <span>{selectedApplicant.startDate}</span>
                      <span className="text-gray-400">au</span>
                      <span>{selectedApplicant.endDate}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes supplémentaires</h4>
                    <p className="text-[#061E3E] bg-[#DAF6FC]/50 p-4 rounded-lg border border-[#145A8B]/10 leading-relaxed">
                      {selectedApplicant.notes || "Aucune note supplémentaire fournie."}
                    </p>
                  </div>

                  {selectedApplicant.cvUrl ? (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">CV / Resume</h4>
                      <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <FileText className="w-8 h-8 text-red-500" />
                           <div>
                             <p className="text-sm font-medium text-[#061E3E]">{selectedApplicant.cvFileName || 'CV'}</p>
                             <p className="text-xs text-gray-500">Document PDF/Image</p>
                           </div>
                         </div>
                         <a 
                           href={selectedApplicant.cvUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-sm text-[#145A8B] font-medium hover:underline"
                         >
                           Voir le CV
                         </a>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-[#DAF6FC]/50 border border-[#145A8B]/10">
                    <h4 className="font-semibold text-[#061E3E] mb-4 flex items-center gap-2">
                       <User className="w-4 h-4" /> Actions Rapides
                    </h4>
                    <button 
                      onClick={() => handleStatusChange(selectedApplicant.id, ApplicationStatus.INTERVIEWING)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-[#DAF6FC] rounded-md transition-colors flex items-center gap-2 mb-1"
                    >
                      <Check className="w-4 h-4 text-green-500" /> Marquer pour Entretien
                    </button>
                     <button 
                      onClick={() => handleStatusChange(selectedApplicant.id, ApplicationStatus.REJECTED)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-[#DAF6FC] rounded-md transition-colors flex items-center gap-2 mb-1"
                    >
                      <X className="w-4 h-4 text-red-500" /> Rejeter la candidature
                    </button>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <button 
                      onClick={() => handleDelete(selectedApplicant.id)}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Supprimer le candidat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#145A8B]/50">
              <User className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">Sélectionnez un candidat pour voir les détails</p>
            </div>
          )}
        </div>
      </div>

       {/* QR Code Modal */}
       {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative animate-fade-in">
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div ref={qrRef} className="bg-white p-4 flex flex-col items-center text-center">
               <h3 className="text-2xl font-bold text-[#061E3E] mb-1">Sofia Recrutement</h3>
               <p className="text-[#145A8B] font-medium mb-4 uppercase tracking-widest text-sm">Saison 2026</p>
               
               {/* Input pour vérifier/modifier l'URL */}
               <div className="w-full mb-4 relative">
                 <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                 <input 
                    type="text" 
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-600 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#145A8B]"
                    placeholder="https://..."
                 />
               </div>

               <div className="p-2 border-2 border-[#061E3E] rounded-xl mb-6">
                 <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" crossOrigin="anonymous" />
               </div>
               
               <p className="text-sm font-semibold text-[#061E3E]">Scannez pour postuler</p>
               <p className="text-xs text-gray-500 mt-1">Rejoignez notre équipe !</p>
            </div>

            <button 
              onClick={downloadQrCode}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-[#145A8B] text-white py-3 rounded-xl hover:bg-[#061E3E] transition-colors font-semibold"
            >
              <Download className="w-5 h-5" />
              Télécharger l'image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;