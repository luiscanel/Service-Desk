import React, { useEffect, useState } from 'react';
import { ticketsApi } from '../services/api';
import { Ticket, CreateTicketDto } from '../types';
import TicketCard from '../components/TicketCard';
import { Plus, Search, Filter, X, ChevronDown } from 'lucide-react';

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newTicket, setNewTicket] = useState<CreateTicketDto>({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await ticketsApi.getAll();
      setTickets(response.data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ticketsApi.create(newTicket);
      setShowModal(false);
      setNewTicket({ title: '', description: '', priority: 'medium', category: '' });
      loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="animate-fadeIn">
          <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-500 mt-1">Gestiona todos los tickets de soporte</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary animate-fadeIn shadow-lg shadow-indigo-500/30"
          style={{ animationDelay: '100ms' }}
        >
          <Plus size={20} />
          Nuevo Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar tickets por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12"
            />
          </div>
          
          {/* Status filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input appearance-none pr-10 cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="new">Nuevo</option>
              <option value="open">Abierto</option>
              <option value="pending">Pendiente</option>
              <option value="resolved">Resuelto</option>
              <option value="closed">Cerrado</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'new', 'open', 'pending', 'resolved', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterStatus === status
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 opacity-70">
              ({status === 'all' ? tickets.length : tickets.filter(t => t.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Tickets Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="card p-12 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={40} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron tickets</h3>
          <p className="text-gray-500 mb-6">Intenta con otros filtros o crea un nuevo ticket</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary inline-flex"
          >
            <Plus size={20} />
            Crear Ticket
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket, index) => (
            <div 
              key={ticket.id} 
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TicketCard ticket={ticket} />
            </div>
          ))}
        </div>
      )}

      {/* Modal Create Ticket */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fadeIn">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Ticket</h2>
                <p className="text-sm text-gray-500">Completa los detalles del ticket</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="Describe brevemente el problema"
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Proporciona detalles adicionales..."
                  rows={4}
                  className="input resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prioridad</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="input cursor-pointer"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="input cursor-pointer"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="redes">Redes</option>
                    <option value="sistemas">Sistemas</option>
                    <option value="software">Software</option>
                    <option value="hardware">Hardware</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Crear Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
