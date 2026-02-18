import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ticketsService } from '../../services/api';
import { Card, CardHeader, CardBody, Select, Button } from '../../components/ui';

const monthlyData = [
  { month: 'Ene', tickets: 45, resolved: 38 },
  { month: 'Feb', tickets: 52, resolved: 45 },
  { month: 'Mar', tickets: 38, resolved: 35 },
  { month: 'Abr', tickets: 65, resolved: 55 },
  { month: 'May', tickets: 48, resolved: 42 },
  { month: 'Jun', tickets: 72, resolved: 65 },
];

const categoryData = [
  { name: 'Hardware', value: 35, color: '#3B82F6' },
  { name: 'Software', value: 28, color: '#10B981' },
  { name: 'Redes', value: 20, color: '#F59E0B' },
  { name: 'Seguridad', value: 12, color: '#EF4444' },
  { name: 'Otros', value: 5, color: '#8B5CF6' },
];

const priorityData = [
  { name: 'Baja', count: 45, color: '#10B981' },
  { name: 'Media', count: 30, color: '#F59E0B' },
  { name: 'Alta', count: 18, color: '#EF4444' },
  { name: 'Crítica', count: 7, color: '#DC2626' },
];

const weeklyPerformance = [
  { day: 'Lun', avgTime: 2.5, resolved: 12 },
  { day: 'Mar', avgTime: 3.2, resolved: 15 },
  { day: 'Mié', avgTime: 2.8, resolved: 18 },
  { day: 'Jue', avgTime: 4.1, resolved: 14 },
  { day: 'Vie', avgTime: 3.5, resolved: 20 },
  { day: 'Sáb', avgTime: 1.8, resolved: 8 },
  { day: 'Dom', avgTime: 1.2, resolved: 5 },
];

const agentPerformance = [
  { name: 'Juan Pérez', tickets: 45, avgTime: 2.5, satisfaction: 4.8 },
  { name: 'María García', tickets: 38, avgTime: 3.2, satisfaction: 4.6 },
  { name: 'Carlos López', tickets: 32, avgTime: 2.8, satisfaction: 4.9 },
  { name: 'Ana Martínez', tickets: 28, avgTime: 4.1, satisfaction: 4.4 },
  { name: 'Pedro Sánchez', tickets: 25, avgTime: 3.5, satisfaction: 4.7 },
];

export function ReportsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await ticketsService.getAll();
      setTickets(response.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalTickets = tickets.length || 169;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length || 120;
  const avgResolutionTime = 3.2;
  const satisfactionRate = 4.6;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
        <div className="flex gap-3">
          <Select
            options={[
              { value: 'week', label: 'Esta semana' },
              { value: 'month', label: 'Este mes' },
              { value: 'quarter', label: 'Este trimestre' },
              { value: 'year', label: 'Este año' },
            ]}
            value={timeRange}
            onChange={(e: any) => setTimeRange(e.target.value)}
          />
          <Button variant="secondary">
            📥 Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Tickets</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{loading ? '...' : totalTickets}</p>
                <p className="text-sm text-green-600 mt-1">↑ 12% vs mes anterior</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">
                🎫
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Tickets Resueltos</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{loading ? '...' : resolvedTickets}</p>
                <p className="text-sm text-green-600 mt-1">↑ 8% vs mes anterior</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Tiempo Promedio</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{avgResolutionTime}h</p>
                <p className="text-sm text-green-600 mt-1">↓ 15% vs mes anterior</p>
              </div>
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">
                ⏱️
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Satisfacción</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{satisfactionRate}/5</p>
                <p className="text-sm text-green-600 mt-1">↑ 0.2 vs mes anterior</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl">
                ⭐
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-800">Tickets por Mes</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="tickets" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Area type="monotone" dataKey="resolved" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-800">Distribución por Categoría</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-800">Rendimiento por Prioridad</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={12} width={80} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-800">Rendimiento Semanal de Agentes</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis yAxisId="left" stroke="#64748B" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={12} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="avgTime" stroke="#F59E0B" strokeWidth={3} name="Tiempo (h)" />
                <Line yAxisId="right" type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} name="Resueltos" />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Top Agents Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-800">Top Agentes</h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">#</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Agente</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Tickets</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Tiempo Promedio</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Satisfacción</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.map((agent, index) => (
                  <tr key={agent.name} className="border-t border-slate-100">
                    <td className="py-4 px-6 text-slate-500">{index + 1}</td>
                    <td className="py-4 px-6 font-medium text-slate-800">{agent.name}</td>
                    <td className="py-4 px-6 text-slate-600">{agent.tickets}</td>
                    <td className="py-4 px-6 text-slate-600">{agent.avgTime}h</td>
                    <td className="py-4 px-6">
                      <span className="text-amber-500">⭐ {agent.satisfaction}</span>
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
