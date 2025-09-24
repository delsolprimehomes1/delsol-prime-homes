// n8n and Go High Level Integration Utilities
import { supabase } from '@/integrations/supabase/client';

export interface WebhookIntegration {
  id: string;
  name: string;
  webhook_url: string;
  integration_type: 'n8n' | 'ghl' | 'zapier' | 'custom';
  is_active: boolean;
  configuration: Record<string, any>;
}

export interface AppointmentBookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
  source: string;
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  clusterTitle?: string;
  questionTitle?: string;
}

export interface ConversationData {
  leadId: string;
  conversationLog: Array<{
    message: string;
    sender: 'user' | 'ai';
    timestamp: string;
    intent?: string;
  }>;
  stage: string;
  completedAt?: string;
}

/**
 * Integration Manager for n8n and GHL webhooks
 */
export class IntegrationManager {
  /**
   * Get active webhook integrations
   */
  static async getActiveIntegrations(): Promise<WebhookIntegration[]> {
    try {
      const { data, error } = await supabase
        .from('webhook_integrations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []) as WebhookIntegration[];
    } catch (error) {
      console.error('Error fetching integrations:', error);
      return [];
    }
  }

  /**
   * Trigger appointment booking workflow
   */
  static async triggerAppointmentBooking(
    bookingData: AppointmentBookingData
  ): Promise<{ success: boolean; message: string; webhooksTriggered: number }> {
    try {
      const integrations = await this.getActiveIntegrations();
      const appointmentIntegrations = integrations.filter(
        i => i.integration_type === 'n8n' || i.integration_type === 'ghl'
      );

      if (appointmentIntegrations.length === 0) {
        return {
          success: false,
          message: 'No active appointment booking integrations found',
          webhooksTriggered: 0
        };
      }

      let successCount = 0;
      const errors: string[] = [];

      // Trigger all active appointment booking webhooks
      for (const integration of appointmentIntegrations) {
        try {
          const payload = this.formatAppointmentPayload(bookingData, integration);
          
          const response = await fetch(integration.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            successCount++;
            console.log(`Successfully triggered ${integration.name} webhook`);
          } else {
            errors.push(`${integration.name}: ${response.statusText}`);
          }
        } catch (error) {
          errors.push(`${integration.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: successCount > 0,
        message: successCount > 0 
          ? `Successfully triggered ${successCount} webhook(s)${errors.length > 0 ? ` (${errors.length} failed)` : ''}` 
          : `All webhooks failed: ${errors.join(', ')}`,
        webhooksTriggered: successCount
      };
    } catch (error) {
      console.error('Error triggering appointment booking:', error);
      return {
        success: false,
        message: 'Failed to trigger appointment booking',
        webhooksTriggered: 0
      };
    }
  }

  /**
   * Trigger conversation completion workflow
   */
  static async triggerConversationComplete(
    conversationData: ConversationData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const integrations = await this.getActiveIntegrations();
      const conversationIntegrations = integrations.filter(
        i => i.configuration?.triggers?.includes('conversation_complete')
      );

      if (conversationIntegrations.length === 0) {
        return {
          success: true,
          message: 'No conversation completion integrations configured'
        };
      }

      const payload = {
        event: 'conversation_complete',
        timestamp: new Date().toISOString(),
        data: conversationData,
        source: 'delsolprimehomes_qa_chatbot'
      };

      let successCount = 0;
      for (const integration of conversationIntegrations) {
        try {
          const response = await fetch(integration.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            successCount++;
          }
        } catch (error) {
          console.error(`Error triggering ${integration.name}:`, error);
        }
      }

      return {
        success: successCount > 0,
        message: `Triggered ${successCount} conversation completion webhook(s)`
      };
    } catch (error) {
      console.error('Error triggering conversation complete:', error);
      return {
        success: false,
        message: 'Failed to trigger conversation completion'
      };
    }
  }

  /**
   * Format appointment data for different integration types
   */
  private static formatAppointmentPayload(
    bookingData: AppointmentBookingData,
    integration: WebhookIntegration
  ): any {
    const basePayload = {
      event: 'appointment_booking_request',
      timestamp: new Date().toISOString(),
      source: 'delsolprimehomes_qa_system',
      data: bookingData
    };

    switch (integration.integration_type) {
      case 'n8n':
        return {
          ...basePayload,
          workflow: 'appointment_booking',
          trigger: 'qa_bofu_completion'
        };

      case 'ghl':
        return {
          ...basePayload,
          contact: {
            firstName: bookingData.firstName,
            lastName: bookingData.lastName,
            email: bookingData.email,
            phone: bookingData.phone,
            source: bookingData.source,
            customFields: {
              funnelStage: bookingData.funnelStage,
              clusterTitle: bookingData.clusterTitle,
              questionTitle: bookingData.questionTitle,
              preferredDate: bookingData.preferredDate,
              preferredTime: bookingData.preferredTime
            }
          },
          appointment: {
            type: 'consultation',
            duration: 30,
            preferredDate: bookingData.preferredDate,
            preferredTime: bookingData.preferredTime,
            notes: bookingData.message
          }
        };

      default:
        return basePayload;
    }
  }

  /**
   * Create or update webhook integration
   */
  static async saveIntegration(
    integration: Omit<WebhookIntegration, 'id'>
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('webhook_integrations')
        .insert([integration])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error saving integration:', error);
      return null;
    }
  }

  /**
   * Test webhook integration
   */
  static async testIntegration(integrationId: string): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    try {
      const { data: integration, error } = await supabase
        .from('webhook_integrations')
        .select('*')
        .eq('id', integrationId)
        .single();

      if (error) throw error;

      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        source: 'delsolprimehomes_integration_test',
        data: {
          message: 'This is a test webhook call'
        }
      };

      const startTime = Date.now();
      const response = await fetch(integration.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });
      const responseTime = Date.now() - startTime;

      return {
        success: response.ok,
        message: response.ok 
          ? `Test successful (${response.status} ${response.statusText})` 
          : `Test failed (${response.status} ${response.statusText})`,
        responseTime
      };
    } catch (error) {
      console.error('Error testing integration:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

/**
 * Hook for using integration manager in React components
 */
export const useIntegrationManager = () => {
  return {
    getActiveIntegrations: IntegrationManager.getActiveIntegrations,
    triggerAppointmentBooking: IntegrationManager.triggerAppointmentBooking,
    triggerConversationComplete: IntegrationManager.triggerConversationComplete,
    saveIntegration: IntegrationManager.saveIntegration,
    testIntegration: IntegrationManager.testIntegration
  };
};