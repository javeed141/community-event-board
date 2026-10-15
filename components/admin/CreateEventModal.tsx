'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

  const updateField = (
    field: keyof typeof initialFormState,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const labelClass =
    'block text-sm font-medium text-zinc-200 tracking-tight';

  const fieldInputClass =
    'h-9.5 sm:h-10 bg-zinc-950/70 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/60 focus:ring-emerald-500/20 text-sm transition-colors';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl [&>[data-slot=dialog-close]]:top-3.5 [&>[data-slot=dialog-close]]:right-4 [&>[data-slot=dialog-close]]:text-zinc-400 [&>[data-slot=dialog-close]]:hover:text-zinc-100 [&>[data-slot=dialog-close]]:hover:bg-zinc-800">
        {/* Modal Header */}
        <div className="px-6 py-3.5 border-b border-zinc-800/80 bg-zinc-900 shrink-0 pr-14">
          <DialogTitle className="text-base sm:text-lg font-semibold flex items-center gap-2.5 text-zinc-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span>Create Community Event</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs mt-0.5 leading-normal">
            Fill in the details below to publish a new event to the community board.
          </DialogDescription>
        </div>

        {/* Form Body - scrollbar hidden */}
        <div className="px-6 py-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 min-h-0 space-y-3.5">
          {formError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form
            id="create-event-modal-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            {/* Title */}
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="event-title" className={labelClass}>
                Event Title <span className="text-rose-400 font-semibold ml-0.5">*</span>
              </label>
              <Input
                id="event-title"
                placeholder="e.g. Coimbatore Traditional Food Carnival"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className={fieldInputClass}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label htmlFor="event-category" className={labelClass}>
                Category <span className="text-rose-400 font-semibold ml-0.5">*</span>
              </label>
              <select
                id="event-category"
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                className={`w-full ${fieldInputClass} px-3 rounded-lg border focus:outline-none focus:ring-2 cursor-pointer`}
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
              <label htmlFor="event-city" className={labelClass}>
                City <span className="text-rose-400 font-semibold ml-0.5">*</span>
              </label>
              <Input
                id="event-city"
                placeholder="e.g. Coimbatore"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className={fieldInputClass}
                required
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-1.5">
              <label htmlFor="event-dateTime" className={labelClass}>
                Date & Time <span className="text-rose-400 font-semibold ml-0.5">*</span>
              </label>
              <Input
                id="event-dateTime"
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => updateField('dateTime', e.target.value)}
                className={`${fieldInputClass} [color-scheme:dark]`}
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label htmlFor="event-price" className={labelClass}>
                Price (₹ INR) <span className="text-rose-400 font-semibold ml-0.5">*</span>
              </label>
              <Input
                id="event-price"
                type="number"
                min="0"
                placeholder="0 for Free event"
                value={formData.price}
                onChange={(e) => updateField('price', e.target.value)}
                className={fieldInputClass}
                required
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="event-imageUrl" className={labelClass}>
                Banner Image URL <span className="text-rose-400 font-semibold ml-0.5">*</span>
              </label>
              <Input
                id="event-imageUrl"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                className={fieldInputClass}
                required
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="event-description" className={labelClass}>
                Event Description <span className="text-rose-400 font-semibold ml-0.5">*</span>
              </label>
              <textarea
                id="event-description"
                rows={2}
                placeholder="Provide details about the event, what visitors can expect, venue instructions, etc."
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 p-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 transition-colors resize-none"
                required
              />
            </div>

            {/* Active Status Checkbox */}
            <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
              <input
                type="checkbox"
                id="modalIsActive"
                checked={formData.isActive}
                onChange={(e) => updateField('isActive', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700 accent-emerald-500 cursor-pointer focus:ring-emerald-500/30"
              />
              <label htmlFor="modalIsActive" className="text-sm font-medium text-zinc-200 cursor-pointer select-none leading-normal">
                Publish as <strong className="font-semibold text-emerald-400">Active</strong> immediately <span className="text-xs font-normal text-zinc-400 block sm:inline sm:ml-1">(uncheck to save as draft)</span>
              </label>
            </div>
          </form>
        </div>

        {/* Pinned Sticky Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-900/95 shrink-0 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="h-8.5 px-3.5 text-xs font-medium border-zinc-700/80 hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-event-modal-form"
            disabled={submitting}
            className="h-8.5 px-3.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white gap-2 cursor-pointer shadow-sm transition-all"
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
