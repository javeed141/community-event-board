'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { AdminEvent, CATEGORIES } from './types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: AdminEvent) => void;
}

const initialFormState = {
  title: '',
  category: 'Music',
  city: '',
  dateTime: '',
  price: '',
  description: '',
  imageUrl: '',
  isActive: true,
};

export default function CreateEventModal({
  isOpen,
  onClose,
  onEventCreated,
}: CreateEventModalProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormError(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate
    if (
      !formData.title.trim() ||
      !formData.category.trim() ||
      !formData.city.trim() ||
      !formData.dateTime.trim() ||
      formData.price === '' ||
      !formData.imageUrl.trim() ||
      !formData.description.trim()
    ) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const numPrice = Number(formData.price);
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError('Price must be a valid non-negative number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: numPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Failed to create event');
        return;
      }

      toast.add({
        title: 'Event Created',
        description: `"${formData.title}" was created successfully.`,
        type: 'success',
      });

      setFormData(initialFormState);
      onClose();
      onEventCreated(data.event);
    } catch {
      setFormError('Network error while creating event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[85vh] p-0 flex flex-col overflow-hidden bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 bg-zinc-900 shrink-0 pr-12">
          <DialogTitle className="text-lg font-bold flex items-center gap-2.5 text-emerald-400">
            <PlusCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Create a New Community Event</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
            Fill in the details below. Required fields include Title, Category, City, Date & Time, Price, Image URL, and Description.
          </DialogDescription>
        </div>

        {/* Scrollable Form Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          {formError && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form id="create-event-modal-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Event Title <span className="text-emerald-400">*</span>
              </label>
              <Input
                placeholder="e.g. Coimbatore Traditional Food Carnival"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-zinc-950/70 border-zinc-800 focus:border-emerald-500/60 text-sm h-10"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Category <span className="text-emerald-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950/70 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-zinc-900 text-zinc-100">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                City <span className="text-emerald-400">*</span>
              </label>
              <Input
                placeholder="e.g. Coimbatore"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-zinc-950/70 border-zinc-800 focus:border-emerald-500/60 text-sm h-10"
                required
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Date & Time <span className="text-emerald-400">*</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                className="bg-zinc-950/70 border-zinc-800 focus:border-emerald-500/60 text-sm h-10"
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Price (₹ INR) <span className="text-emerald-400">*</span>
              </label>
              <Input
                type="number"
                min="0"
                placeholder="0 for Free event"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-zinc-950/70 border-zinc-800 focus:border-emerald-500/60 text-sm h-10"
                required
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Banner Image URL <span className="text-emerald-400">*</span>
              </label>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="bg-zinc-950/70 border-zinc-800 focus:border-emerald-500/60 text-sm h-10"
                required
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Event Description <span className="text-emerald-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Provide details about the event, what visitors can expect, venue instructions, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 resize-none"
                required
              />
            </div>

            {/* Active Status Checkbox */}
            <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/80">
              <input
                type="checkbox"
                id="modalIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700 accent-emerald-500 cursor-pointer"
              />
              <label htmlFor="modalIsActive" className="text-xs text-zinc-300 cursor-pointer select-none">
                Publish as <strong className="text-emerald-400">Active</strong> immediately (uncheck to save as draft)
              </label>
            </div>
          </form>
        </div>

        {/* Pinned Sticky Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/95 shrink-0 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-event-modal-form"
            size="sm"
            disabled={submitting}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Save Event</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
