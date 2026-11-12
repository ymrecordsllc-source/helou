import React, { useState } from 'react';
import {
  Building2,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Globe,
  Share2,
  Briefcase,
  X,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PartnerCompany, PartnerLink, PartnerContact } from '../types';

export const PartnersSection: React.FC = () => {
  const { userProfile, partners, addPartner, updatePartner, deletePartner, showToast } = useApp();

  const isAdmin = userProfile.accountType === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<PartnerCompany | null>(null);

  // Form Modal (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [banner, setBanner] = useState('');
  const [description, setDescription] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [links, setLinks] = useState<PartnerLink[]>([]);
  const [contacts, setContacts] = useState<PartnerContact[]>([]);

  // Temp item builders for links and contacts
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactNotes, setNewContactNotes] = useState('');

  const filteredPartners = (partners || []).filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.links && p.links.some((l) => l.name.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)))
    );
  });

  const handleOpenAddModal = () => {
    setEditingPartnerId(null);
    setName('');
    setLogo('https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop');
    setBanner('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop');
    setDescription('');
    setAdminNotes('');
    setLinks([
      { id: 'lnk-1', name: 'Sitio Web Oficial', url: 'https://example.com' },
      { id: 'lnk-2', name: 'Instagram', url: 'https://instagram.com' }
    ]);
    setContacts([
      {
        id: 'cnt-1',
        name: 'Departamento de Alianzas',
        role: 'Relaciones Corporativas',
        email: 'partners@example.com',
        phone: '+1 555-0199',
        notes: 'Contacto principal para patrocinios y colaboraciones'
      }
    ]);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (p: PartnerCompany) => {
    setEditingPartnerId(p.id);
    setName(p.name);
    setLogo(p.logo);
    setBanner(p.banner);
    setDescription(p.description);
    setAdminNotes(p.adminNotes || '');
    setLinks([...p.links]);
    setContacts([...p.contacts]);
    setIsFormOpen(true);
  };

  const handleAddLink = () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) {
      showToast('Introduce el nombre y la URL del enlace.');
      return;
    }
    setLinks((prev) => [
      ...prev,
      {
        id: 'link-' + Date.now(),
        name: newLinkName.trim(),
        url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`
      }
    ]);
    setNewLinkName('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (linkId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactEmail.trim()) {
      showToast('Introduce al menos el nombre y correo del contacto.');
      return;
    }
    setContacts((prev) => [
      ...prev,
      {
        id: 'contact-' + Date.now(),
        name: newContactName.trim(),
        role: newContactRole.trim() || 'Representante',
        email: newContactEmail.trim(),
        phone: newContactPhone.trim(),
        notes: newContactNotes.trim()
      }
    ]);
    setNewContactName('');
    setNewContactRole('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactNotes('');
  };

  const handleRemoveContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
  };

  const handleSubmitPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('El nombre de la empresa es obligatorio.');
      return;
    }

    if (editingPartnerId) {
      await updatePartner(editingPartnerId, {
        name: name.trim(),
        logo: logo.trim(),
        banner: banner.trim(),
        description: description.trim(),
        adminNotes: adminNotes.trim(),
        links,
        contacts
      });
      showToast('Empresa aliada actualizada correctamente.');
    } else {
      await addPartner({
        name: name.trim(),
        logo: logo.trim(),
        banner: banner.trim(),
        description: description.trim(),
        adminNotes: adminNotes.trim(),
        links,
        contacts
      });
      showToast('Empresa aliada registrada con éxito.');
    }

    setIsFormOpen(false);
  };

  const handleDeletePartner = async (id: string, partnerName: string) => {
    await deletePartner(id);
    showToast(`Empresa aliada "${partnerName}" eliminada.`);
    if (selectedPartner?.id === id) setSelectedPartner(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 light-theme:bg-white p-6 rounded-3xl border border-slate-800 light-theme:border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 light-theme:text-indigo-600 mb-1">
            <Building2 className="w-4 h-4" /> Directorio Oficial de Colaboradores
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white light-theme:text-slate-900 tracking-tight">
            Partners & Empresas Aliadas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light-theme:text-slate-600 mt-1 max-w-2xl">
            Conoce las marcas, agencias, sellos discográficos y plataformas de medios globales que impulsan las producciones, giras y proyectos artísticos de YM-ki Records.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="theme-btn px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Añadir Empresa Aliada
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar empresa por nombre, descripción o enlace..."
          className="w-full pl-11 pr-4 py-3 bg-slate-900 light-theme:bg-white border border-slate-800 light-theme:border-slate-300 rounded-2xl text-xs text-white light-theme:text-slate-900 placeholder-slate-500 shadow-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Partners Grid */}
      {filteredPartners.length === 0 ? (
        <div className="bg-slate-900 light-theme:bg-white p-12 rounded-3xl border border-slate-800 light-theme:border-slate-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white light-theme:text-slate-900">
            {searchQuery ? 'No se encontraron empresas aliadas' : 'No hay empresas aliadas registradas'}
          </h3>
          <p className="text-xs text-slate-400 light-theme:text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'Intenta con otro término de búsqueda o limpia el filtro.'
              : 'Los administradores pueden agregar empresas aliadas y patrocinadores oficiales desde el botón superior.'}
          </p>
          {isAdmin && !searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="theme-btn px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" /> Registrar Primera Empresa
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              onClick={() => setSelectedPartner(partner)}
              className="group bg-slate-900 light-theme:bg-white border border-slate-800 light-theme:border-slate-200 rounded-3xl overflow-hidden hover:border-indigo-500/60 light-theme:hover:border-indigo-500/60 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Banner Thumbnail */}
                <div className="h-32 w-full relative overflow-hidden bg-slate-950">
                  <img
                    src={partner.banner}
                    alt={partner.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                </div>

                {/* Logo & Info */}
                <div className="px-5 pt-0 pb-4 relative">
                  <div className="-mt-9 mb-3 flex items-end justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 light-theme:bg-white p-1 border-2 border-slate-800 light-theme:border-slate-200 shadow-md overflow-hidden shrink-0">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    {isAdmin && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 bg-slate-950/80 light-theme:bg-slate-100/90 p-1.5 rounded-xl backdrop-blur-sm border border-slate-800 light-theme:border-slate-300"
                      >
                        <button
                          onClick={() => handleOpenEditModal(partner)}
                          className="p-1.5 hover:text-indigo-400 light-theme:hover:text-indigo-600 transition"
                          title="Editar empresa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePartner(partner.id, partner.name)}
                          className="p-1.5 hover:text-red-400 transition"
                          title="Eliminar empresa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-black text-white light-theme:text-slate-900 group-hover:text-indigo-400 light-theme:group-hover:text-indigo-600 transition truncate">
                    {partner.name}
                  </h3>

                  <p className="text-xs text-slate-400 light-theme:text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {partner.description || 'Sin descripción disponible.'}
                  </p>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="px-5 py-3 border-t border-slate-800/80 light-theme:border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400 light-theme:text-slate-500 bg-slate-950/30 light-theme:bg-slate-50">
                <span className="flex items-center gap-1.5">
                  <Share2 className="w-3 h-3 text-indigo-400" />
                  {partner.links ? partner.links.length : 0} enlaces oficiales
                </span>
                <span className="font-semibold text-indigo-400 light-theme:text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Ver Detalles →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PARTNER DETAILS MODAL */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 light-theme:bg-white border border-slate-800 light-theme:border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-auto animate-fadeIn max-h-[90vh] flex flex-col">
            {/* Modal Header with Banner */}
            <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-slate-950 shrink-0">
              <img
                src={selectedPartner.banner}
                alt={selectedPartner.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 light-theme:from-white via-transparent to-black/30" />
              <button
                onClick={() => setSelectedPartner(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Profile Bar */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 relative">
                <div className="flex items-end gap-3.5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-900 light-theme:bg-white p-1 border-2 border-slate-800 light-theme:border-slate-200 shadow-xl overflow-hidden shrink-0">
                    <img
                      src={selectedPartner.logo}
                      alt={selectedPartner.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 light-theme:text-indigo-600">
                      Partner Oficial
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white light-theme:text-slate-900">
                      {selectedPartner.name}
                    </h2>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleOpenEditModal(selectedPartner);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 light-theme:bg-slate-200 text-slate-200 light-theme:text-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => handleDeletePartner(selectedPartner.id, selectedPartner.name)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/20 text-red-300 hover:bg-red-500/30 transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  </div>
                )}
              </div>

              {/* Full Description */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 light-theme:text-slate-500 mb-2">
                  Acerca de la Empresa
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 light-theme:text-slate-700 leading-relaxed whitespace-pre-line bg-slate-950/40 light-theme:bg-slate-50 p-4 rounded-2xl border border-slate-800/80 light-theme:border-slate-200">
                  {selectedPartner.description || 'No se ha redactado una descripción todavía.'}
                </p>
              </div>

              {/* Links & Social Networks */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 light-theme:text-slate-500 mb-2">
                  Enlaces & Redes Oficiales
                </h4>
                {selectedPartner.links && selectedPartner.links.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedPartner.links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 light-theme:bg-slate-100 border border-slate-800 light-theme:border-slate-200 hover:border-indigo-500/80 transition group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="text-xs font-bold text-white light-theme:text-slate-900 truncate">
                            {link.name}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No hay enlaces registrados.</p>
                )}
              </div>

              {/* Contacts */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 light-theme:text-slate-500 mb-2">
                  Contactos & Representantes
                </h4>
                {selectedPartner.contacts && selectedPartner.contacts.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedPartner.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3.5 rounded-2xl bg-slate-950/60 light-theme:bg-slate-100 border border-slate-800 light-theme:border-slate-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white light-theme:text-slate-900">
                            {contact.name}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 light-theme:bg-indigo-100 light-theme:text-indigo-700">
                            {contact.role}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 light-theme:text-slate-600 pt-1">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="flex items-center gap-1.5 hover:text-indigo-400 transition"
                            >
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {contact.email}
                            </a>
                          )}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="flex items-center gap-1.5 hover:text-indigo-400 transition"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {contact.phone}
                            </a>
                          )}
                        </div>

                        {contact.notes && (
                          <p className="text-[11px] text-slate-400 light-theme:text-slate-500 italic pt-1">
                            {contact.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No hay contactos registrados.</p>
                )}
              </div>

              {/* Admin Notes if any */}
              {selectedPartner.adminNotes && isAdmin && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                  <span className="font-bold block mb-1">Notas Administrativas Privadas:</span>
                  {selectedPartner.adminNotes}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/60 light-theme:bg-slate-100 border-t border-slate-800 light-theme:border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedPartner(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 light-theme:bg-slate-200 text-slate-200 light-theme:text-slate-800 hover:bg-slate-700 transition"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN ADD / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 light-theme:bg-white border border-slate-800 light-theme:border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-auto animate-fadeIn max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 light-theme:border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white light-theme:text-slate-900">
                    {editingPartnerId ? 'Editar Empresa Aliada' : 'Añadir Nueva Empresa Aliada'}
                  </h3>
                  <p className="text-xs text-slate-400 light-theme:text-slate-500">
                    Información oficial, enlaces y contactos corporativos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPartner} className="overflow-y-auto space-y-5 pt-4 flex-1 pr-1">
              {/* Basic Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  1. Información General
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: HYBE Labels, Studio Choom, Mnet..."
                    className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                      Logo o Icono (URL)
                    </label>
                    <input
                      type="url"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                      Banner Corporativo (URL)
                    </label>
                    <input
                      type="url"
                      value={banner}
                      onChange={(e) => setBanner(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                    Descripción Completa
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe los acuerdos, proyectos conjuntos y servicios de esta empresa..."
                    className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                  />
                </div>
              </div>

              {/* Dynamic Links Section */}
              <div className="space-y-3 pt-2 border-t border-slate-800 light-theme:border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    2. Enlaces & Redes Sociales ({links.length})
                  </h4>
                </div>

                {/* List of existing links */}
                {links.length > 0 && (
                  <div className="space-y-2">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-2.5 bg-slate-950/70 light-theme:bg-slate-100 rounded-xl border border-slate-800 light-theme:border-slate-200 text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="font-bold text-white light-theme:text-slate-900">{link.name}: </span>
                          <span className="text-slate-400 truncate">{link.url}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(link.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add link row */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-slate-950/40 light-theme:bg-slate-50 p-3 rounded-2xl border border-slate-800/80 light-theme:border-slate-200">
                  <input
                    type="text"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    placeholder="Nombre (ej: TikTok, X)"
                    className="sm:col-span-2 bg-slate-800 light-theme:bg-white border border-slate-700 light-theme:border-slate-300 rounded-xl p-2.5 text-xs text-white light-theme:text-slate-900"
                  />
                  <input
                    type="text"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="URL (https://...)"
                    className="sm:col-span-2 bg-slate-800 light-theme:bg-white border border-slate-700 light-theme:border-slate-300 rounded-xl p-2.5 text-xs text-white light-theme:text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="sm:col-span-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir
                  </button>
                </div>
              </div>

              {/* Dynamic Contacts Section */}
              <div className="space-y-3 pt-2 border-t border-slate-800 light-theme:border-slate-200">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  3. Contactos de la Empresa ({contacts.length})
                </h4>

                {contacts.length > 0 && (
                  <div className="space-y-2">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-2.5 bg-slate-950/70 light-theme:bg-slate-100 rounded-xl border border-slate-800 light-theme:border-slate-200 text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="font-bold text-white light-theme:text-slate-900">
                            {contact.name} ({contact.role}):
                          </span>
                          <span className="text-slate-400 ml-1">{contact.email}</span>
                          {contact.phone && <span className="text-slate-500 ml-1">· {contact.phone}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(contact.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add contact form inputs */}
                <div className="space-y-2 bg-slate-950/40 light-theme:bg-slate-50 p-3 rounded-2xl border border-slate-800/80 light-theme:border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="Nombre del contacto *"
                      className="bg-slate-800 light-theme:bg-white border border-slate-700 light-theme:border-slate-300 rounded-xl p-2.5 text-xs text-white light-theme:text-slate-900"
                    />
                    <input
                      type="text"
                      value={newContactRole}
                      onChange={(e) => setNewContactRole(e.target.value)}
                      placeholder="Cargo o Departamento"
                      className="bg-slate-800 light-theme:bg-white border border-slate-700 light-theme:border-slate-300 rounded-xl p-2.5 text-xs text-white light-theme:text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      placeholder="Correo electrónico *"
                      className="bg-slate-800 light-theme:bg-white border border-slate-700 light-theme:border-slate-300 rounded-xl p-2.5 text-xs text-white light-theme:text-slate-900"
                    />
                    <input
                      type="text"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      placeholder="Teléfono / Celular (opcional)"
                      className="bg-slate-800 light-theme:bg-white border border-slate-700 light-theme:border-slate-300 rounded-xl p-2.5 text-xs text-white light-theme:text-slate-900"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newContactNotes}
                      onChange={(e) => setNewContactNotes(e.target.value)}
                      placeholder="Notas adicionales de contacto"
                      className="flex-1 bg-slate-800 light-theme:bg-white border border-slate-700 light-theme:border-slate-300 rounded-xl p-2.5 text-xs text-white light-theme:text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddContact}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="pt-2 border-t border-slate-800 light-theme:border-slate-200">
                <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                  Notas de Administración (Solo visibles para Admins)
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ej: Contrato vigente hasta diciembre 2027..."
                  className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 light-theme:border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-3 rounded-2xl text-xs font-bold bg-slate-800 light-theme:bg-slate-200 text-slate-300 light-theme:text-slate-700 hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="theme-btn px-6 py-3 rounded-2xl text-xs font-bold shadow-lg"
                >
                  {editingPartnerId ? 'Guardar Cambios' : 'Registrar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
