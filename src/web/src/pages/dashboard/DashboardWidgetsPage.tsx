import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Modal, Input } from '../../components/ui';
import api from '../../services/api';

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  config: any;
  position: number;
  isVisible: boolean;
}

const WIDGET_TYPES = [
  { type: 'stats', label: '📊 Estadísticas', description: 'Muestra KPIs y métricas' },
  { type: 'tickets_list', label: '🎫 Lista de Tickets', description: 'Lista de tickets recientes' },
  { type: 'chart', label: '📈 Gráfico', description: 'Gráfico de barras o líneas' },
  { type: 'sla_status', label: '⏱️ Estado SLA', description: 'Tickets próximos a vencer' },
  { type: 'agent_workload', label: '👤 Carga de Agentes', description: 'Tickets por agente' },
  { type: 'recent_activity', label: '🕐 Actividad Reciente', description: 'Últimas acciones' },
];

export function DashboardWidgetsPage() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'stats', title: '' });

  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    try {
      const res = await api.get('/dashboard/widgets');
      setWidgets(res.data);
    } catch (error) {
      console.error('Error loading widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await api.post('/dashboard/widgets', form);
      setShowModal(false);
      setForm({ type: 'stats', title: '' });
      loadWidgets();
    } catch (error) {
      console.error('Error adding widget:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar widget?')) return;
    try {
      await api.delete(`/dashboard/widgets/${id}`);
      loadWidgets();
    } catch (error) {
      console.error('Error deleting widget:', error);
    }
  };

  const handleToggle = async (id: string, isVisible: boolean) => {
    try {
      await api.patch(`/dashboard/widgets/${id}`, { isVisible: !isVisible });
      loadWidgets();
    } catch (error) {
      console.error('Error toggling widget:', error);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const idx = widgets.findIndex(w => w.id === id);
    if (idx === -1) return;
    
    const newWidgets = [...widgets];
    const newPos = direction === 'up' ? idx - 1 : idx + 1;
    if (newPos < 0 || newPos >= widgets.length) return;
    
    [newWidgets[idx], newWidgets[newPos]] = [newWidgets[newPos], newWidgets[idx]];
    setWidgets(newWidgets);
    
    try {
      await api.put(`/dashboard/widgets/reorder`, { widgets: newWidgets.map((w, i) => ({ id: w.id, position: i })) });
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Widgets del Dashboard</h1>
          <p className="text-slate-500">Personaliza los widgets de tu dashboard</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Agregar Widget</Button>
      </div>

      {/* Widget Types Reference */}
      <Card>
        <CardHeader><h2 className="font-semibold">Tipos de Widgets Disponibles</h2></CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WIDGET_TYPES.map(w => (
              <div key={w.type} className="p-3 bg-slate-50 rounded-lg">
                <div className="font-medium text-slate-800">{w.label}</div>
                <div className="text-xs text-slate-500">{w.description}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Current Widgets */}
      <Card>
        <CardHeader><h2 className="font-semibold">Widgets Actuales</h2></CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="text-center py-10">Cargando...</div>
          ) : widgets.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No hay widgets configurados. Agrega tu primer widget.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {widgets.sort((a, b) => a.position - b.position).map((widget, idx) => (
                <div key={widget.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-400 text-sm">#{idx + 1}</div>
                    <div>
                      <div className="font-medium text-slate-800">{widget.title}</div>
                      <div className="text-sm text-slate-500">{WIDGET_TYPES.find(t => t.type === widget.type)?.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggle(widget.id, widget.isVisible)}
                      className={`px-3 py-1 rounded-lg text-sm ${widget.isVisible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {widget.isVisible ? '✓ Visible' : '👁 Oculto'}
                    </button>
                    <button 
                      onClick={() => handleReorder(widget.id, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button 
                      onClick={() => handleReorder(widget.id, 'down')}
                      disabled={idx === widgets.length - 1}
                      className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-30"
                    >
                      ▼
                    </button>
                    <button 
                      onClick={() => handleDelete(widget.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Agregar Widget">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Widget</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                {WIDGET_TYPES.map(w => (
                  <option key={w.type} value={w.type}>{w.label}</option>
                ))}
              </select>
            </div>
            <Input 
              label="Título" 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              placeholder="Mi Widget" 
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleAdd}>Agregar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
