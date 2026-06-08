'use client'

import { Plus, X, Trash2 } from 'lucide-react'
import { Button, Input, Label } from '@/app/components/atoms'
import type { IOptionGroupDraft } from '@/app/types/addProduct'

interface OptionGroupsEditorProps {
  optionGroups: IOptionGroupDraft[]
  canAddGroup: boolean
  onAddGroup: () => void
  onRemoveGroup: (id: string) => void
  onRenameGroup: (id: string, name: string) => void
  onAddValue: (id: string) => void
  onUpdateValue: (id: string, valueId: string, value: string) => void
  onRemoveValue: (id: string, valueId: string) => void
}

export function OptionGroupsEditor({
  optionGroups,
  canAddGroup,
  onAddGroup,
  onRemoveGroup,
  onRenameGroup,
  onAddValue,
  onUpdateValue,
  onRemoveValue,
}: OptionGroupsEditorProps) {
  return (
    <div className="space-y-4">
      {optionGroups.map((group) => (
        <div
          key={group.id}
          className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label
                htmlFor={`option-group-name-${group.id}`}
                className="text-xs text-muted-foreground"
              >
                規格類型
              </Label>
              <Input
                id={`option-group-name-${group.id}`}
                placeholder="例：顏色"
                value={group.name}
                maxLength={30}
                onChange={(event) =>
                  onRenameGroup(group.id, event.target.value)
                }
                className="h-9"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveGroup(group.id)}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
              aria-label="刪除規格類型"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">選項值</Label>
            <div className="space-y-2">
              {group.values.map((valueItem) => (
                <div key={valueItem.id} className="flex items-center gap-2">
                  <Input
                    placeholder="例：紅色"
                    value={valueItem.value}
                    onChange={(event) =>
                      onUpdateValue(group.id, valueItem.id, event.target.value)
                    }
                    className="h-9"
                  />
                  {group.values.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveValue(group.id, valueItem.id)}
                      className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                      aria-label="刪除選項值"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddValue(group.id)}
              className="h-8 gap-1 bg-transparent px-3"
            >
              <Plus className="h-4 w-4" />
              新增選項值
            </Button>
          </div>
        </div>
      ))}

      {canAddGroup && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddGroup}
          className="gap-1 bg-transparent"
        >
          <Plus className="h-4 w-4" />
          新增規格類型
        </Button>
      )}
    </div>
  )
}
