export type UserRole = "operator" | "coordinator" | "agent" | "admin";

export type RequestStatus =
  | "received"
  | "in_review"
  | "assigned"
  | "in_progress"
  | "delivered"
  | "cancelled"
  | "failed_delivery";

export type RequestSituation = "no_water" | "low_stock" | "preventive";

export type ProductType =
  | "cubic_meter"
  | "container_500l"
  | "container_200l"
  | "container_100l";

export type RequestPriority = "low" | "medium" | "high";

export type EventType =
  | "created"
  | "status_change"
  | "comment"
  | "priority_change"
  | "assignment"
  | "delivery_started"
  | "delivery_completed"
  | "delivery_failed";

export interface User {
  id: string;
  full_name: string;
  phone: string | null;
  email: string;
  agent_code: string | null;
  role: UserRole;
  created_at: string;
}

export interface Request {
  id: string;
  request_number: string;
  full_name: string;
  phone: string;
  district: string;
  address_landmark: string;
  household_size: number;
  situation: RequestSituation;
  has_children: boolean;
  has_elderly: boolean;
  has_sick: boolean;
  comment: string | null;
  product_type?: ProductType;
  quantity?: number;
  price_fcfa?: number;
  estimated_volume_liters: number;
  status: RequestStatus;
  priority: RequestPriority;
  is_urgent: boolean;
  assigned_agent_id: string | null;
  assigned_team: string | null;
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
  assigned_agent?: User | null;
}

export interface RequestEvent {
  id: string;
  request_id: string;
  event_type: EventType;
  old_status: RequestStatus | null;
  new_status: RequestStatus | null;
  comment: string | null;
  created_by: string | null;
  created_at: string;
  created_by_user?: User | null;
}

export interface DeliveryProof {
  id: string;
  request_id: string;
  agent_id: string;
  person_met_name: string;
  comment: string | null;
  photo_url: string | null;
  delivered_at: string;
  agent?: User | null;
}

export interface CreateRequestInput {
  full_name: string;
  phone: string;
  district: string;
  address_landmark: string;
  product_type: ProductType;
  quantity: number;
  comment?: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  assigned: number;
  delivered: number;
  urgent: number;
  byDistrict: { district: string; count: number }[];
}

export type DashboardReportPeriod = "day" | "week" | "month";

export interface DashboardReport {
  period: DashboardReportPeriod;
  periodLabel: string;
  fromDate: string;
  toDate: string;
  total: number;
  pending: number;
  assigned: number;
  delivered: number;
  cancelled: number;
  failed: number;
  urgent: number;
  revenueFcfa: number;
  volumeLiters: number;
  deliveryRate: number;
  avgOrderValue: number;
  byDistrict: { district: string; count: number }[];
  byStatus: { status: RequestStatus; count: number }[];
  byTimeline: { key: string; label: string; count: number; delivered: number }[];
  byProduct: { productType: ProductType; label: string; count: number; revenue: number }[];
}
