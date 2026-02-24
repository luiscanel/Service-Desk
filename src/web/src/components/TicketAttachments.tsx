import { useState, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface AttachmentsProps {
  ticketId: string;
  attachments: Attachment[];
  onUploadComplete?: () => void;
}

export function TicketAttachments({ ticketId, attachments: initialAttachments, onUploadComplete }: AttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments || []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Convertir archivo a base64
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Extraer solo los datos base64 (sin el prefix)
        const base64Data = base64.split(',')[1];

        // Subir al servidor
        await axios.post(`${API_URL}/tickets/${ticketId}/attachments`, {
          fileName: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          data: base64Data,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      // Recargar adjuntos
      const response = await axios.get(`${API_URL}/tickets/${ticketId}/attachments`);
      setAttachments(response.data);
      onUploadComplete?.();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;

    try {
      await axios.delete(`${API_URL}/tickets/${ticketId}/attachments/${attachmentId}`);
      setAttachments(attachments.filter(a => a.id !== attachmentId));
      onUploadComplete?.();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error al eliminar archivo');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📎';
  };

  return (
    <div className="attachments-container">
      <div className="attachments-header">
        <h4>📎 Adjuntos</h4>
        <span className="attachment-count">({attachments.length})</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id={`file-input-${ticketId}`}
        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
      />

      <label
        htmlFor={`file-input-${ticketId}`}
        className={`upload-button ${uploading ? 'uploading' : ''}`}
      >
        {uploading ? '⏳ Subiendo...' : '➕ Agregar archivo'}
      </label>

      {attachments.length > 0 && (
        <div className="attachments-list">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="attachment-item">
              <span className="file-icon">{getFileIcon(attachment.mimeType)}</span>
              <div className="file-info">
                <span className="file-name">{attachment.originalName}</span>
                <span className="file-size">{formatFileSize(attachment.size)}</span>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDelete(attachment.id)}
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {attachments.length === 0 && !uploading && (
        <p className="no-attachments">No hay archivos adjuntos</p>
      )}

      <style>{`
        .attachments-container {
          margin-top: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }
        .attachments-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .attachments-header h4 {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }
        .attachment-count {
          color: #6b7280;
          font-size: 0.85rem;
        }
        .upload-button {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background 0.2s;
        }
        .upload-button:hover {
          background: #2563eb;
        }
        .upload-button.uploading {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .attachments-list {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .attachment-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        .file-icon {
          font-size: 1.25rem;
        }
        .file-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .file-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: #1f2937;
        }
        .file-size {
          font-size: 0.75rem;
          color: #6b7280;
        }
        .delete-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .delete-button:hover {
          opacity: 1;
        }
        .no-attachments {
          margin-top: 0.5rem;
          color: #9ca3af;
          font-size: 0.85rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
