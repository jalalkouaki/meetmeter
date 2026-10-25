import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Person, RoleTier } from '../../types';
import { formatCurrency } from '../../lib/currency';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Shield,
  Percent,
  DollarSign,
  Check,
  X,
} from 'lucide-react';

export const PeopleManager: React.FC = () => {
  const { people, savePerson, deletePerson, settings, updateSettings, updateTierRates, hideCostNumbers } = useAppStore();

  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [name, setName] = useState('');
  const [roleTier, setRoleTier] = useState<RoleTier>('Mid');
  const [customRate, setCustomRate] = useState<string>('');
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const tierRates = settings.tier_rates;

  const handleOpenAdd = () => {
    setEditingPerson(null);
    setName('');
    setRoleTier('Mid');
    setCustomRate('');
    setUseCustomRate(false);
    setIsOptedIn(false);
    setIsAdding(true);
  };

  const handleOpenEdit = (p: Person) => {
    setEditingPerson(p);
    setName(p.display_name);
    setRoleTier(p.role_tier);
    setCustomRate(p.base_hourly_rate.toString());
    setUseCustomRate(p.base_hourly_rate !== tierRates[p.role_tier]);
    setIsOptedIn(p.is_opted_in);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const baseRate = useCustomRate && customRate ? parseFloat(customRate) : tierRates[roleTier];

    const personToSave: Person = {
      id: editingPerson ? editingPerson.id : `person_${Date.now()}`,
      display_name: name.trim(),
      role_tier: roleTier,
      base_hourly_rate: isNaN(baseRate) ? tierRates[roleTier] : baseRate,
      is_opted_in: isOptedIn,
    };

    savePerson(personToSave);
    setIsAdding(false);
  };

  const handleTierRateChange = (tier: RoleTier, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      updateTierRates({
        ...tierRates,
        [tier]: num,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Team Roster & Compensation Tiers</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage attendees and standardized role brackets. Exact individual compensation is never exposed.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-white transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overhead Multiplier Box */}
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Loaded Labor Multiplier
            </span>
            <Percent className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.05"
              min="1.0"
              max="2.5"
              value={settings.overhead_multiplier}
              onChange={(e) => updateSettings({ overhead_multiplier: parseFloat(e.target.value) || 1.0 })}
              className="w-20 px-2.5 py-1 rounded bg-zinc-950 text-zinc-100 font-mono font-medium text-sm border border-zinc-800 focus:border-zinc-500 outline-none"
            />
            <span className="text-zinc-400 text-xs">x base rate</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Multiplies base rate by {settings.overhead_multiplier}x to account for health insurance, taxes, and tooling.
          </p>
        </div>

        {/* Privacy Info */}
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Role Tier Masking
            </span>
            <Shield className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="text-xs text-zinc-300 font-medium">
            Confidential by Default
          </div>
          <p className="text-[11px] text-zinc-500">
            Meeting calculations use benchmark seniority brackets to preserve individual salary privacy.
          </p>
        </div>
      </div>

      {/* Role Tier Base Rates Table */}
      <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Standard Seniority Base Rates
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {(Object.keys(tierRates) as RoleTier[]).map((tier) => {
            const base = tierRates[tier];
            const loaded = base * settings.overhead_multiplier;
            return (
              <div key={tier} className="p-3 rounded-md bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="text-[11px] font-medium text-zinc-400">{tier}</div>
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500 text-xs">$</span>
                  <input
                    type="number"
                    value={base}
                    onChange={(e) => handleTierRateChange(tier, e.target.value)}
                    className="w-full px-2 py-0.5 rounded bg-zinc-900 border border-zinc-750 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
                  />
                  <span className="text-zinc-500 text-[10px]">/h</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  Loaded: ${loaded.toFixed(0)}/h
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roster Table */}
      <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Registered Attendees ({people.length})
          </h3>
          <span className="text-[11px] text-zinc-500">Local team roster</span>
        </div>

        {people.length === 0 ? (
          <div className="p-8 rounded-md bg-zinc-950 border border-dashed border-zinc-800 text-center space-y-2.5">
            <div className="text-xs text-zinc-300 font-medium">No team members added yet</div>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
              Add members and assign their seniority tier to calculate real-time meeting costs.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-950 text-xs font-medium hover:bg-zinc-200"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-850/80 text-zinc-400 uppercase font-medium text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Role Tier</th>
                  <th className="py-2.5 px-3">Base Rate</th>
                  <th className="py-2.5 px-3">Loaded Rate ({settings.overhead_multiplier}x)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {people.map((person) => {
                  const loaded = person.base_hourly_rate * settings.overhead_multiplier;
                  return (
                    <tr key={person.id} className="hover:bg-zinc-850/40 transition">
                      <td className="py-2.5 px-3 font-medium text-zinc-100">
                        {person.display_name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-750 text-[10px]">
                          {person.role_tier}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-400">
                        {hideCostNumbers ? '•••' : `$${person.base_hourly_rate}/hr`}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-zinc-200">
                        {hideCostNumbers ? '•••' : `$${loaded.toFixed(2)}/hr`}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(person)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deletePerson(person.id)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-100">
                {editingPerson ? 'Edit Member' : 'Add Team Member'}
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-zinc-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Seniority Role Tier</label>
                <select
                  value={roleTier}
                  onChange={(e) => setRoleTier(e.target.value as RoleTier)}
                  className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-zinc-500 outline-none"
                >
                  <option value="Junior">Junior (${tierRates.Junior}/hr base)</option>
                  <option value="Mid">Mid (${tierRates.Mid}/hr base)</option>
                  <option value="Senior">Senior (${tierRates.Senior}/hr base)</option>
                  <option value="Management">Management (${tierRates.Management}/hr base)</option>
                  <option value="Executive">Executive (${tierRates.Executive}/hr base)</option>
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={useCustomRate}
                    onChange={(e) => setUseCustomRate(e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0"
                  />
                  <span>Custom hourly base rate for this member</span>
                </label>

                {useCustomRate && (
                  <div className="mt-2">
                    <input
                      type="number"
                      placeholder={`Custom rate (default: $${tierRates[roleTier]})`}
                      value={customRate}
                      onChange={(e) => setCustomRate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-zinc-100 text-zinc-950 font-semibold hover:bg-white"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
