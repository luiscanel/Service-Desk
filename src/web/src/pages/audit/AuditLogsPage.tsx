import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Badge } from '../../components/ui';
import api from '../../services/api';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ entity: '', userId: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        api.get('/audit', { params: filters }),
        api.get('/audit/stats'),
      ]);
      setLogs(logsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/audit/export', { params: filters });
      const csv = res.data.csv;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'POST': return 'success';
      case 'PUT': return 'warning';
      case 'DELETE': return 'danger';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Auditoría</h1>
          <p className="text-slate-500">Registro de todas las acciones del sistema</p>
        </div>
        <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
          📥 Exportar CSV
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-slate-500">Total Acciones</div>
            </CardBody>
          </Card>
          {Object.entries(stats.byAction || {}).slice(0, 3).map(([action, count]: [string, any]) => (
            <Card key={action}>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-slate-800">{count}</div>
                <Badge variant={getActionColor(action)}>{action}</Badge>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardBody className="flex gap-4">
          <input
            type="text"
            placeholder="Filtrar por entidad..."
            value={filters.entity}
            onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
          <input
            type="text"
            placeholder="Filtrar por usuario..."
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
          <button onClick={loadData} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            Filtrar
          </button>
        </CardBody>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Registro de Actividad</h2>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="text-center py-10">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Acción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Entidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(log.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getActionColor(log.action)}>{log.action}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">{log.entity}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.userEmail || 'Sistema'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{log.ipAddress || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {logs.length === 0 && !loading && (
            <div className="text-center py-10 text-slate-500">No hay registros</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
