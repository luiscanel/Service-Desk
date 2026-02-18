import React, { useEffect, useState } from 'react';
import { agentsApi } from '../services/api';
import { Agent } from '../types';
import { UserPlus, Search, CheckCircle, XCircle, Zap, Mail } from 'lucide-react';

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await agentsApi.getAll();
      setAgents(response.data);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent => 
    agent.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: agents.length,
    available: agents.filter(a => a.isAvailable).length,
    busy: agents.filter(a => !a.isAvailable).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="animate-fadeIn">
          <h1 className="text-3xl font-bold text-gray-900">Agentes</h1>
          <p className="text-gray-500 mt-1">Equipo de soporte técnico</p>
        </div>
        <button className="btn btn-primary animate-fadeIn shadow-lg shadow-indigo-500/30" style={{ animationDelay: '100ms' }}>
          <UserPlus size={20} />
          Nuevo Agente
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-4 animate-fadeIn" style={{ animationDelay: '150ms' }}>
          <div className="p-3 rounded-xl bg-indigo-100">
            <UserPlus size={24} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Agentes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <div className="p-3 rounded-xl bg-emerald-100">
            <CheckCircle size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Disponibles</p>
            <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 animate-fadeIn" style={{ animationDelay: '250ms' }}>
          <div className="p-3 rounded-xl bg-amber-100">
            <XCircle size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Ocupados</p>
            <p className="text-2xl font-bold text-gray-900">{stats.busy}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6 animate-fadeIn" style={{ animationDelay: '300ms' }}>
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar agentes por ID o skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-12"
          />
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando agentes...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="card p-12 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus size={40} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron agentes</h3>
          <p className="text-gray-500">Crea tu primer agente de soporte</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent, index) => (
            <div 
              key={agent.id} 
              className="card p-6 animate-fadeIn hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 50 + 350}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                    {agent.level}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Agente</h3>
                    <p className="text-xs text-gray-400 font-mono">{agent.id.slice(0, 8)}...</p>
                  </div>
                </div>
                {agent.isAvailable ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                    <CheckCircle size={14} />
                    Disponible
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                    <XCircle size={14} />
                    Ocupado
                  </span>
                )}
              </div>

              {/* Level badge */}
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-amber-500" />
                <span className="text-sm font-medium text-gray-700">Nivel {agent.level}</span>
              </div>

              {/* Workload */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Carga de trabajo</span>
                  <span className="font-semibold text-gray-900">
                    {agent.currentTickets} / {agent.ticketCapacity}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      agent.currentTickets / agent.ticketCapacity > 0.8 
                        ? 'bg-gradient-to-r from-red-400 to-red-500'
                        : agent.currentTickets / agent.ticketCapacity > 0.5
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    }`}
                    style={{ width: `${Math.min((agent.currentTickets / agent.ticketCapacity) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {agent.skills?.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 text-xs font-medium rounded-lg border border-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!agent.skills || agent.skills.length === 0) && (
                    <span className="text-xs text-gray-400">Sin skills asignados</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;
