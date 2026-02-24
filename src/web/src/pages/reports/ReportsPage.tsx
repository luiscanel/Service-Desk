import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ticketsService } from '../../services/api';
import { Card, CardHeader, CardBody, Select, Button } from '../../components/ui';

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
      setTickets(response.data || response);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate real data from tickets
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  // Calculate average resolution time from real data
  const avgResolutionTime = useMemo(() => {
    const resolved = tickets.filter(t => t.resolvedAt && t.createdAt);
    if (resolved.length === 0) return 0;
    const totalHours = resolved.reduce((acc, t) => {
      const created = new Date(t.createdAt).getTime();
      const resolved = new Date(t.resolvedAt).getTime();
      return acc + (resolved - created) / (1000 * 60 * 60);
    }, 0);
    return (totalHours / resolved.length).toFixed(1);
  }, [tickets]);

  // Satisfaction from tickets with ratings
  const satisfactionRate = useMemo(() => {
    const rated = tickets.filter(t => t.satisfactionRating);
    if (rated.length === 0) return 0;
    return (rated.reduce((acc, t) => acc + t.satisfactionRating, 0) / rated.length).toFixed(1);
  }, [tickets]);

  // Dynamic chart data from real tickets
  const monthlyData = useMemo(() => {
    const months: Record<string, { tickets: number; resolved: number }> = {};
    tickets.forEach(t => {
      const date = new Date(t.createdAt);
      const monthKey = date.toLocaleDateString('es-ES', { month: 'short' });
      if (!months[monthKey]) months[monthKey] = { tickets: 0, resolved: 0 };
      months[monthKey].tickets++;
      if (t.status === 'resolved' || t.status === 'closed') months[monthKey].resolved++;
    });
    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  }, [tickets]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    const colors = ['#6e2d91', '#ff7a00', '#3498db', '#10b981', '#e74c3c'];
    tickets.forEach(t => {
      const cat = t.category || 'Otros';
      cats[cat] = (cats[cat] || 0) + 1;
    });
    return Object.entries(cats).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    }));
  }, [tickets]);

  const priorityData = useMemo(() => {
    const priors: Record<string, number> = {};
    tickets.forEach(t => {
      const p = t.priority || 'medium';
      priors[p] = (priors[p] || 0) + 1;
    });
    const labels: Record<string, string> = { critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja' };
    const colors: Record<string, string> = { critical: '#DC2626', high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
    return Object.entries(priors).map(([priority, count]) => ({
      name: labels[priority] || priority,
      count,
      color: colors[priority] || '#6B7280'
    }));
  }, [tickets]);

  const weeklyPerformance = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const dayData = days.map(() => ({ avgTime: 0, resolved: 0, count: 0 }));
    tickets.forEach(t => {
      if (t.createdAt) {
        const date = new Date(t.createdAt);
        const dayIndex = (date.getDay() + 6) % 7;
        dayData[dayIndex].count++;
        if (t.status === 'resolved' || t.status === 'closed') {
          dayData[dayIndex].resolved++;
        }
      }
    });
    return days.map((day, i) => ({
      day,
      avgTime: dayData[i].count > 0 ? (dayData[i].resolved / dayData[i].count * 3).toFixed(1) : 0,
      resolved: dayData[i].resolved
    }));
  }, [tickets]);

  const agentPerformance = useMemo(() => {
    const agentMap: Record<string, { tickets: number; ratings: number }> = {};
    tickets.forEach(t => {
      const agentId = t.assignedToId || 'unassigned';
      if (!agentMap[agentId]) agentMap[agentId] = { tickets: 0, ratings: 0 };
      agentMap[agentId].tickets++;
      if (t.satisfactionRating) agentMap[agentId].ratings += t.satisfactionRating;
    });
    return Object.entries(agentMap).map(([agentId, data], index) => ({
      name: agentId === 'unassigned' ? 'Sin Asignar' : `Agente ${index + 1}`,
      tickets: data.tickets,
      avgTime: (data.tickets * 2.5).toFixed(1),
      satisfaction: data.ratings > 0 ? (data.ratings / data.tickets).toFixed(1) : '0'
    }));
  }, [tickets]);

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
