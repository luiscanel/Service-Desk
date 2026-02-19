import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Modal, Badge } from '../../components/ui';
import { knowledgeService } from '../../services/api';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  totalViews: number;
  categories: number;
  tags: number;
}

export function KnowledgePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, totalViews: 0, categories: 0, tags: 0 });
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Software',
    tags: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [articlesRes, statsRes, categoriesRes] = await Promise.all([
        knowledgeService.getAll({ search: searchTerm, category: selectedCategory, limit: 100 }),
        knowledgeService.getStats(),
        knowledgeService.getCategories(),
      ]);
      setArticles(articlesRes.data.articles || articlesRes.data);
      setStats(statsRes.data);
      const cats = categoriesRes.data.map((c: any) => c.category);
      setCategories(['all', ...cats]);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      await knowledgeService.create({
        ...formData,
        tags: tagsArray,
        author: 'Administrador',
      });
      setIsModalOpen(false);
      setFormData({ title: '', content: '', category: 'Software', tags: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Error al crear artículo');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este artículo?')) {
      try {
        await knowledgeService.delete(id);
        fetchData();
        setSelectedArticle(null);
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  const handleViewArticle = async (article: Article) => {
    try {
      await knowledgeService.incrementViews(article.id);
      setArticles(articles.map(a => 
        a.id === article.id ? { ...a, views: a.views + 1 } : a
      ));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
    setSelectedArticle(article);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.tags && article.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesSearch;
  });

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Base de Conocimiento</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          + Nuevo Artículo
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <Input
            placeholder="Buscar artículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'Todas las categorías' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
            <div className="text-sm text-slate-500">Total Artículos</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-2xl font-bold text-slate-800">
              {stats.totalViews}
            </div>
            <div className="text-sm text-slate-500">Total Vistas</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-2xl font-bold text-slate-800">{stats.categories}</div>
            <div className="text-sm text-slate-500">Categorías</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-2xl font-bold text-slate-800">{stats.tags}</div>
            <div className="text-sm text-slate-500">Tags</div>
          </CardBody>
        </Card>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Card 
            key={article.id} 
            hover 
            className="cursor-pointer"
            onClick={() => handleViewArticle(article)}
          >
            <CardBody>
              <div className="flex items-start justify-between mb-3">
                <Badge variant="info">{article.category}</Badge>
                <span className="text-xs text-slate-400">👁 {article.views}</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4">{article.content}</p>
              <div className="flex flex-wrap gap-1">
                {article.tags && article.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <div className="text-slate-400 mb-2">📚</div>
            <div className="text-slate-500">No se encontraron artículos</div>
          </CardBody>
        </Card>
      )}

      {/* Article Detail Modal */}
      <Modal
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.title || ''}
        size="lg"
      >
        {selectedArticle && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="info">{selectedArticle.category}</Badge>
              <span className="text-sm text-slate-500">Por {selectedArticle.author}</span>
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm text-slate-400">{selectedArticle.views} vistas</span>
            </div>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 whitespace-pre-wrap">{selectedArticle.content}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              {selectedArticle.tags && selectedArticle.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-slate-400">
                Actualizado: {selectedArticle.updatedAt}
              </div>
              <Button 
                variant="secondary" 
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDeleteArticle(selectedArticle.id)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Article Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Artículo"
        size="lg"
      >
        <form onSubmit={handleCreateArticle} className="space-y-4">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Título del artículo"
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contenido</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Escribe el contenido del artículo..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              rows={6}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Software">Software</option>
                <option value="Redes">Redes</option>
                <option value="Sistemas">Sistemas</option>
                <option value="Seguridad">Seguridad</option>
                <option value="Hardware">Hardware</option>
              </select>
            </div>
            <Input
              label="Tags (separados por coma)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="wifi, red, conexión"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Publicar Artículo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
