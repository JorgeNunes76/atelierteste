import { useState, useEffect, useRef } from "react";
import { getObras, createObra, updateObra, deleteObra, uploadObraImage } from "../../../../lib/db";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Edit2, Trash2, Image as ImageIcon, Search,
  Filter, MoreVertical, CheckCircle, XCircle, Clock,
  ExternalLink, ChevronRight, X, Save, Upload
} from "lucide-react";
import { toast } from "../../../../lib/toast";

import { GOLD, SLATE } from "../../../../lib/tokens";

type EstadoObra = "disponivel" | "reservado" | "vendido";

interface Obra {
  id: string;
  titulo: string;
  tecnica: string;
  dimensoes: string | null;
  ano: number | null;
  preco: number | null;
  estado: string;
  imagem_url: string | null;
  slug: string | null;
  destaque: boolean;
}

const ALLOWED_ARTWORK_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_ARTWORK_IMAGE_BYTES = 8 * 1024 * 1024;

function toSlugBase(value: string): string {
  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized.slice(0, 80);
}

function ensureUniqueSlug(baseSlug: string, existingSlugs: Set<string>): string {
  const base = baseSlug || "obra";
  if (!existingSlugs.has(base)) return base;

  let suffix = 2;
  let candidate = `${base}-${suffix}`;
  while (existingSlugs.has(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

const ESTADO_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};

export function ObrasSection({ globalSearch }: { globalSearch: string }) {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getObras();
      setObras(data as any);
    } catch (err) {
      toast.error("Erro ao carregar obras.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = obras.filter((o) => {
    const label = ESTADO_LABEL[o.estado] ?? o.estado;
    const matchesStatus = filterStatus === "Todos" || label === filterStatus;
    const matchesSearch = 
      !globalSearch || 
      o.titulo.toLowerCase().includes(globalSearch.toLowerCase()) || 
      o.tecnica.toLowerCase().includes(globalSearch.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleEdit = (obra: Obra) => {
    setEditingObra(obra);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteObra(id);
      setObras((prev) => prev.filter((o) => o.id !== id));
      toast.success("Obra removida com sucesso.");
      setDeleteId(null);
    } catch (err) {
      toast.error("Erro ao eliminar obra.");
    }
  };

  return (
    <div style={{ padding: "24px 32px" }}>
      {/* Header controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["Todos", "Disponível", "Reservado", "Vendido"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: filterStatus === s ? GOLD : "#eef0f3",
                background: filterStatus === s ? GOLD : "#fff",
                color: filterStatus === s ? "#fff" : SLATE,
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditingObra(null);
            setShowModal(true);
          }}
          style={{
            background: "#1a1c1e",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "10px 20px",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <Plus size={18} />
          Nova Obra
        </button>
      </div>

      {/* Grid of Artworks */}
      {loading ? (
        <div style={{ padding: 100, textAlign: "center", color: SLATE }}>A carregar inventário...</div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
          gap: 24 
        }}>
          {filtered.map((obra) => (
            <ObraCard 
              key={obra.id} 
              obra={obra} 
              onEdit={() => handleEdit(obra)} 
              onDelete={() => setDeleteId(obra.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: 80, textAlign: "center", background: "#fff", borderRadius: 20, border: "1px dashed #ced4da" }}>
              <p style={{ color: SLATE, margin: 0 }}>Nenhuma obra encontrada para os filtros selecionados.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <ObraFormModal 
            obra={editingObra} 
            existingSlugs={obras.map((item) => item.slug).filter((slug): slug is string => Boolean(slug && slug.trim()))}
            onClose={() => setShowModal(false)} 
            onSuccess={() => {
              setShowModal(false);
              load();
            }}
          />
        )}
        {deleteId && (
          <ConfirmDeleteModal 
            onConfirm={() => handleDelete(deleteId)} 
            onCancel={() => setDeleteId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ObraCard({ obra, onEdit, onDelete }: { obra: Obra; onEdit: () => void; onDelete: () => void }) {
  const status = (ESTADO_LABEL[obra.estado] || obra.estado) as string;
  
  return (
    <motion.div
      layout
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1px solid #eef0f3",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.06)" }}
    >
      <div style={{ position: "relative", aspectRatio: "4/3", background: "#f8f9fa", overflow: "hidden" }}>
        {obra.imagem_url ? (
          <img 
            src={obra.imagem_url} 
            alt={obra.titulo} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ced4da" }}>
            <ImageIcon size={48} strokeWidth={1} />
          </div>
        )}
        
        <div style={{ 
          position: "absolute", 
          top: 12, 
          right: 12,
          padding: "6px 12px",
          borderRadius: 8,
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          background: status === "Disponível" ? "#10B981" : status === "Reservado" ? "#F59E0B" : "#EF4444",
          color: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}>
          {status}
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1a2130", margin: 0, fontFamily: "var(--font-serif)" }}>
            {obra.titulo}
          </h3>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: GOLD }}>
            {obra.preco ? `€${obra.preco.toLocaleString("pt-PT")}` : "—"}
          </span>
        </div>
        
        <p style={{ fontSize: "0.8rem", color: SLATE, marginBottom: 20 }}>
          {obra.tecnica} • {obra.dimensoes || "Dimensões N/D"}
        </p>

        <div style={{ display: "flex", gap: 10, paddingTop: 16, borderTop: "1px solid #f1f3f5" }}>
          <button
            onClick={onEdit}
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px",
              borderRadius: 10,
              background: "#f8f9fa",
              border: "1px solid #eef0f3",
              color: "#4a5568",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Edit2 size={14} /> Editar
          </button>
          <button
            onClick={onDelete}
            style={{
              width: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "10px",
              borderRadius: 10,
              background: "#fff1f1",
              border: "1px solid #ffebeb",
              color: "#ef4444",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ObraFormModal({
  obra,
  existingSlugs,
  onClose,
  onSuccess,
}: {
  obra: Obra | null;
  existingSlugs: string[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    titulo: obra?.titulo || "",
    tecnica: obra?.tecnica || "Acrílico sobre Tela",
    dimensoes: obra?.dimensoes || "",
    ano: obra?.ano?.toString() || new Date().getFullYear().toString(),
    preco: obra?.preco?.toString() || "",
    estado: obra?.estado || "disponivel",
    imagem_url: obra?.imagem_url || "",
    destaque: obra?.destaque || false,
  });

  const handleImageFile = async (file: File) => {
    if (!ALLOWED_ARTWORK_IMAGE_TYPES.has(file.type)) {
      toast.error("Formato inválido. Usa JPG, PNG, WEBP ou AVIF.");
      return;
    }
    if (file.size > MAX_ARTWORK_IMAGE_BYTES) {
      toast.error("Imagem demasiado grande. Máximo 8 MB.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadObraImage(file);
      setFormData(prev => ({ ...prev, imagem_url: url }));
      toast.success("Imagem carregada!");
    } catch {
      toast.error("Erro ao carregar imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const titulo = formData.titulo.trim();
      const tecnica = formData.tecnica.trim();
      const dimensoes = formData.dimensoes.trim();
      const anoRaw = formData.ano.trim();
      const precoRaw = formData.preco.trim().replace(",", ".");
      const currentYear = new Date().getFullYear();

      if (!titulo) {
        throw new Error("Indica o título da obra.");
      }
      if (!tecnica) {
        throw new Error("Indica a técnica da obra.");
      }
      if (!Object.keys(ESTADO_LABEL).includes(formData.estado)) {
        throw new Error("Estado de obra inválido.");
      }
      if (!formData.imagem_url && formData.estado !== "vendido") {
        throw new Error("Adiciona uma imagem para obras disponíveis ou reservadas.");
      }

      let ano: number | null = null;
      if (anoRaw) {
        const parsedYear = Number.parseInt(anoRaw, 10);
        if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > currentYear + 1) {
          throw new Error("Ano inválido. Usa um valor entre 1900 e o ano atual.");
        }
        ano = parsedYear;
      }

      let preco: number | null = null;
      if (precoRaw) {
        const parsedPrice = Number.parseFloat(precoRaw);
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
          throw new Error("Preço inválido. Usa um valor superior a zero.");
        }
        preco = Number(parsedPrice.toFixed(2));
      }
      if (!preco && formData.estado !== "vendido") {
        throw new Error("Define um preço para obras disponíveis ou reservadas.");
      }

      const existingSlugSet = new Set(existingSlugs);
      if (obra?.slug) {
        existingSlugSet.delete(obra.slug);
      }
      const slug = obra?.slug || ensureUniqueSlug(toSlugBase(titulo), existingSlugSet);

      const dataToSave = {
        ...formData,
        titulo,
        tecnica,
        dimensoes: dimensoes || null,
        ano,
        preco,
        slug,
      };

      if (obra) {
        await updateObra(obra.id, dataToSave);
        toast.success("Obra atualizada!");
      } else {
        await createObra(dataToSave as any);
        toast.success("Nova obra adicionada!");
      }
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao guardar obra.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ position: "relative", background: "#fff", width: "100%", maxWidth: 800, borderRadius: 24, overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
      >
        <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f3f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#1a2130" }}>{obra ? "Editar Obra" : "Nova Obra"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: SLATE }}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="space-y-4">
              <FormGroup label="Título da Obra">
                <input required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} style={inputStyle} />
              </FormGroup>
              
              <FormGroup label="Técnica">
                <select required value={formData.tecnica} onChange={e => setFormData({...formData, tecnica: e.target.value})} style={inputStyle}>
                  <option value="Acrílico sobre Tela">Acrílico sobre Tela</option>
                  <option value="Óleo sobre Tela">Óleo sobre Tela</option>
                  <option value="Técnica Mista">Técnica Mista</option>
                  <option value="Grafite sobre Papel">Grafite sobre Papel</option>
                  <option value="Escultura">Escultura</option>
                </select>
              </FormGroup>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <FormGroup label="Ano">
                  <input type="number" value={formData.ano} onChange={e => setFormData({...formData, ano: e.target.value})} style={inputStyle} />
                </FormGroup>
                <FormGroup label="Preço (€)">
                  <input type="text" value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} style={inputStyle} />
                </FormGroup>
              </div>

              <FormGroup label="Dimensões (Ex: 100x80cm)">
                <input value={formData.dimensoes} onChange={e => setFormData({...formData, dimensoes: e.target.value})} style={inputStyle} />
              </FormGroup>
            </div>

            <div className="space-y-4">
              <FormGroup label="Estado de Disponibilidade">
                <div style={{ display: "flex", gap: 8 }}>
                  {Object.entries(ESTADO_LABEL).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData({...formData, estado: val})}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 10, border: "1px solid",
                        borderColor: formData.estado === val ? GOLD : "#eef0f3",
                        background: formData.estado === val ? `${GOLD}10` : "#fff",
                        color: formData.estado === val ? GOLD : SLATE,
                        fontSize: "0.75rem", fontWeight: 600, cursor: "pointer"
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </FormGroup>

              <FormGroup label="Imagem da Obra">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }}
                />
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? GOLD : "#dee2e6"}`,
                    borderRadius: 12,
                    background: dragOver ? `${GOLD}08` : formData.imagem_url ? "#f8f9fa" : "#fcfcfc",
                    cursor: uploading ? "wait" : "pointer",
                    overflow: "hidden",
                    transition: "all 0.2s",
                    minHeight: 140,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {uploading ? (
                    <div style={{ textAlign: "center", padding: 24 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${GOLD}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                      <p style={{ margin: 0, fontSize: "0.8rem", color: SLATE }}>A carregar imagem...</p>
                    </div>
                  ) : formData.imagem_url ? (
                    <>
                      <img src={formData.imagem_url} alt="preview" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "all 0.2s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.4)"; (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0)"; (e.currentTarget as HTMLElement).style.opacity = "0"; }}
                      >
                        <div style={{ textAlign: "center", color: "#fff" }}>
                          <Upload size={24} style={{ marginBottom: 6 }} />
                          <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600 }}>Substituir imagem</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: 24 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${GOLD}15`, color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                        <Upload size={22} />
                      </div>
                      <p style={{ margin: "0 0 4px", fontSize: "0.85rem", fontWeight: 600, color: "#1a2130" }}>Arrasta a imagem ou clica para selecionar</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: SLATE }}>PNG, JPG, WEBP, AVIF · Máx. 8 MB</p>
                    </div>
                  )}
                </div>
                {formData.imagem_url && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFormData(prev => ({ ...prev, imagem_url: "" })); }}
                    style={{ marginTop: 6, background: "none", border: "none", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer", textAlign: "left", padding: 0 }}
                  >
                    × Remover imagem
                  </button>
                )}
              </FormGroup>
              
              <div style={{ 
                marginTop: 20, 
                padding: 16, 
                background: "#f8f9fa", 
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "#1a2130" }}>Obra em Destaque</p>
                  <p style={{ margin: 0, fontSize: "0.7rem", color: SLATE }}>Aparecerá na página inicial</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.destaque} 
                  onChange={e => setFormData({...formData, destaque: e.target.checked})}
                  style={{ width: 20, height: 20, accentColor: GOLD }}
                />
              </div>

              <div style={{ marginTop: 24, padding: "12px 16px", background: "rgba(201,169,110,0.05)", borderRadius: 12 }}>
                <p style={{ fontSize: "0.75rem", color: GOLD, margin: 0, lineHeight: 1.5 }}>
                  <strong>Dica:</strong> Para melhores resultados, use imagens com rácio 3:4 ou 4:5 e boa resolução.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 40, display: "flex", gap: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid #eef0f3", background: "#fff", color: SLATE, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: "14px", borderRadius: 12, border: "none", background: GOLD, color: "#fff", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? "A processar..." : <><Save size={18} /> {obra ? "Guardar Alterações" : "Adicionar Obra"}</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ConfirmDeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} />
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
         style={{ position: "relative", background: "#fff", width: "100%", maxWidth: 400, borderRadius: 24, padding: 32, textAlign: "center" }}
      >
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff1f1", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Trash2 size={32} />
        </div>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>Confirmar Eliminação</h3>
        <p style={{ color: SLATE, fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 32 }}>Tem a certeza que deseja remover esta obra definitivamente? Esta ação não pode ser desfeita.</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #eef0f3", background: "#fff", color: SLATE, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Eliminar</button>
        </div>
      </motion.div>
    </div>
  );
}

function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: SLATE, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%" as const,
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid #dee2e6",
  fontSize: "0.9rem",
  outline: "none",
  background: "#fcfcfc",
  color: "#333",
};
