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

import { DataTable, type Column, Modal } from '@/components/common';
import { EyeIcon, MailIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Select, type SelectOption } from '@/components/ui';

interface EmailTemplate {
    uid: string;
    name: string;
    isActive: boolean;
    isDeleted: boolean;
}

interface AutomatedEvent {
    type: string;
    label: string;
    attachments?: string[];
}

export function EmailSendPage() {
    const { data: settingsData, refetch: refetchSettings } = useQuery(GET_ALL_EMAIL_SETTINGS);
    const [updateEmailSetting] = useMutation(UPDATE_EMAIL_SETTING);

    // Fetch templates for the dropdown
    const { data: templatesData, loading: templatesLoading } = useQuery(GET_EMAIL_TEMPLATES, {
        variables: { limit: 1000 },
    });

    const [fetchTemplate] = useLazyQuery(GET_EMAIL_TEMPLATE);
    const [fetchSystemTemplate] = useLazyQuery(PREVIEW_SYSTEM_TEMPLATE);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<any>(null);

    const allTemplates: EmailTemplate[] = templatesData?.emailTemplates?.data || [];

    const automatedEvents: AutomatedEvent[] = [
        { type: 'CUSTOMER_CREATED', label: 'Customer Created (Welcome Email)' },
        { type: 'REMINDER', label: 'Reminder Email' },
        {
            type: 'AGREEMENT_SIGNED',
            label: 'Agreement Signed',
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
        try {
            await updateEmailSetting({
                variables: {
                    eventType,
                    templateUid: templateUid === 'DEFAULT' ? null : templateUid
                }
            });
            toast.success('Settings updated successfully');
            await refetchSettings();
        } catch (error: any) {
            console.error('Failed to update email setting:', error);
            toast.error(error.message || 'Failed to update setting');
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

    const columns: Column<AutomatedEvent>[] = [
        {
            key: 'label',
            header: 'Event Name',
            width: 'w-[45%]',
            render: (event) => (
                <div className="flex flex-col gap-1.5">
                    <span className="font-medium text-foreground">{event.label}</span>
                    {event.attachments && event.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {event.attachments.map((file, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    {file}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'template',
            header: 'Template',
            width: 'w-[45%]',
            render: (event) => {
                const options: SelectOption[] = [
                    { value: 'DEFAULT', label: 'Default (Static Template)' },
                    ...allTemplates
                        .filter(t => !t.isDeleted && t.isActive)
                        .map(t => ({ value: t.uid, label: t.name }))
                ];

                return (
                    <div className="w-[300px]">
                        <Select
                            options={options}
                            value={getCurrentTemplateUid(event.type)}
                            onChange={(val) => handleSettingChange(event.type, val as string)}
                            placeholder="Select template..."
                            className="w-full"
                        />
                    </div>
                );
            }
        },
        {
            key: 'actions',
            header: 'Actions',
            width: 'w-[10%]',
            render: (event) => {
                const currentUid = getCurrentTemplateUid(event.type);

                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTemplate(currentUid, event.type)}
                        className={`h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50`}
                        title="Preview template"
                    >
                        <EyeIcon size={14} className="mr-1.5" />
                        View
                    </Button>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Email Configuration</h1>
                    <p className="text-muted-foreground">Manage automated email triggers and templates</p>
                </div>
            </div>

            <div className="p-5 bg-background rounded-lg border border-border shadow-sm">
                <DataTable
                    columns={columns}
                    data={automatedEvents}
                    rowKey={(event) => event.type}
                    loading={templatesLoading}
                    emptyMessage="No automated events configured."
                />
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
                            <div className="flex items-center px-4 py-2">
                                <span className="text-sm text-gray-500 w-16">Subject</span>
                                <div className="flex-1 text-sm text-gray-800 font-medium">
                                    {previewTemplate.subject || '(No subject)'}
                                </div>
                            </div>
                        </div>

                        {/* Email Body */}
                        <div className="flex-1 overflow-y-auto p-4 bg-white">
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
