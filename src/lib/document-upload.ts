/**
 * Document Upload Service
 * Handles uploading customer documents (Identity Proof, Previous Bill) to backend
 */
import { apiAxios } from './apollo';

export type DocumentType = 'identity_proof' | 'previous_bill' | 'electricity_bill';

export interface UploadDocumentResult {
    id: number;
    uid: string;
    path: string;
    url: string;
    filename: string;
    size: number;
    contentType: string;
}

export interface UploadDocumentResponse {
    success: boolean;
    data?: UploadDocumentResult;
    error?: string;
}

/**
 * Upload a customer document
 * @param file The file to upload
 * @param customerId The customer ID (GEE format) for folder naming
 * @param documentType Type of document ('identity_proof' or 'previous_bill')
 * @param customerUid Optional customer UID to update the customer record in DB
 * @param onProgress Optional progress callback
 */
export const uploadDocument = async (
    file: File,
    customerId: string,
    documentType: DocumentType,
    customerUid?: string,
    name?: string,
    onProgress?: (progress: number) => void,
    startDate?: string,
    endDate?: string
): Promise<UploadDocumentResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customerId', customerId);
    formData.append('documentType', documentType);
    if (name) {
        formData.append('name', name);
    }
    if (customerUid) {
        formData.append('customer_uid', customerUid);
    }
    if (startDate) {
        formData.append('startDate', startDate);
    }
    if (endDate) {
        formData.append('endDate', endDate);
    }

    const response = await apiAxios.post<UploadDocumentResponse>(
        '/api/documents/upload',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        }
    );

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Upload failed');
    }

    return response.data.data;
};

/**
 * Get the document URL for display/download
 * @param customerId Customer UID
 * @param filename Document filename
 */
export const getDocumentUrl = (customerId: string, filename: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    return `${baseUrl}/api/documents/${customerId}/${filename}`;
};

/**
 * Get the full document URL from a stored path for preview/download
 * @param documentPath The stored document path (e.g., "GEE55477/Personal documents/file.pdf")
 * @returns Full URL for the document
 */
export const getDocumentPreviewUrl = (documentPath: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    return `${baseUrl}/api/documents/${documentPath}`;
};

/**
 * Check if a file is an image based on extension
 */
export const isImageFile = (filename: string): boolean => {
    if (!filename || typeof filename !== 'string') return false;
    const ext = filename.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '');
};

/**
 * Check if a file is a PDF
 */
export const isPdfFile = (filename: string): boolean => {
    if (!filename || typeof filename !== 'string') return false;
    return filename.toLowerCase().endsWith('.pdf');
};

/**
 * Delete a customer document
 * @param customerId Customer UID
 * @param filename Document filename
 */
export const deleteDocument = async (customerId: string, filename: string): Promise<boolean> => {
    try {
        const response = await apiAxios.delete(`/api/documents/${customerId}/${filename}`);
        return response.data.success;
    } catch {
        return false;
    }
};

/**
 * Generate a temporary ID for document uploads during customer creation
 * This is used when customer doesn't have a UID yet
 */
export const generateTempDocumentId = (): string => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export interface MoveDocumentsResult {
    previousBillPath?: string;
    identityProofPath?: string;
}

interface MoveDocumentsResponse {
    success: boolean;
    data?: MoveDocumentsResult;
    error?: string;
}

/**
 * Move documents from temp folder to customer folder after customer creation
 * @param tempId The temporary ID used during upload
 * @param customerId The customer ID (GEE format) - the new folder name
 * @param customerUid The customer UID for database updates
 * @param previousBillPath Current path of previous bill (if any)
 * @param identityProofPath Current path of identity proof (if any)
 * @returns Object with new paths for moved documents
 */
export const moveDocumentsToCustomer = async (
    tempId: string,
    customerId: string,
    customerUid: string,
    previousBill?: number | string | null,
    identityProof?: number | string | null
): Promise<MoveDocumentsResult> => {
    // Only call API if there are temp documents to move
    if (!previousBill && !identityProof) {
        return {};
    }

    try {
        const response = await apiAxios.post<MoveDocumentsResponse>('/api/documents/move', {
            tempId,
            customerId,
            customerUid,
            previousBill: typeof previousBill === 'number' ? previousBill : undefined,
            identityProof: typeof identityProof === 'number' ? identityProof : undefined,
            // Fallback for paths? Backend expects IDs now. 
            // If the frontend has an ID, pass it.
        });

        if (!response.data.success) {
            console.error('Failed to move documents:', response.data.error);
            return {};
        }

        return response.data.data || {};
    } catch (error) {
        console.error('Error moving documents:', error);
        return {};
    }
};
