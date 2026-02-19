import { useState, useEffect } from 'react';
import { Card, CardBody, Badge } from '../../components/ui';
import api from '../../services/api';

interface SLAStats {
  total: number;
  compliant: number;
  breached: number;
  atRisk: number;
  complianceRate: number;
  byPriority: {
    critical: { total: number; compliant: number; breached: number; atRisk: number };
    high: { total: number; compliant: number; breached: number; atRisk: number };
    medium: { total: number; compliant: number; breached: number; atRisk: number };
    low: { total: number; compliant: number; breached: number; atRisk: number };
  };
}

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  priority: string;
  status: string;
  slaDeadline: string;
}

export function SlaMonitorPage() {
  const [stats, setStats] = useState<SLAStats | null>(null);
  const [nearBreach, setNearBreach] = useState<Ticket[]>([]);
  const [breached, setBreached] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'near' | 'breached'>('overview');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, nearRes, breachedRes] = await Promise.all([
        api.get('/sla-monitor/stats'),
        api.get('/sla-monitor/near-breach'),
        api.get('/sla-monitor/breached'),
      ]);
      setStats(statsRes.data);
      setNearBreach(nearRes.data);
      setBreached(breachedRes.data);
    } catch (error) {
      console.error('Error fetching SLA data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'info';
      case 'assigned': return 'warning';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'success';
      default: return 'default';
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Monitor SLA</h1>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-t-lg ${activeTab === 'overview' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('near')}
          className={`px-4 py-2 rounded-t-lg ${activeTab === 'near' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Por Vencer ({nearBreach.length})
        </button>
        <button
          onClick={() => setActiveTab('breached')}
          className={`px-4 py-2 rounded-t-lg ${activeTab === 'breached' ? 'bg-red-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Incumplidos ({breached.length})
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardBody>
                <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                <div className="text-sm text-slate-500">Total Tickets</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-2xl font-bold text-green-600">{stats.compliant}</div>
                <div className="text-sm text-slate-500">Cumplidos</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-2xl font-bold text-red-600">{stats.breached}</div>
                <div className="text-sm text-slate-500">Incumplidos</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className={`text-2xl font-bold ${stats.complianceRate >= 80 ? 'text-green-600' : stats.complianceRate >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                  {stats.complianceRate}%
                </div>
                <div className="text-sm text-slate-500">Cumplimiento</div>
              </CardBody>
            </Card>
          </div>

          {/* By Priority */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Por Prioridad</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(stats.byPriority).map(([priority, data]) => (
                  <div key={priority} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={getPriorityColor(priority)}>{priority.toUpperCase()}</Badge>
                      <span className="text-sm text-slate-500">{data.total} tickets</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cumplidos:</span>
                        <span className="text-green-600 font-medium">{data.compliant}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">En riesgo:</span>
                        <span className="text-orange-600 font-medium">{data.atRisk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Incumplidos:</span>
                        <span className="text-red-600 font-medium">{data.breached}</span>
                      </div>
                    </div>
                    {data.total > 0 && (
                      <div className="mt-2">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${(data.compliant / data.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {activeTab === 'near' && (
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Tickets Por Vencer (menos de 2 horas)</h3>
            {nearBreach.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No hay tickets próximos a vencer</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-200">
                      <th className="pb-3 font-semibold text-slate-600">Ticket</th>
                      <th className="pb-3 font-semibold text-slate-600">Título</th>
                      <th className="pb-3 font-semibold text-slate-600">Prioridad</th>
                      <th className="pb-3 font-semibold text-slate-600">Estado</th>
                      <th className="pb-3 font-semibold text-slate-600">SLA Vence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nearBreach.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-slate-100">
                        <td className="py-3 font-medium">{ticket.ticketNumber}</td>
                        <td className="py-3">{ticket.title}</td>
                        <td className="py-3"><Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge></td>
                        <td className="py-3"><Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge></td>
                        <td className="py-3 text-orange-600">
                          {ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString('es-ES') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'breached' && (
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Tickets Incumplidos</h3>
            {breached.length === 0 ? (
              <div className="text-center py-8 text-green-600">🎉 No hay tickets incumplidos</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-200">
                      <th className="pb-3 font-semibold text-slate-600">Ticket</th>
                      <th className="pb-3 font-semibold text-slate-600">Título</th>
                      <th className="pb-3 font-semibold text-slate-600">Prioridad</th>
                      <th className="pb-3 font-semibold text-slate-600">Estado</th>
                      <th className="pb-3 font-semibold text-slate-600">SLA Venció</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breached.map((ticket) => (
                      <tr key={ticket.id} className="bg-red-50 border-b border-slate-100">
                        <td className="py-3 font-medium">{ticket.ticketNumber}</td>
                        <td className="py-3">{ticket.title}</td>
                        <td className="py-3"><Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge></td>
                        <td className="py-3"><Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge></td>
                        <td className="py-3 text-red-600">
                          {ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString('es-ES') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
