import type { ApiResponse } from '../types/api';
import type {
  Conversation,
  CreateConversationRequest,
  ListMessagesResponse,
  Message,
  SendMessageRequest,
} from '../types/messaging';
import { apiFetch } from '../lib/apiClient';

export const messagingApi = {
  createConversation(productId: string) {
    const body: CreateConversationRequest = { product_id: productId };
    return apiFetch<ApiResponse<Conversation>>('/conversations', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  sendMessage(conversationId: string, messageBody: string) {
    const body: SendMessageRequest = { body: messageBody };
    return apiFetch<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  listMessages(conversationId: string, afterId: number, limit: number) {
    return apiFetch<ApiResponse<ListMessagesResponse>>(
      `/conversations/${conversationId}/messages?after_id=${afterId}&limit=${limit}`
    );
  },
};
