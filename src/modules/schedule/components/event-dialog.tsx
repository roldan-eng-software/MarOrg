"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/toast";
import {
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
} from "@/modules/schedule/services/schedule.actions";
import type { ScheduleEvent } from "@/types";

const eventTypeOptions = [
  { value: "reuniao", label: "Reunião", color: "#8B5CF6" },
  { value: "visita", label: "Visita", color: "#F97316" },
  { value: "followup", label: "Follow-up", color: "#14B8A6" },
  { value: "outro", label: "Outro", color: "#6B7280" },
];

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedDate: string;
  editingEvent?: ScheduleEvent | null;
}

export function EventDialog({ open, onClose, onSave, selectedDate, editingEvent }: EventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(selectedDate);
  const [eventTime, setEventTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventType, setEventType] = useState<string>("reuniao");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description ?? "");
      setEventDate(editingEvent.event_date);
      setEventTime(editingEvent.event_time ?? "");
      setEndTime(editingEvent.end_time ?? "");
      setEventType(editingEvent.event_type);
    } else {
      setTitle("");
      setDescription("");
      setEventDate(selectedDate);
      setEventTime("");
      setEndTime("");
      setEventType("reuniao");
    }
  }, [editingEvent, selectedDate, open]);

  async function handleSave() {
    if (!title.trim()) {
      showToast("Título é obrigatório", "error");
      return;
    }

    try {
      setSaving(true);
      const color = eventTypeOptions.find((o) => o.value === eventType)?.color ?? "#5B3A29";

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        event_date: eventDate,
        event_time: eventTime || null,
        end_time: endTime || null,
        event_type: eventType as ScheduleEvent["event_type"],
        color,
        entity_type: editingEvent?.entity_type ?? null,
        entity_id: editingEvent?.entity_id ?? null,
        customer_id: editingEvent?.customer_id ?? null,
        completed: editingEvent?.completed ?? false,
      };

      if (editingEvent) {
        await updateScheduleEvent(editingEvent.id, payload);
        showToast("Evento atualizado", "success");
      } else {
        await createScheduleEvent(payload);
        showToast("Evento criado", "success");
      }

      onSave();
      onClose();
    } catch {
      showToast("Erro ao salvar evento", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingEvent) return;
    if (!confirm("Excluir este evento?")) return;

    try {
      await deleteScheduleEvent(editingEvent.id);
      showToast("Evento excluído", "success");
      onSave();
      onClose();
    } catch {
      showToast("Erro ao excluir evento", "error");
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <DialogHeader title={editingEvent ? "Editar Evento" : "Novo Evento"} />

      <div className="space-y-4">
        <div>
          <label className="text-xs text-[#8B7A6B]">Título *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Reunião com cliente"
          />
        </div>

        <div>
          <label className="text-xs text-[#8B7A6B]">Descrição</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes do compromisso..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#8B7A6B]">Data *</label>
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-[#8B7A6B]">Tipo</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519]"
            >
              {eventTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#8B7A6B]">Hora Início</label>
            <Input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-[#8B7A6B]">Hora Fim</label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <div>
            {editingEvent && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Excluir
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
