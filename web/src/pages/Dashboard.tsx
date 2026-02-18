import React, { useEffect, useState } from 'react';
import { ticketsApi } from '../services/api';
import { Ticket } from '../types';
import TicketCard from '../components/TicketCard';
import { Ticket as TicketIcon, Users, Clock, TrendingUp, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await ticketsApi.getAll();
      setTickets(response.data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open' || t.status === 'new').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  const StatCard: React.FC<{ 
    icon: React.ElementType; 
    label: string; 
    value: number; 
    color: string;
    trend?: string;
    delay?: number;
  }> = ({ icon: Icon, label, value, color, trend, delay = 0 }) => (
    <div 
      className="card p-6 hover:shadow-lg transition-all duration-300 animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-4xl font-bold mt-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {value}
          </p>
          {trend && (
            <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
              <ArrowUpRight size={14} />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Welcome section */}
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido de nuevo 👋</h1>
        <p className="text-gray-500 mt-1">Aquí está lo que está pasando con tus tickets hoy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={TicketIcon} 
          label="Total de Tickets" 
          value={stats.total} 
          color="bg-gradient-to-br from-blue-500 to-blue-600" 
          delay={100}
        />
        <StatCard 
          icon={Clock} 
          label="Tickets Abiertos" 
          value={stats.open} 
          color="bg-gradient-to-br from-amber-500 to-orange-500"
          delay={200}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Pendientes" 
          value={stats.pending} 
          color="bg-gradient-to-br from-purple-500 to-violet-600"
          delay={300}
        />
        <StatCard 
          icon={Users} 
          label="Resueltos" 
          value={stats.resolved} 
          color="bg-gradient-to-br from-emerald-500 to-teal-500"
          delay={400}
        />
      </div>

      {/* Recent Tickets & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 card p-6 animate-fadeIn" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Tickets Recientes</h2>
            <Link 
              to="/tickets" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Ver todos <ArrowUpRight size={16} />
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-400 mt-2">Cargando...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TicketIcon size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No hay tickets</p>
              <Link 
                to="/tickets" 
                className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus size={18} />
                Crear primer ticket
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.slice(0, 6).map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6 animate-fadeIn" style={{ animationDelay: '600ms' }}>
          {/* New Ticket Card */}
          <div className="card p-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative">
              <h3 className="text-lg font-bold mb-2">Crear Nuevo Ticket</h3>
              <p className="text-indigo-100 text-sm mb-4">
                ¿Necesitas ayuda? Crea un nuevo ticket de soporte
              </p>
              <Link
                to="/tickets"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors"
              >
                <Plus size={18} />
                Nuevo Ticket
              </Link>
            </div>
          </div>

          {/* Stats mini */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Estado General</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Tasa de resolución</span>
                  <span className="font-medium text-gray-900">
                    {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Tickets críticos</span>
                  <span className="font-medium text-red-600">
                    {tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (tickets.filter(t => t.priority === 'urgent').length / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
