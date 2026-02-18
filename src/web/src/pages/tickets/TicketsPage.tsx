import { useEffect, useState } from 'react';
import { ticketsService } from '../../services/api';
import { Card, CardBody, Button, Input, Select, Modal, Badge } from '../../components/ui';

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
}

// const statusOptions = [
//   { value: 'new', label: 'Nuevo' },
//   { value: 'assigned', label: 'Asignado' },
//   { value: 'in_progress', label: 'En Progreso' },
//   { value: 'pending', label: 'Pendiente' },
//   { value: 'resolved', label: 'Resuelto' },
//   { value: 'closed', label: 'Cerrado' },
// ];

const priorityOptions = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
];

const categoryOptions = [
  { value: 'Redes', label: 'Redes' },
  { value: 'Sistemas', label: 'Sistemas' },
  { value: 'Seguridad', label: 'Seguridad' },
  { value: 'Hardware', label: 'Hardware' },
  { value: 'Software', label: 'Software' },
];

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Software',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await ticketsService.getAll();
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
      const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
      await ticketsService.create({ ...formData, ticketNumber, status: 'new' });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', priority: 'medium', category: 'Software' });
      loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ticket?')) {
      try {
        await ticketsService.delete(id);
        loadTickets();
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status === filter;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      new: 'info',
      assigned: 'info',
      in_progress: 'warning',
      pending: 'danger',
      resolved: 'success',
      closed: 'success',
    };
    const labels: Record<string, string> = {
      new: 'Nuevo',
      assigned: 'Asignado',
      in_progress: 'En Progreso',
      pending: 'Pendiente',
      resolved: 'Resuelto',
      closed: 'Cerrado',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-slate-600',
      medium: 'text-amber-600',
      high: 'text-red-600',
      critical: 'text-red-700 font-bold',
    };
    return colors[priority] || 'text-slate-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Tickets</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          + Nuevo Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'new', 'in_progress', 'pending', 'resolved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'all' ? 'Todos' : status === 'new' ? 'Nuevo' : status === 'in_progress' ? 'En Progreso' : status === 'pending' ? 'Pendiente' : status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tickets List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">ID</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Título</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Categoría</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Estado</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Prioridad</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Fecha</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">Cargando...</td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">No se encontraron tickets</td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <span className="font-medium text-blue-600">{ticket.ticketNumber}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-800 font-medium">{ticket.title}</div>
                      <div className="text-sm text-slate-500">{ticket.description}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{ticket.category}</td>
                    <td className="py-4 px-6">{getStatusBadge(ticket.status)}</td>
                    <td className="py-4 px-6">
                      <span className={`font-medium capitalize ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Ticket"
        size="lg"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Título del ticket"
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el problema..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Prioridad"
              options={priorityOptions}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            />
            <Select
              label="Categoría"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
