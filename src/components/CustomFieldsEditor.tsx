import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomField {
  id: string;
  name: string;
  value: string;
}

interface CustomFieldsEditorProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  className?: string;
  disabled?: boolean;
}

export function CustomFieldsEditor({
  fields,
  onChange,
  className,
  disabled = false,
}: CustomFieldsEditorProps) {
  const addField = () => {
    const newField: CustomField = {
      id: crypto.randomUUID(),
      name: '',
      value: '',
    };
    onChange([...fields, newField]);
  };

  const updateField = (id: string, key: 'name' | 'value', value: string) => {
    onChange(
      fields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  const removeField = (id: string) => {
    onChange(fields.filter((field) => field.id !== id));
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Custom Fields</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addField}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-2">
          No custom fields added yet
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((field) => (
            <div
              key={field.id}
              className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground mt-2.5 flex-shrink-0" />
              <div className="flex-1 grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Field Name
                  </Label>
                  <Input
                    value={field.name}
                    onChange={(e) => updateField(field.id, 'name', e.target.value)}
                    placeholder="e.g., Tax ID"
                    disabled={disabled}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Field Value
                  </Label>
                  <Input
                    value={field.value}
                    onChange={(e) => updateField(field.id, 'value', e.target.value)}
                    placeholder="Enter value"
                    disabled={disabled}
                    className="h-9"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeField(field.id)}
                disabled={disabled}
                className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
