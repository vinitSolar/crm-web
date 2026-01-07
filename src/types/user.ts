export interface Menu {
    uid: string;
    name: string;
    code: string;
    parentUid?: string;
}

export interface RolePermission {
    roleUid: string;
    menuUid: string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export interface RolePermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: {
        uid: string;
        name: string;
    };
}
