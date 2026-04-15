'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';

export interface AudienceFilter {
  audiences: string[];
  includeSubAudiences: boolean;
}

interface Audience {
  id: string;
  name: string;
  slug: string;
  count: number;
  color?: string;
}

interface AudienceFilterProps {
  audiences: Audience[];
  selectedAudiences: string[];
  onChange: (audiences: string[]) => void;
  mode?: 'single' | 'multi';
  className?: string;
}

export function AudienceFilter({
  audiences,
  selectedAudiences,
  onChange,
  mode = 'multi',
  className,
}: AudienceFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const displayedAudiences = showAll ? audiences : audiences.slice(0, 6);
  const selectedAudienceData = audiences.filter((a) => selectedAudiences.includes(a.id));

  const toggleAudience = (audienceId: string) => {
    if (mode === 'single') {
      onChange([audienceId]);
    } else {
      if (selectedAudiences.includes(audienceId)) {
        onChange(selectedAudiences.filter((id) => id !== audienceId));
      } else {
        onChange([...selectedAudiences, audienceId]);
      }
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-neutral-500" />
        <span className="text-sm font-medium text-neutral-600">Audience:</span>

        {selectedAudiences.length === 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-1"
          >
            <Filter className="h-3 w-3" />
            Toutes
            <ChevronDown className="h-3 w-3" />
          </Button>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedAudienceData.map((audience) => (
              <Badge
                key={audience.id}
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => toggleAudience(audience.id)}
              >
                {audience.name}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Tout effacer
            </Button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mt-2 rounded-lg border bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">
              {mode === 'single' ? 'Sélectionner une audience' : 'Sélectionner les audiences'}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
              Fermer
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {displayedAudiences.map((audience) => (
              <label
                key={audience.id}
                className="flex items-center gap-3 rounded p-2 hover:bg-neutral-50 cursor-pointer"
              >
                {mode === 'multi' && (
                  <Checkbox
                    checked={selectedAudiences.includes(audience.id)}
                    onCheckedChange={() => toggleAudience(audience.id)}
                  />
                )}
                <div className="flex-1">
                  <span className="font-medium">{audience.name}</span>
                  <span className="ml-2 text-sm text-neutral-500">
                    ({audience.count})
                  </span>
                </div>
                {audience.color && (
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: audience.color }}
                  />
                )}
              </label>
            ))}
          </div>

          {audiences.length > 6 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Voir moins' : `Voir les ${audiences.length - 6} autres`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface AudienceBadgeProps {
  audience: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'secondary' | 'outline';
  showIcon?: boolean;
  className?: string;
}

const audienceColors: Record<string, { bg: string; text: string; border: string }> = {
  'Entreprises': { bg: 'bg-primary-100', text: 'text-primary-700', border: 'border-primary-200' },
  'DPO': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  'Développeurs': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'DSI': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'RSSI': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'ONG': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Gouvernements': { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200' },
  'Particuliers': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'Grand public': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
};

export function AudienceBadge({
  audience,
  size = 'default',
  variant = 'secondary',
  showIcon = false,
  className,
}: AudienceBadgeProps) {
  const colors = audienceColors[audience] || {
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    border: 'border-neutral-200',
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    default: 'text-sm px-2 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  if (variant === 'outline') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border ${colors.border} ${sizeClasses[size]} font-medium ${className || ''}`}
      >
        {showIcon && <Users className="h-3 w-3" />}
        {audience}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${colors.bg} ${colors.text} ${sizeClasses[size]} ${className || ''}`}
    >
      {showIcon && <Users className="h-3 w-3" />}
      {audience}
    </span>
  );
}

interface AudienceSelectorProps {
  value: string[];
  onChange: (audiences: string[]) => void;
  className?: string;
}

const predefinedAudiences = [
  'Entreprises',
  'Particuliers',
  'Grand public',
  'DPO',
  'RSSI',
  'DSI',
  'Développeurs',
  'ONG',
  'Gouvernements',
  'Finance',
  'Tech',
  'Cadres',
  'Startups',
];

export function AudienceSelector({
  value,
  onChange,
  className,
}: AudienceSelectorProps) {
  const toggleAudience = (audience: string) => {
    if (value.includes(audience)) {
      onChange(value.filter((a) => a !== audience));
    } else {
      onChange([...value, audience]);
    }
  };

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium">Audience</label>
      <div className="flex flex-wrap gap-2">
        {predefinedAudiences.map((audience) => (
          <Badge
            key={audience}
            variant={value.includes(audience) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleAudience(audience)}
          >
            {audience}
          </Badge>
        ))}
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Sélectionnez les audiences cibles pour ce contenu
      </p>
    </div>
  );
}
