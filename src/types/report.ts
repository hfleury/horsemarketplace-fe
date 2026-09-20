export type ReportReason = 'spam' | 'fraud' | 'inappropriate' | 'duplicate' | 'other';

export const REPORT_REASON_OPTIONS: { value: ReportReason; label: string }[] = [
    { value: 'spam', label: 'Spam' },
    { value: 'fraud', label: 'Fraud' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'duplicate', label: 'Duplicate listing' },
    { value: 'other', label: 'Other' },
];

export interface CreateReportRequest {
    product_id: string;
    reason: ReportReason;
    description?: string;
}

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface Report {
    id: string;
    product_id: string;
    reporter_user_id: string;
    reason: ReportReason;
    description: string | null;
    status: ReportStatus;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}
