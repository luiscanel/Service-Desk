import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import { ticketsService, authService } from '../../services/api';
import { Card, CardHeader, CardBody, Button, StatCard } from '../../components/ui';

const ticketsByStatus = [
  { name: 'Abiertos', value: 45, color: '#3B82F6' },
  { name: 'En Progreso', value: 23, color: '#F59E0B' },
  { name: 'Cerrados', value: 89, color: '#10B981' },
  { name: 'Pendientes', value: 12, color: '#EF4444' },
];

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
  const [satisfaction, setSatisfaction] = useState<any>(null);

  const user = authService.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ticketsRes, satRes] = await Promise.all([
        ticketsService.getAll(),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/tickets/stats/satisfaction`).then(r => r.json()).catch(() => null)
      ]);
      setTickets(ticketsRes.data);
      setSatisfaction(satRes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTickets = tickets.filter(t => t.status === 'new' || t.status === 'in_progress').length;
  const closedTickets = tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Bienvenido de nuevo, <span className="font-semibold text-blue-600">{user?.firstName || 'Usuario'}</span></p>
        </div>
        <Button onClick={() => navigate('/tickets')} className="animate-fade-in-up delay-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-fade-in-up delay-100">
          <StatCard
            title="Total Tickets"
            value={loading ? '...' : tickets.length}
            icon="🎫"
            color="blue"
          />
        </div>
        <div className="animate-fade-in-up delay-200">
          <StatCard
            title="Abiertos"
            value={loading ? '...' : openTickets}
            icon="📂"
            color="purple"
          />
        </div>
        <div className="animate-fade-in-up delay-300">
          <StatCard
            title="Pendientes"
            value={loading ? '...' : pendingTickets}
            icon="⏳"
            color="amber"
          />
        </div>
        <div className="animate-fade-in-up delay-400">
          <StatCard
            title="Cerrados"
            value={loading ? '...' : closedTickets}
            icon="✅"
            color="green"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="animate-fade-in-up delay-200">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Tickets por Estado</h2>
                <div className="flex gap-2">
                  {ticketsByStatus.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-slate-500">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={ticketsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {ticketsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="text-center -mt-16 relative z-10">
                <div className="text-3xl font-bold text-slate-800">{tickets.length}</div>
                <div className="text-sm text-slate-500">Total</div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Line Chart */}
        <div className="animate-fade-in-up delay-300">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Tickets esta Semana</h2>
                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Esta semana</span>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area type="monotone" dataKey="tickets" stroke="#3B82F6" strokeWidth={3} fill="url(#colorTickets)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Satisfaction Metrics */}
      {satisfaction && (
        <div className="space-y-6 animate-fade-in-up delay-400">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📊</span> Satisfacción del Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card hover>
              <CardBody className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/30">
                  {satisfaction.averages?.overall || '0'}
                </div>
                <div className="text-lg font-bold text-slate-800">Puntuación</div>
                <div className="text-sm text-slate-500">sobre 5</div>
              </CardBody>
            </Card>
            <Card hover>
              <CardBody className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-green-500/30">
                  {satisfaction.totalAnswered || 0}
                </div>
                <div className="text-lg font-bold text-slate-800">Respondidas</div>
                <div className="text-sm text-slate-500">Encuestas</div>
              </CardBody>
            </Card>
            <Card hover>
              <CardBody className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-amber-500/30">
                  {satisfaction.responseRate || 0}%
                </div>
                <div className="text-lg font-bold text-slate-800">Tasa</div>
                <div className="text-sm text-slate-500">de Respuesta</div>
              </CardBody>
            </Card>
            <Card hover>
              <CardBody className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30">
                  {satisfaction.notAnswered || 0}
                </div>
                <div className="text-lg font-bold text-slate-800">Pendientes</div>
                <div className="text-sm text-slate-500">Sin responder</div>
              </CardBody>
            </Card>
          </div>
          
          {/* Distribution Chart */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-800">Distribución de Ratings</h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={satisfaction.distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="rating" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Recent Tickets */}
      <Card className="animate-fade-in-up delay-500">
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Tickets Recientes</h2>
          <Button variant="secondary" size="sm" onClick={() => navigate('/tickets')}>
            Ver todos
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50">
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">ID</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Título</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Estado</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Prioridad</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{ticket.ticketNumber}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800">{ticket.title}</div>
                      <div className="text-sm text-slate-500 truncate max-w-xs">{ticket.description}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        ticket.status === 'new' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        ticket.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        ticket.status === 'closed' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {ticket.status === 'new' ? 'Nuevo' : 
                         ticket.status === 'in_progress' ? 'En Progreso' : 
                         ticket.status === 'closed' ? 'Cerrado' : 
                         ticket.status === 'pending' ? 'Pendiente' : ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize ${
                        ticket.priority === 'high' || ticket.priority === 'critical' ? 'bg-red-50 text-red-600' :
                        ticket.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
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
