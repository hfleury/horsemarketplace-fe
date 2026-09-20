import type { ApiResponse } from '../types/api';
import type { CreateReportRequest, Report } from '../types/report';
import { apiFetch } from '../lib/apiClient';

export const reportsApi = {
  submit(data: CreateReportRequest) {
    return apiFetch<ApiResponse<Report>>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
