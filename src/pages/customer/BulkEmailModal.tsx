import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Modal } from '@/components/common';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { GET_EMAIL_TEMPLATES, GET_EMAIL_TEMPLATE } from '../../graphql/queries/emailTemplates';
import { GET_CUSTOMER_BY_ID } from '../../graphql/queries/customers';
import { SEND_BULK_EMAIL } from '../../graphql/mutations/emailTemplates';
import { toast } from 'react-toastify';

interface BulkEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCustomerIds: string[];
    onSuccess: () => void;
}

interface AttachmentFile {
    name: string;
    size: number;
    type: string;
    file: File;
}

// Function to replace email variables with customer data
const replaceEmailVariables = (content: string, customer: any): string => {
    if (!content || !customer) return content;

    const variableMap: Record<string, string> = {
        '[[FIRST_NAME]]': customer.firstName || '',
        '[[LAST_NAME]]': customer.lastName || '',
        '[[FULL_NAME]]': `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        '[[CUSTOMER_ID]]': customer.customerId || '',
        '[[CUSTOMER_NUMBER]]': customer.number || '',
        '[[CONTACT_NUMBER]]': customer.number || '',
        '[[PROJECT_NO]]': '',
        '[[PROPOSAL_LINK]]': '',
        '[[PRICING]]': '',
        '[[AGREEMENT_DATE]]': customer.signDate || '',
        '[[VERIFICATION_CODE]]': customer.viewCode || '',
        '[[ORG_NAME]]': 'Go Sync',
        '[[SENDER_NAME]]': 'Go Sync',
        '[[SENDER_EMAIL]]': 'info@gosync.com.au',
        '[[RECEIVER_NAME]]': `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        '[[RECEIVER_EMAIL]]': customer.email || '',
    };

    let result = content;
    for (const [variable, value] of Object.entries(variableMap)) {
        result = result.split(variable).join(value);
    }
    return result;
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const BulkEmailModal: React.FC<BulkEmailModalProps> = ({ isOpen, onClose, selectedCustomerIds, onSuccess }) => {
    const [selectedTemplateUid, setSelectedTemplateUid] = useState<string>('');
    const [ccEmails, setCcEmails] = useState<string>('');
    const [bccEmails, setBccEmails] = useState<string>('');
    const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
    const [step, setStep] = useState<'compose' | 'confirm'>('compose');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isSingleCustomer = selectedCustomerIds.length === 1;

    // Fetch Templates
    const { data, loading: loadingTemplates, error: errorTemplates } = useQuery(GET_EMAIL_TEMPLATES, {
        variables: { limit: 100, status: 1 },
        skip: !isOpen,
        fetchPolicy: 'network-only'
    });

    // Fetch Single Template for Preview
    const { data: templateData, loading: loadingTemplate } = useQuery(GET_EMAIL_TEMPLATE, {
        variables: { uid: selectedTemplateUid },
        skip: !selectedTemplateUid,
        fetchPolicy: 'network-only'
    });

    // Fetch Single Customer data for preview (only when 1 customer selected)
    const { data: customerData, loading: loadingCustomer } = useQuery(GET_CUSTOMER_BY_ID, {
        variables: { uid: selectedCustomerIds[0] },
        skip: !isSingleCustomer || !isOpen,
        fetchPolicy: 'network-only'
    });

    const selectedTemplate = templateData?.emailTemplate;
    const previewCustomer = customerData?.customer;

    // Process template content with variable replacement
    const processedSubject = useMemo(() => {
        if (!selectedTemplate?.subject) return '';
        if (isSingleCustomer && previewCustomer) {
            return replaceEmailVariables(selectedTemplate.subject, previewCustomer);
        }
        return selectedTemplate.subject;
    }, [selectedTemplate?.subject, previewCustomer, isSingleCustomer]);

    const processedBody = useMemo(() => {
        if (!selectedTemplate?.body) return '';
        if (isSingleCustomer && previewCustomer) {
            return replaceEmailVariables(selectedTemplate.body, previewCustomer);
        }
        return selectedTemplate.body;
    }, [selectedTemplate?.body, previewCustomer, isSingleCustomer]);

    const [sendBulkEmail, { loading: sending }] = useMutation(SEND_BULK_EMAIL, {
        onCompleted: (data) => {
            if (data.sendBulkEmail.success) {
                toast.success(data.sendBulkEmail.message || 'Emails sent successfully');
                onSuccess();
                onClose();
            } else {
                toast.error(data.sendBulkEmail.message || 'Failed to send emails');
            }
        },
        onError: (err) => {
            console.error(err);
            toast.error(err.message || 'An error occurred while sending emails');
        }
    });

    // Reset selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedTemplateUid('');
            setCcEmails('');
            setBccEmails('');
            setAttachments([]);
            setStep('compose');
        }
    }, [isOpen]);

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const newAttachments: AttachmentFile[] = [];
        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 10MB)`);
                return;
            }
            newAttachments.push({
                name: file.name,
                size: file.size,
                type: file.type,
                file: file
            });
        });
        setAttachments(prev => [...prev, ...newAttachments]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleContinue = () => {
        if (!selectedTemplateUid) {
            toast.error("Please select a template");
            return;
        }
        setStep('confirm');
    };

    const confirmSend = async () => {
        try {
            // Convert attachments to base64
            const attachmentInputs = await Promise.all(attachments.map(async (att) => {
                return new Promise<any>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(att.file);
                    reader.onload = () => {
                        const result = reader.result as string;
                        // Extract base64 part (remove data:application/pdf;base64, prefix)
                        const base64String = result.split(',')[1];
                        resolve({
                            filename: att.name,
                            content: base64String,
                            contentType: att.type
                        });
                    };
                    reader.onerror = error => reject(error);
                });
            }));

            sendBulkEmail({
                variables: {
                    templateUid: selectedTemplateUid,
                    customerUids: selectedCustomerIds,
                    cc: ccEmails || null,
                    bcc: bccEmails || null,
                    attachments: attachmentInputs.length > 0 ? attachmentInputs : null
                }
            });
        } catch (error) {
            console.error("Error preparing attachments:", error);
            toast.error("Failed to process attachments. Please try again.");
        }
    };

    const handleBack = () => {
        setStep('compose');
    };

    const templates = data?.emailTemplates?.data || [];
    const options = templates.map((t: any) => ({ value: t.uid, label: t.name }));

    const isPreviewLoading = loadingTemplate || (isSingleCustomer && loadingCustomer);

    // Parse CC/BCC emails for preview
    const ccList = ccEmails.split(',').map(e => e.trim()).filter(Boolean);
    const bccList = bccEmails.split(',').map(e => e.trim()).filter(Boolean);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={step === 'compose' ? "Send Bulk Email" : "Confirm Send"}
            size="full"
            footer={
                step === 'compose' ? (
                    <>
                        <Button variant="ghost" onClick={onClose} disabled={sending}>Cancel</Button>
                        <Button
                            onClick={handleContinue}
                            disabled={!selectedTemplateUid || sending}
                        >
                            Continue
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" onClick={handleBack} disabled={sending}>Back</Button>
                        <Button
                            onClick={confirmSend}
                            isLoading={sending}
                            loadingText="Sending..."
                        >
                            Send Email ({selectedCustomerIds.length})
                        </Button>
                    </>
                )
            }
        >
            {step === 'compose' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Form */}
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Select an email template to send to the <strong>{selectedCustomerIds.length}</strong> selected customers.
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Template <span className="text-red-500">*</span></label>
                            <Select
                                options={options}
                                value={selectedTemplateUid}
                                onChange={(val: any) => setSelectedTemplateUid(val as string)}
                                placeholder="Select a template..."
                                disabled={loadingTemplates || sending}
                                className="w-full"
                            />
                            {loadingTemplates && <p className="text-xs text-gray-500">Loading templates...</p>}
                            {errorTemplates && <p className="text-xs text-red-500">Failed to load templates. Please try again.</p>}
                        </div>

                        {/* CC Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground dark:text-gray-200">CC</label>
                            <input
                                type="text"
                                value={ccEmails}
                                onChange={(e) => setCcEmails(e.target.value)}
                                placeholder="email1@example.com, email2@example.com"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                disabled={sending}
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500">Separate multiple emails with commas</p>
                        </div>

                        {/* BCC Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground dark:text-gray-200">BCC</label>
                            <input
                                type="text"
                                value={bccEmails}
                                onChange={(e) => setBccEmails(e.target.value)}
                                placeholder="email1@example.com, email2@example.com"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                disabled={sending}
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500">Hidden recipients</p>
                        </div>

                        {/* Attachments Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground dark:text-gray-200">Attachments</label>
                            <div
                                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-900/50"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleFileSelect(e.dataTransfer.files);
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e.target.files)}
                                    disabled={sending}
                                />
                                <svg className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Click or drag files to attach</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 10MB per file</p>
                            </div>

                            {/* Attachment List */}
                            {attachments.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    {attachments.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-transparent dark:border-gray-700">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">({formatFileSize(file.size)})</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                disabled={sending}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg text-xs text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                            <p className="flex items-start gap-2">
                                <span className="text-amber-500 dark:text-amber-400 mt-0.5">ℹ️</span>
                                <span>Variables in the template will be replaced with each customer's details (e.g. <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded">{"[[FIRST_NAME]]"}</code>).</span>
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Preview */}
                    <div className="flex flex-col h-full">
                        {!selectedTemplateUid ? (
                            <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center min-h-[400px] bg-white dark:bg-gray-950">
                                <div className="text-center text-gray-400 dark:text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Select a template to preview</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                                {/* Form-style Header */}
                                <div className="border-b border-gray-200 dark:border-gray-800">
                                    {/* To Field */}
                                    <div className="flex items-center px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 w-16">To</span>
                                        <div className="flex-1 text-sm text-gray-800 dark:text-gray-200">
                                            {isPreviewLoading ? (
                                                <span className="animate-pulse bg-muted rounded h-4 w-48 inline-block"></span>
                                            ) : isSingleCustomer && previewCustomer ? (
                                                <span>{previewCustomer.firstName} {previewCustomer.lastName} &lt;{previewCustomer.email}&gt;</span>
                                            ) : (
                                                <span>{selectedCustomerIds.length} selected customers</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* CC Field - only show if has values */}
                                    {ccList.length > 0 && (
                                        <div className="flex items-center px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                                            <span className="text-sm text-gray-500 dark:text-gray-400 w-16">Cc</span>
                                            <div className="flex-1 flex flex-wrap gap-1">
                                                {ccList.map((email, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                                                        {email}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* BCC Field - only show if has values */}
                                    {bccList.length > 0 && (
                                        <div className="flex items-center px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                                            <span className="text-sm text-gray-500 dark:text-gray-400 w-16">Bcc</span>
                                            <div className="flex-1 flex flex-wrap gap-1">
                                                {bccList.map((email, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                                        {email}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Subject Field */}
                                    <div className="flex items-center px-4 py-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 w-16">Subject</span>
                                        <div className="flex-1 text-sm text-gray-800 dark:text-gray-200 font-medium">
                                            {isPreviewLoading ? (
                                                <span className="animate-pulse bg-muted rounded h-4 w-64 inline-block"></span>
                                            ) : (
                                                <span>{processedSubject || '(No subject)'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Attachments Preview - only show if has attachments */}
                                {attachments.length > 0 && (
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{attachments.length} attachment{attachments.length > 1 ? 's' : ''}:</span>
                                            {attachments.map((file, i) => (
                                                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded">
                                                    <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    {file.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Email Body */}
                                <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-950">
                                    {isPreviewLoading ? (
                                        <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 dark:border-gray-600 border-t-indigo-500 dark:border-t-indigo-400 mr-3"></div>
                                            <span className="text-sm">Loading preview...</span>
                                        </div>
                                    ) : (
                                        <div
                                            className="prose dark:prose-invert prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: processedBody }}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Confirmation Step - Two Column Layout */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Summary */}
                    <div className="flex flex-col">
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl p-6 mb-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-7 h-7 text-primary dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ready to Send?</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Sending to <span className="font-semibold text-primary dark:text-primary-400">{selectedCustomerIds.length}</span> customer{selectedCustomerIds.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Please review the details below before sending. This action cannot be undone.
                            </p>
                        </div>

                        {/* Summary Details */}
                        <div className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4 flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Email Details</h4>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">Template</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{selectedTemplate?.name || '—'}</span>
                                </div>
                                <div className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">Subject</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedTemplate?.subject || '—'}</span>
                                </div>
                                <div className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">Recipients</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {selectedCustomerIds.length} customer{selectedCustomerIds.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                {ccEmails && (
                                    <div className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">CC</span>
                                        <div className="flex flex-wrap gap-1">
                                            {ccList.map((email, i) => (
                                                <span key={i} className="inline-flex px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                                                    {email}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {bccEmails && (
                                    <div className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">BCC</span>
                                        <div className="flex flex-wrap gap-1">
                                            {bccList.map((email, i) => (
                                                <span key={i} className="inline-flex px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                                    {email}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {attachments.length > 0 && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">Attachments</span>
                                        <div className="flex flex-wrap gap-2">
                                            {attachments.map((file, i) => (
                                                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded">
                                                    <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    {file.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Email Preview */}
                    <div className="flex flex-col">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">Email Preview</div>
                        <div className="flex-1 flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 min-h-[400px]">
                            {/* Form-style Header */}
                            <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                                <div className="flex items-center px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 w-16">To</span>
                                    <div className="flex-1 text-sm text-gray-800 dark:text-gray-200">
                                        {isSingleCustomer && previewCustomer ? (
                                            <span>{previewCustomer.firstName} {previewCustomer.lastName} &lt;{previewCustomer.email}&gt;</span>
                                        ) : (
                                            <span className="text-gray-500 dark:text-gray-400">{selectedCustomerIds.length} recipients</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center px-4 py-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 w-16">Subject</span>
                                    <div className="flex-1 text-sm text-gray-800 dark:text-gray-200 font-medium">
                                        {processedSubject || '(No subject)'}
                                    </div>
                                </div>
                            </div>

                            {/* Email Body */}
                            <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-950">
                                <div
                                    className="prose dark:prose-invert prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: processedBody }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default BulkEmailModal;
