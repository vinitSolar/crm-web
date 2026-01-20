import { useState } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import {
    GET_EMAIL_TEMPLATES,
    GET_EMAIL_TEMPLATE,
    GET_ALL_EMAIL_SETTINGS,
    UPDATE_EMAIL_SETTING,
    PREVIEW_SYSTEM_TEMPLATE
} from '@/graphql';

import { Modal } from '@/components/common';
import { EyeIcon, MailIcon, RefreshCwIcon, FileTextIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Select, type SelectOption } from '@/components/ui';
import { cn } from '@/lib/utils';

interface EmailTemplate {
    uid: string;
    name: string;
    isActive: boolean;
    isDeleted: boolean;
}

interface AutomatedEvent {
    type: string;
    label: string;
    description: string;
    attachments?: string[];
}

export function EmailSendPage() {
    const { data: settingsData, refetch: refetchSettings, loading: settingsLoading } = useQuery(GET_ALL_EMAIL_SETTINGS);
    const [updateEmailSetting] = useMutation(UPDATE_EMAIL_SETTING);

    // Fetch templates for the dropdown
    const { data: templatesData, loading: templatesLoading } = useQuery(GET_EMAIL_TEMPLATES, {
        variables: { limit: 1000 },
    });

    const [fetchTemplate] = useLazyQuery(GET_EMAIL_TEMPLATE);
    const [fetchSystemTemplate] = useLazyQuery(PREVIEW_SYSTEM_TEMPLATE);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<any>(null);
    const [updatingEvent, setUpdatingEvent] = useState<string | null>(null);

    const allTemplates: EmailTemplate[] = templatesData?.emailTemplates?.data || [];

    const automatedEvents: AutomatedEvent[] = [
        {
            type: 'CUSTOMER_CREATED',
            label: 'Customer Created (Welcome Email)',
            description: 'Sent automatically when a new customer is created in the system',
        },
        {
            type: 'REMINDER',
            label: 'Reminder Email',
            description: 'Sent to customers who haven\'t signed their agreement yet',
        },
        {
            type: 'AGREEMENT_SIGNED',
            label: 'Agreement Signed',
            description: 'Confirmation email sent after customer signs their agreement',
            attachments: [
                'GEE Welcome Pack.pdf',
                'GEE Welcome Offer.pdf',
                'GEE_Direct_Debit_Request.pdf',
                'GEE Terms & Conditions.pdf',
                'GEE Disclosure Statement.pdf',
                'GEE Withdrawal Form.pdf'
            ]
        }
    ];

    const getCurrentTemplateUid = (eventType: string) => {
        const setting = settingsData?.emailSettings?.find((s: any) => s.eventType === eventType);
        return setting?.templateUid || 'DEFAULT';
    };

    const handleSettingChange = async (eventType: string, templateUid: string) => {
        setUpdatingEvent(eventType);
        try {
            await updateEmailSetting({
                variables: {
                    eventType,
                    templateUid: templateUid === 'DEFAULT' ? null : templateUid
                }
            });
            toast.success('Template updated successfully');
            await refetchSettings();
        } catch (error: any) {
            console.error('Failed to update email setting:', error);
            toast.error(error.message || 'Failed to update setting');
        } finally {
            setUpdatingEvent(null);
        }
    };

    const handleViewTemplate = async (templateUid: string, eventType: string) => {
        if (!templateUid) return;

        try {
            if (templateUid === 'DEFAULT') {
                const { data } = await fetchSystemTemplate({ variables: { eventType } });
                if (data?.previewSystemTemplate) {
                    setPreviewTemplate(data.previewSystemTemplate);
                    setPreviewModalOpen(true);
                }
                return;
            }

            const { data } = await fetchTemplate({ variables: { uid: templateUid } });
            if (data?.emailTemplate) {
                setPreviewTemplate(data.emailTemplate);
                setPreviewModalOpen(true);
            }
        } catch (error) {
            console.error('Failed to fetch template:', error);
            toast.error('Failed to load template preview');
        }
    };

    const getTemplateOptions = (): SelectOption[] => [
        { value: 'DEFAULT', label: 'Default (Static Template)' },
        ...allTemplates
            .filter(t => !t.isDeleted && t.isActive)
            .map(t => ({ value: t.uid, label: t.name }))
    ];

    const isLoading = templatesLoading || settingsLoading;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Email Configuration</h1>
                    <p className="text-muted-foreground">Configure automated email triggers and assign templates</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => refetchSettings()}
                    disabled={isLoading}
                    leftIcon={<RefreshCwIcon size={16} className={isLoading ? 'animate-spin' : ''} />}
                >
                    Refresh
                </Button>
            </div>

            {/* Main Content Card */}
            <div className="p-5 bg-background rounded-lg border border-border shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading configuration...</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {automatedEvents.map((event, index) => {
                            const currentTemplateUid = getCurrentTemplateUid(event.type);
                            const isUpdating = updatingEvent === event.type;

                            return (
                                <div
                                    key={event.type}
                                    className={cn(
                                        index !== automatedEvents.length - 1 && "border-b border-border pb-6"
                                    )}
                                >
                                    <div className={cn(
                                        "space-y-3",
                                        isUpdating && "opacity-60 pointer-events-none"
                                    )}>
                                        {/* Event Header */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-foreground">{event.label}</h3>
                                                <p className="text-sm text-muted-foreground">{event.description}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewTemplate(currentTemplateUid, event.type)}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                                <EyeIcon size={14} className="mr-1.5" />
                                                Preview
                                            </Button>
                                        </div>

                                        {/* Template Selector Row */}
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-muted-foreground w-20">Template:</span>
                                            <div className="w-[300px]">
                                                <Select
                                                    options={getTemplateOptions()}
                                                    value={currentTemplateUid}
                                                    onChange={(val) => handleSettingChange(event.type, val as string)}
                                                    placeholder="Select template..."
                                                    containerClassName="w-full"
                                                />
                                            </div>
                                            <span className={cn(
                                                "text-xs px-2 py-1 rounded font-medium",
                                                currentTemplateUid === 'DEFAULT'
                                                    ? "bg-gray-100 text-gray-600"
                                                    : "bg-green-100 text-green-700"
                                            )}>
                                                {currentTemplateUid === 'DEFAULT' ? 'System Default' : 'Custom Template'}
                                            </span>
                                        </div>

                                        {/* Attachments */}
                                        {event.attachments && event.attachments.length > 0 && (
                                            <div className="flex items-start gap-4">
                                                <span className="text-sm text-muted-foreground w-20">Attachments:</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {event.attachments.map((file, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200"
                                                        >
                                                            <FileTextIcon size={12} className="mr-1 text-blue-500" />
                                                            {file}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Template Preview Modal */}
            <Modal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                title="Email Template Preview"
                size="full"
                footer={
                    <Button variant="outline" onClick={() => setPreviewModalOpen(false)}>
                        Close
                    </Button>
                }
            >
                {previewTemplate ? (
                    <div className="flex flex-col rounded-lg overflow-hidden border border-gray-200 bg-white min-h-[400px]">
                        {/* Email Header */}
                        <div className="border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center px-4 py-3">
                                <span className="text-sm text-gray-500 w-20">Subject</span>
                                <div className="flex-1 text-sm text-gray-800 font-medium">
                                    {previewTemplate.subject || '(No subject)'}
                                </div>
                            </div>
                        </div>

                        {/* Email Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            {previewTemplate.body ? (
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: previewTemplate.body }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <div className="text-center">
                                        <MailIcon size={32} className="mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">No email body available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

