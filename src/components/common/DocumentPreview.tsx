
import React from 'react';
import { getDocumentPreviewUrl, isImageFile, isPdfFile } from '../../lib/document-upload';

interface DocumentPreviewProps {
    path: string;
    label: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ path, label }) => {
    // Guard against invalid path
    if (!path || typeof path !== 'string') {
        return (
            <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/50 rounded-lg text-muted-foreground text-sm">
                <span className="text-xl">📎</span>
                <span>{label}: No document available</span>
            </div>
        );
    }

    const previewUrl = getDocumentPreviewUrl(path);
    const isImage = isImageFile(path);
    const isPdf = isPdfFile(path);
    const filename = path.split('/').pop() || path;

    return (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/50 to-transparent border border-border/50 rounded-lg hover:border-primary/30 transition-colors group">
            {/* Icon/Thumbnail */}
            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center border border-border">
                {isImage ? (
                    <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
                ) : isPdf ? (
                    <span className="text-xl">📄</span>
                ) : (
                    <span className="text-xl">📎</span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-foreground truncate" title={filename}>
                    {filename}
                </p>
            </div>

            {/* Action */}
            <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                View
            </a>
        </div>
    );
};

export default DocumentPreview;
