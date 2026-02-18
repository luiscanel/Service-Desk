import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Badge, Button } from '../../components/ui';
import api from '../../services/api';

export function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [approvalsRes, statsRes] = await Promise.all([
        api.get('/approvals'),
        api.get('/approvals/stats'),
      ]);
      setApprovals(approvalsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id: string, approved: boolean) => {
    const comment = prompt('Comentario (opcional):');
    try {
      await api.post(`/approvals/${id}/respond`, { 
        approved, 
        respondedBy: 'admin',
        comment 
      });
      loadData();
    } catch (error) {
      console.error('Error responding:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'info';
    }
  };

  const filteredApprovals = approvals.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Aprobaciones</h1>
        <p className="text-slate-500">Gestiona solicitudes de aprobación para cerrar tickets</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-slate-500">Total</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-slate-500">Pendientes</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-slate-500">Aprobadas</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-slate-500">Rechazadas</div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'all' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Approvals List */}
      <Card>
        <CardHeader><h2 className="font-semibold">Solicitudes de Aprobación</h2></CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="text-center py-10">Cargando...</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredApprovals.map(approval => (
                <div key={approval.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-800">🎫 {approval.ticketNumber}</div>
                      <div className="text-sm text-slate-500">
                        Solicitado por: {approval.requestedByEmail}
                      </div>
                      <div className="text-sm text-slate-500">
                        Aprobador: {approval.approverEmail}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(approval.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={getStatusColor(approval.status)}>
                        {approval.status.toUpperCase()}
                      </Badge>
                      {approval.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleRespond(approval.id, true)}>✓</Button>
                          <Button variant="danger" size="sm" onClick={() => handleRespond(approval.id, false)}>✗</Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {approval.comment && (
                    <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                      "{approval.comment}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {filteredApprovals.length === 0 && !loading && (
            <div className="text-center py-10 text-slate-500">No hay solicitudes</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
