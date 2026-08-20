// ─── User (convención con prefijo user_, ajustar cuando exista el modelo Prisma) ───
export type MembershipStatus = "active" | "inactive" | "pending" | "expired";
export type MembershipPlan = "basic" | "premium" | "elite" | "day-pass";

export interface User {
  user_id: number;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  user_phone: string;
  user_membership_status: MembershipStatus;
  user_membership_plan: MembershipPlan;
  user_join_date: string;
  user_last_visit: string;
  user_avatar: string | null;
  user_created_at: string;
  user_updated_at: string;
}

export type CreateUserDto = Omit<
  User,
  "user_id" | "user_created_at" | "user_updated_at"
>;

export type UpdateUserDto = Partial<CreateUserDto>;