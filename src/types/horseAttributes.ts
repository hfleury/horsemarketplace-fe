export type HorseAttributeType = 'breed' | 'discipline' | 'gender';

export interface HorseAttributeOption {
  id: string;
  type: HorseAttributeType;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHorseAttributeOptionRequest {
  type: HorseAttributeType;
  value: string;
}
