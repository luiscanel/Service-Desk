import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Badge, Modal } from '../../components/ui';
import api from '../../services/api';

export function ScheduledReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    reportType: 'weekly',
    frequency: 'weekly',
    recipients: '',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await api.get('/reports/scheduled');
      setReports(res.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.post('/reports/scheduled', form);
      setShowModal(false);
      setForm({ name: '', reportType: 'weekly', frequency: 'weekly', recipients: '' });
      loadReports();
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar reporte programado?')) return;
    try {
      await api.delete(`/reports/scheduled/${id}`);
      loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleRunNow = async (id: string) => {
    try {
      const res = await api.post(`/reports/scheduled/${id}/run`);
      alert(res.data.success ? 'Reporte enviado' : 'Error al enviar');
    } catch (error) {
      console.error('Error running report:', error);
    }
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      default: return freq;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reportes Programados</h1>
          <p className="text-slate-500">Envía reportes por email automáticamente</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Nuevo Reporte</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-blue-600">{reports.length}</div>
            <div className="text-sm text-slate-500">Total Reportes</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-green-600">{reports.filter(r => r.isActive).length}</div>
            <div className="text-sm text-slate-500">Activos</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-purple-600">{reports.filter(r => r.lastRunAt).length}</div>
            <div className="text-sm text-slate-500">Ejecutados</div>
          </CardBody>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader><h2 className="font-semibold">Reportes Programados</h2></CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="text-center py-10">Cargando...</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {reports.map(report => (
                <div key={report.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-800">{report.name}</div>
                      <div className="text-sm text-slate-500">
                        📊 {report.reportType} | 📅 {getFrequencyLabel(report.frequency)}
                      </div>
                      <div className="text-sm text-slate-500">📧 {report.recipients}</div>
                      {report.lastRunAt && (
                        <div className="text-xs text-slate-400">
                          Última ejecución: {new Date(report.lastRunAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={report.isActive ? 'success' : 'warning'}>
                        {report.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Button size="sm" variant="secondary" onClick={() => handleRunNow(report.id)}>
                        ▶ Ejecutar
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(report.id)}>
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {reports.length === 0 && !loading && (
            <div className="text-center py-10 text-slate-500">No hay reportes programados</div>
          )}
        </CardBody>
      </Card>

      {/* Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Nuevo Reporte Programado">
          <div className="space-y-4">
            <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Reporte Semanal de Tickets" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Reporte</label>
              <select
                value={form.reportType}
                onChange={(e) => setForm({ ...form, reportType: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Frecuencia</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
            <Input label="Destinatarios" value={form.recipients} onChange={(e) => setForm({ ...form, recipients: e.target.value })} placeholder="jefe@empresa.com, manager@empresa.com" />
            <p className="text-xs text-slate-500">Separa múltiples emails con comas</p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Crear</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
