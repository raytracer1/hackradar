'use client';

import { useState } from 'react';
import { SKILL_GROUPS } from '@/backend/lib/skills';

interface SkillSelectProps {
  selected: string[];
  onToggle: (id: string) => void;
}

// Grouped multi-select popover. Persistence lives in HomeClient — this
// component is fully controlled.
export default function SkillSelect({ selected, onToggle }: SkillSelectProps) {
  const [open, setOpen] = useState(false);
  const active = selected.length > 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition ${
          active
            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
        }`}
      >
        Skills{active ? ` (${selected.length})` : ''}
        <svg
          className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Click-away overlay */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            aria-multiselectable="true"
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
            className="absolute left-0 top-full z-20 mt-2 max-h-80 w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
          >
            {SKILL_GROUPS.map((group) => (
              <div key={group.name}>
                <div className="px-3 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.name}
                </div>
                {group.skills.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                      checked={selected.includes(skill.id)}
                      onChange={() => onToggle(skill.id)}
                    />
                    {skill.label}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
