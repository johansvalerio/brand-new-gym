

// ─── Equipment (convención con prefijo equipment_, ajustar cuando exista el modelo Prisma) ───
export type EquipmentStatus = "available" | "in-use" | "maintenance" | "out-of-order";

export interface Equipment {
  equipment_id: number;
  equipment_name: string;
  equipment_category: string;
  equipment_status: EquipmentStatus;
  equipment_last_maintenance: string;
  equipment_next_maintenance: string;
  equipment_image: string | null;
  equipment_created_at: string;
  equipment_updated_at: string;
}

export type CreateEquipmentDto = Omit<
  Equipment,
  "equipment_id" | "equipment_created_at" | "equipment_updated_at"
>;

export type UpdateEquipmentDto = Partial<CreateEquipmentDto>;

// ─── Coach (convención con prefijo coach_, ajustar cuando exista el modelo Prisma) ───
export type CoachSpecialty =
  | "strength"
  | "hypertrophy"
  | "powerlifting"
  | "conditioning"
  | "crossfit"
  | "yoga"
  | "nutrition";

export interface Coach {
  coach_id: number;
  coach_name: string;
  coach_specialty: CoachSpecialty;
  coach_email: string;
  coach_phone: string;
  coach_active_clients: number;
  coach_rating: number;
  coach_image: string | null;
  coach_created_at: string;
  coach_updated_at: string;
}

export type CreateCoachDto = Omit<
  Coach,
  "coach_id" | "coach_created_at" | "coach_updated_at"
>;

export type UpdateCoachDto = Partial<CreateCoachDto>;

// ─── Dashboard Stats ───
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  revenueThisMonth: number;
  productsInStock: number;
  lowStockProducts: number;
  equipmentInUse: number;
  equipmentMaintenance: number;
  activeCoaches: number;
  totalCoaches: number;
}

// ─── API Response ───
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}