import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Modal } from '../../components/ui';
import api from '../../services/api';

export function TimeTrackingPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ticketId: '', minutes: 0, description: '', billable: false });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/time-tracking');
      setEntries(res.data);
    } catch (error) {
      console.error('Error loading time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.post('/time-tracking', form);
      setShowModal(false);
      setForm({ ticketId: '', minutes: 0, description: '', billable: false });
      loadData();
    } catch (error) {
      console.error('Error saving time entry:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar registro de tiempo?')) return;
    try {
      await api.delete(`/time-tracking/${id}`);
      loadData();
    } catch (error) {
      console.error('Error deleting time entry:', error);
    }
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const totalMinutes = entries.reduce((sum, e) => sum + (e.minutes || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Control de Tiempo</h1>
          <p className="text-slate-500">Registra el tiempo invertido en tickets</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Registrar Tiempo</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-blue-600">{formatTime(totalMinutes)}</div>
            <div className="text-sm text-slate-500">Total Registrado</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-green-600">{entries.length}</div>
            <div className="text-sm text-slate-500">Entradas</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-purple-600">{formatTime(entries.filter(e => e.billable).reduce((sum, e) => sum + (e.minutes || 0), 0))}</div>
            <div className="text-sm text-slate-500">Facturable</div>
          </CardBody>
        </Card>
      </div>

      {/* Entries */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="text-center py-10">Cargando...</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {entries.map(entry => (
                <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <div className="font-medium text-slate-800">🎫 {entry.ticketId}</div>
                    <div className="text-sm text-slate-500">{entry.description || 'Sin descripción'}</div>
                    <div className="text-xs text-slate-400">
                      {entry.user?.firstName} {entry.user?.lastName} • {new Date(entry.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold text-slate-800">{formatTime(entry.minutes)}</div>
                    {entry.billable && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">💰</span>}
                    <button onClick={() => handleDelete(entry.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {entries.length === 0 && !loading && (
            <div className="text-center py-10 text-slate-500">No hay registros de tiempo</div>
          )}
        </CardBody>
      </Card>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Registrar Tiempo">
          <div className="space-y-4">
            <Input label="ID del Ticket" value={form.ticketId} onChange={(e) => setForm({ ...form, ticketId: e.target.value })} placeholder="abc-123" />
            <Input label="Minutos" type="number" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: parseInt(e.target.value) || 0 })} />
            <Input label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Trabajo realizado..." />
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={form.billable} 
                onChange={(e) => setForm({ ...form, billable: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm text-slate-700">Facturable</label>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
