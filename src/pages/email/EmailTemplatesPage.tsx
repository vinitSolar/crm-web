import { useState, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import logo from '@/assets/main-logo-dark-1.png';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Tooltip } from '@/components/ui/Tooltip';
import { HtmlEditor } from '@/components/ui/HtmlEditor';
import { DataTable, type Column, Modal, StatusField } from '@/components/common';
import { PlusIcon, PencilIcon, TrashIcon, RefreshCwIcon, FileTextIcon } from '@/components/icons';
import {
    GET_EMAIL_TEMPLATES,
    GET_EMAIL_TEMPLATE,
    CREATE_EMAIL_TEMPLATE,
    UPDATE_EMAIL_TEMPLATE,
    SOFT_DELETE_EMAIL_TEMPLATE,
    RESTORE_EMAIL_TEMPLATE
} from '@/graphql';
import { formatDateTime, getUserTimezone } from '@/lib/date';
import { EMAIL_VARIABLES } from '@/lib/email-variables';
import { useAuthStore } from '@/stores/useAuthStore';

// Types
interface EmailTemplate {
    id: string; // or number, but GraphQL usually returns IDs as strings
    uid: string;
    name: string;
    entityType: number; // 1 = Project
    subject: string;
    body?: string;
    status: number;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

interface EmailTemplatesResponse {
    emailTemplates: {
        meta: {
            totalRecords: number;
            currentPage: number;
            totalPages: number;
            recordsPerPage: number;
        };
        data: EmailTemplate[];
    };
}

const ENTITY_TYPES = [
    { value: 1, label: 'Project' },
    // Add more types as they become available
];

// Default Email Footer
const DEFAULT_EMAIL_FOOTER = `
<br>
<br>
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
    <p style="color: #5c8a14; font-weight: bold; font-size: 16px; margin: 0 0 10px 0;">GEE Energy</p>
    
    <div style="margin-bottom: 10px;">
        <img src="${logo}" alt="GEE Energy" style="height: 25px;" />
    </div>

    <p style="margin: 0 0 2px 0;">
        <a href="mailto:noreply@gee.com.au" style="color: #0000EE; text-decoration: underline;">noreply@gee.com.au</a>
    </p>
    
    <p style="margin: 0 0 2px 0;">(P) 1300 707 042 / (M)</p>
    
    <p style="margin: 0 0 2px 0;">PO Box 567, South Melbourne, Victoria 3205</p>
    
    <p style="margin: 0 0 15px 0;">
        <a href="https://www.gee.com.au" style="color: #0000EE; text-decoration: underline;">www.gee.com.au</a>
    </p>
    
    <p style="color: #999; font-size: 10px; line-height: 1.3;">
        The content of this email is confidential and intended for the recipient specified in message only. It is strictly forbidden to share any part of this message with any third party, without a written consent of the sender. If you received this message by mistake, please reply to this message and follow with its deletion, so that we can ensure such a mistake does not occur in the future.
    </p>
</div>
`;

export function EmailTemplatesPage() {
    // Permissions
    // Assuming 'email_templates' is the menu code
    const canCreate = useAuthStore((state) => state.canCreateInMenu('email_templates'));
    const canEdit = useAuthStore((state) => state.canEditInMenu('email_templates'));
    const canDelete = useAuthStore((state) => state.canDeleteInMenu('email_templates'));

    const isNameMatch = (input: string, actual: string) => {
        const clean = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');
        return clean(input) === clean(actual);
    };

    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Modal States
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

    const initialFormState = {
        name: '',
        entityType: 1,
        subject: '',
        body: DEFAULT_EMAIL_FOOTER,
        isActive: true
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingBody, setIsLoadingBody] = useState(false);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Restore Modal State
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [templateToRestore, setTemplateToRestore] = useState<EmailTemplate | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    const limit = 20;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearch !== searchQuery) {
                setAllTemplates([]);
                setPage(1);
                setDebouncedSearch(searchQuery);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, debouncedSearch]);

    // Query
    const { data, loading, error, refetch } = useQuery<EmailTemplatesResponse>(GET_EMAIL_TEMPLATES, {
        variables: {
            page,
            limit,
            // Pass filters if API supports them, otherwise client-side filtering shown below
            // status: statusFilter === 'ACTIVE' ? 1 : (statusFilter === 'INACTIVE' ? 0 : undefined),
        },
        fetchPolicy: 'network-only',
    });

    // Mutations
    const [createTemplate] = useMutation(CREATE_EMAIL_TEMPLATE);
    const [updateTemplate] = useMutation(UPDATE_EMAIL_TEMPLATE);
    const [softDeleteTemplate] = useMutation(SOFT_DELETE_EMAIL_TEMPLATE);
    const [restoreTemplate] = useMutation(RESTORE_EMAIL_TEMPLATE);
    const [fetchTemplate] = useLazyQuery(GET_EMAIL_TEMPLATE);

    const meta = data?.emailTemplates?.meta;
    const hasMore = meta ? page < meta.totalPages : false;

    // Update allTemplates
    useEffect(() => {
        if (data?.emailTemplates?.data) {
            let fetchedTemplates = data.emailTemplates.data;

            if (page === 1) {
                setAllTemplates(fetchedTemplates);
            } else {
                setAllTemplates(prev => {
                    const existingUids = new Set(prev.map(t => t.uid));
                    const newTemplates = fetchedTemplates.filter(t => !existingUids.has(t.uid));
                    return [...prev, ...newTemplates];
                });
            }
            setIsLoadingMore(false);
        }
    }, [data, page]);

    // Handle Client-Side Search & Filtering
    const displayedTemplates = allTemplates.filter(template => {
        const matchesSearch = !debouncedSearch ||
            template.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            template.subject.toLowerCase().includes(debouncedSearch.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === 'ACTIVE') {
            matchesStatus = !template.isDeleted && template.isActive;
        } else if (statusFilter === 'INACTIVE') {
            matchesStatus = !template.isDeleted && !template.isActive;
        }

        return matchesSearch && matchesStatus;
    });

    const handleLoadMore = () => {
        setIsLoadingMore(true);
        setPage(prev => prev + 1);
    };

    // Form Handling
    const handleAdd = () => {
        setModalMode('create');
        setEditingTemplate(null);
        setFormData(initialFormState);
        setErrors({});
        setModalOpen(true);
    };

    const handleEdit = async (template: EmailTemplate) => {
        setModalMode('edit');
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            entityType: template.entityType || 1,
            subject: template.subject,
            body: template.body || '',
            isActive: template.isActive
        });
        setErrors({});
        setModalOpen(true);
        setIsLoadingBody(true);

        // Fetch full details (specifically body)
        try {
            const { data } = await fetchTemplate({ variables: { uid: template.uid } });
            if (data?.emailTemplate) {
                setFormData(prev => ({
                    ...prev,
                    body: data.emailTemplate.body || ''
                }));
            }
        } catch (error) {
            console.error('Failed to fetch template details:', error);
            toast.error('Failed to load template body');
        } finally {
            setIsLoadingBody(false);
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Template name is required';
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.body.trim()) newErrors.body = 'Body content is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const input = {
                name: formData.name,
                entityType: Number(formData.entityType),
                subject: formData.subject,
                body: formData.body,
                isActive: formData.isActive
            };

            if (modalMode === 'create') {
                const { data } = await createTemplate({
                    variables: { input }
                });
                if (data?.createEmailTemplate) {
                    toast.success(data.createEmailTemplate.message || 'Template created successfully');
                }
            } else {
                if (!editingTemplate) return;
                const { data } = await updateTemplate({
                    variables: {
                        uid: editingTemplate.uid,
                        input
                    }
                });
                if (data?.updateEmailTemplate) {
                    toast.success(data.updateEmailTemplate.message || 'Template updated successfully');
                }
            }
            setModalOpen(false);
            await refetch();
        } catch (err: any) {
            console.error('Failed to save template:', err);
            toast.error(err.message || 'Failed to save template');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Status Toggle
    const handleStatusToggle = async (template: EmailTemplate, isActive: boolean) => {
        try {
            const { data } = await updateTemplate({
                variables: {
                    uid: template.uid,
                    input: { isActive }
                }
            });

            if (data?.updateEmailTemplate) {
                toast.success(data.updateEmailTemplate.message || 'Status updated successfully');
                // Optimistic update
                setAllTemplates(prev => prev.map(t => t.uid === template.uid ? { ...t, isActive } : t));
            }
        } catch (err: any) {
            console.error('Failed to update status:', err);
            toast.error(err.message || 'Failed to update status');
        }
    };

    // Delete Handling
    const handleDeleteClick = (template: EmailTemplate) => {
        setTemplateToDelete(template);
        setDeleteConfirmName('');
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!templateToDelete || !isNameMatch(deleteConfirmName, templateToDelete.name)) return;

        setIsDeleting(true);
        try {
            await softDeleteTemplate({ variables: { uid: templateToDelete.uid } });
            toast.success('Template deleted successfully');
            setDeleteModalOpen(false);
            setTemplateToDelete(null);

            // Optimistically update
            setAllTemplates(prev => prev.map(t => t.uid === templateToDelete.uid ? { ...t, isDeleted: true } : t));

        } catch (err: any) {
            console.error('Failed to delete template:', err);
            toast.error(err.message || 'Failed to delete template');
        } finally {
            setIsDeleting(false);
        }
    };

    // Restore Handling
    const handleRestoreClick = (template: EmailTemplate) => {
        setTemplateToRestore(template);
        setRestoreModalOpen(true);
    };

    const handleConfirmRestore = async () => {
        if (!templateToRestore) return;
        setIsRestoring(true);
        try {
            await restoreTemplate({ variables: { uid: templateToRestore.uid } });
            toast.success('Template restored successfully');
            setRestoreModalOpen(false);
            setTemplateToRestore(null);

            // Optimistically update
            setAllTemplates(prev => prev.map(t => t.uid === templateToRestore.uid ? { ...t, isDeleted: false } : t));

        } catch (err: any) {
            console.error('Failed to restore template:', err);
            toast.error(err.message || 'Failed to restore template');
        } finally {
            setIsRestoring(false);
        }
    };

    const columns: Column<EmailTemplate>[] = [
        ...((canEdit || canDelete) ? [{
            key: 'actions',
            header: 'Actions',
            width: 'w-[100px]',
            render: (template: EmailTemplate) => (
                <div className="flex items-center gap-2">
                    {template.isDeleted ? (
                        canEdit && (
                            <Tooltip content="Restore Template">
                                <button
                                    className="p-2 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors"
                                    onClick={() => handleRestoreClick(template)}
                                >
                                    <RefreshCwIcon size={16} />
                                </button>
                            </Tooltip>
                        )
                    ) : (
                        <>
                            {canEdit && (
                                <Tooltip content="Edit Template">
                                    <button
                                        className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
                                        onClick={() => handleEdit(template)}
                                    >
                                        <PencilIcon size={16} />
                                    </button>
                                </Tooltip>
                            )}
                            {canDelete && (
                                <Tooltip content="Delete Template">
                                    <button
                                        className="p-2 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                                        onClick={() => handleDeleteClick(template)}
                                    >
                                        <TrashIcon size={16} />
                                    </button>
                                </Tooltip>
                            )}
                        </>
                    )}
                </div>
            )
        }] : []),
        {
            key: 'name',
            header: 'Name',
            width: 'w-[200px]',
            render: (t) => (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.subject}</span>
                </div>
            )
        },
        {
            key: 'entityType',
            header: 'Type',
            width: 'w-[120px]',
            render: (t) => {
                const type = ENTITY_TYPES.find(type => type.value === t.entityType);
                return (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-sm w-fit">
                        <FileTextIcon size={14} />
                        <span>{type?.label || 'Unknown'}</span>
                    </div>
                );
            }
        },
        {
            key: 'status',
            header: 'Status',
            width: 'w-[100px]',
            render: (t) => (
                t.isDeleted ? (
                    <StatusField
                        type="user_status"
                        value='INACTIVE'
                        mode="text"
                        className="text-red-500"
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={t.isActive}
                            onChange={(checked) => canEdit && handleStatusToggle(t, checked)}
                            disabled={!canEdit}
                            className={t.isActive ? "bg-[#5c8a14]" : "bg-gray-200"}
                        />
                        <span className={`text-sm ${t.isActive ? 'text-[#5c8a14]' : 'text-gray-500'}`}>
                            {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                )
            )
        },
        {
            key: 'createdAt',
            header: 'Created On',
            width: 'w-[150px]',
            render: (t) => (
                <span
                    className="text-muted-foreground cursor-help"
                    title={`Raw: ${t.createdAt}\nTZ: ${getUserTimezone()}`}
                >
                    {formatDateTime(t.createdAt)}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        Email Templates
                    </h1>
                    <p className="text-muted-foreground">Manage system email templates</p>
                </div>
                {canCreate && (
                    <Button
                        leftIcon={<PlusIcon size={16} />}
                        onClick={handleAdd}
                    >
                        Add Template
                    </Button>
                )}
            </div>

            <div className="p-5 bg-background rounded-lg border border-border shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <StatusField
                        type="user_status"
                        mode="select"
                        showAllOption
                        value={statusFilter === 'ALL' ? '' : statusFilter}
                        onChange={(val) => setStatusFilter(val ? (val as 'ACTIVE' | 'INACTIVE') : 'ALL')}
                        placeholder="All"
                        className="w-[120px]"
                    />
                    <Input
                        type="search"
                        placeholder="Search templates..."
                        containerClassName="w-[30%]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <DataTable
                    columns={columns}
                    data={displayedTemplates}
                    rowKey={(t) => t.uid}
                    loading={loading}
                    error={error?.message}
                    emptyMessage="No templates found."
                    loadingMessage="Loading templates..."
                    infiniteScroll
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={handleLoadMore}
                />
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === 'create' ? 'Create Template' : 'Edit Template'}
                size="full" // Larger modal for content editing
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} isLoading={isSubmitting}>
                            {modalMode === 'create' ? 'Create' : 'Save Changes'}
                        </Button>
                    </>
                }
            >
                {/* Loading Overlay */}
                {isLoadingBody && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading template...</span>
                        </div>
                    </div>
                )}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="Template Name"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, name: e.target.value }));
                                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                }}
                                error={errors.name}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Entity Type</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={formData.entityType}
                                onChange={(e) => setFormData(prev => ({ ...prev, entityType: Number(e.target.value) }))}
                            >
                                {ENTITY_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subject <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="Email Subject"
                            value={formData.subject}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, subject: e.target.value }));
                                if (errors.subject) setErrors(prev => ({ ...prev, subject: '' }));
                            }}
                            error={errors.subject}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Body Content (HTML) <span className="text-red-500">*</span></label>
                        <HtmlEditor
                            value={formData.body}
                            onChange={(newBody) => {
                                setFormData(prev => ({ ...prev, body: newBody }));
                                if (errors.body) setErrors(prev => ({ ...prev, body: '' }));
                            }}
                            placeholder="<html><body>...</body></html>"
                            placeholders={[...EMAIL_VARIABLES]}
                            helperText="Click 'Insert Variable' to add dynamic placeholders"
                            minHeight="250px"
                            error={errors.body}
                        />
                    </div>

                    {modalMode === 'edit' && (
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm deletion"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={!isNameMatch(deleteConfirmName, templateToDelete?.name || '') || isDeleting}
                            isLoading={isDeleting}
                        >
                            Delete
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Type the name <span className="font-semibold text-foreground">{templateToDelete?.name}</span> to delete this template.
                    </p>
                    <Input
                        placeholder="Enter template name"
                        value={deleteConfirmName}
                        onChange={(e) => setDeleteConfirmName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleConfirmDelete();
                            }
                        }}
                    />
                </div>
            </Modal>

            {/* Restore Modal */}
            <Modal
                isOpen={restoreModalOpen}
                onClose={() => setRestoreModalOpen(false)}
                title="Confirm restoration"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setRestoreModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmRestore} isLoading={isRestoring}>Restore</Button>
                    </>
                }
            >
                <p className="text-sm text-muted-foreground">
                    Are you sure you want to restore <span className="font-semibold text-foreground">{templateToRestore?.name}</span>?
                </p>
            </Modal>
        </div>
    );
}
