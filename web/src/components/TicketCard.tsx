import React from 'react';
import { Ticket } from '../types';
import { Clock, AlertCircle, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

const priorityConfig = {
  low: { 
    label: 'Baja', 
    class: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: null 
  },
  medium: { 
    label: 'Media', 
    class: 'bg-blue-100 text-blue-600 border-blue-200',
    icon: null 
  },
  high: { 
    label: 'Alta', 
    class: 'bg-amber-100 text-amber-600 border-amber-200',
    icon: null 
  },
  urgent: { 
    label: 'Urgente', 
    class: 'bg-red-100 text-red-600 border-red-200 animate-pulse',
    icon: AlertCircle 
  },
};

const statusConfig = {
  new: { label: 'Nuevo', class: 'bg-indigo-500' },
  open: { label: 'Abierto', class: 'bg-amber-500' },
  pending: { label: 'Pendiente', class: 'bg-purple-500' },
  resolved: { label: 'Resuelto', class: 'bg-emerald-500' },
  closed: { label: 'Cerrado', class: 'bg-slate-400' },
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  const priority = priorityConfig[ticket.priority];
  const status = statusConfig[ticket.status as keyof typeof statusConfig];
  const PriorityIcon = priority.icon;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/50 transition-all duration-300" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
              {ticket.ticketNumber}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${priority.class} flex items-center gap-1`}>
            {PriorityIcon && <PriorityIcon size={12} />}
            {priority.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {ticket.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {ticket.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status.class}`} />
            <span className="text-xs font-medium text-gray-600">{status.label}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {new Date(ticket.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
