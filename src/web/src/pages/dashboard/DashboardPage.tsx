import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ticketsService, authService } from '../../services/api';
import { Card, CardHeader, CardBody, Button, StatCard } from '../../components/ui';

const ticketsByStatus = [
  { name: 'Abiertos', value: 45, color: '#3B82F6' },
  { name: 'En Progreso', value: 23, color: '#F59E0B' },
  { name: 'Cerrados', value: 89, color: '#10B981' },
  { name: 'Pendientes', value: 12, color: '#EF4444' },
];

// const ticketsByCategory = [
//   { name: 'Redes', count: 34 },
//   { name: 'Sistemas', count: 28 },
//   { name: 'Seguridad', count: 19 },
//   { name: 'Hardware', count: 45 },
//   { name: 'Software', count: 23 },
// ];

const weeklyData = [
  { day: 'Lun', tickets: 12 },
  { day: 'Mar', tickets: 19 },
  { day: 'Mié', tickets: 15 },
  { day: 'Jue', tickets: 22 },
  { day: 'Vie', tickets: 18 },
  { day: 'Sáb', tickets: 8 },
  { day: 'Dom', tickets: 5 },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const user = authService.getCurrentUser();

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

  const openTickets = tickets.filter(t => t.status === 'new' || t.status === 'in_progress').length;
  const closedTickets = tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Bienvenido de nuevo, {user?.firstName || 'Usuario'}</p>
        </div>
        <Button onClick={() => navigate('/tickets')}>
          + Nuevo Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tickets"
          value={loading ? '...' : tickets.length}
          icon="🎫"
          color="blue"
        />
        <StatCard
          title="Abiertos"
          value={loading ? '...' : openTickets}
          icon="📂"
          color="amber"
        />
        <StatCard
          title="En Progreso"
          value={loading ? '...' : tickets.filter(t => t.status === 'in_progress').length}
          icon="⏳"
          color="purple"
        />
        <StatCard
          title="Cerrados Hoy"
          value={loading ? '...' : closedTickets}
          icon="✅"
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-800">Tickets por Estado</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ticketsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ticketsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {ticketsByStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-800">Tickets esta Semana</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="tickets" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Tickets Recientes</h2>
          <Button variant="secondary" size="sm" onClick={() => navigate('/tickets')}>
            Ver todos
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">ID</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Título</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Estado</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Prioridad</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <td className="py-4 px-6 text-sm font-medium text-blue-600">{ticket.ticketNumber}</td>
                    <td className="py-4 px-6 text-sm text-slate-800">{ticket.title}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'new' ? 'bg-blue-100 text-blue-700' :
                        ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                        ticket.status === 'closed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-medium ${
                        ticket.priority === 'high' || ticket.priority === 'critical' ? 'text-red-600' :
                        ticket.priority === 'medium' ? 'text-amber-600' :
                        'text-slate-600'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
