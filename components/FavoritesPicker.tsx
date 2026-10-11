'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Sparkles, CheckCircle2, Save } from 'lucide-react';

export const ALL_CATEGORIES = ['Music', 'Workshop', 'Food', 'Sports', 'Kids'];

type FavoritesPickerProps = {
  initialCategories?: string[];
  onSaved?: (categories: string[]) => void;
};

export default function FavoritesPicker({
  initialCategories,
  onSaved,
}: FavoritesPickerProps) {
  const [categories, setCategories] = useState<string[]>(initialCategories || []);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load from /api/favourites if initialCategories wasn't provided
  useEffect(() => {
    if (initialCategories !== undefined) {
      setCategories(initialCategories);
      return;
    }

    async function loadFavorites() {
      setLoading(true);
      try {
        const res = await fetch('/api/favourites');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.favoriteCategories || []);
        }
      } catch {
        // Silently catch
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [initialCategories]);

  // Toggle selection
  const toggleCategory = (cat: string) => {
    setSaveStatus('idle'); // Clear previous feedback
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    // handleSave()
  };

  // Save to database
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');

    try {
      const res = await fetch('/api/favourites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      });

      if (!res.ok) {
        setSaveStatus('error');
        return;
      }

      setSaveStatus('success');
      if (onSaved) {
        onSaved(categories);
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/80">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Sparkles className="w-4 h-4" />
          <CardTitle className="text-base font-semibold">Favourite Event Categories</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Pick your favourite categories and hit Save. Your feed will update to match.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-zinc-400 text-sm py-2">
            <Spinner /> <span>Loading your preferences...</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = categories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  type="button"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold shadow-sm'
                      : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>{cat}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Action row with Save button & Status */}
        <div className="flex items-center gap-3 pt-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || loading}
            className="gap-2 text-xs"
          >
            {saving ? <Spinner /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>

          {saveStatus === 'success' && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved successfully!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-rose-400">Failed to save. Please try again.</span>
          )}
        </div>

        {/* Selection summary hint */}
        <p className="text-xs text-zinc-500">
          {categories.length > 0
            ? `Selected: ${categories.join(', ')}`
            : 'No categories selected — pick at least one to personalise your feed.'}
        </p>
      </CardContent>
    </Card>
  );
}
