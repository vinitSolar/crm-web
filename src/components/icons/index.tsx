// Icons - Reusable SVG icon components

import { cn } from '@/lib/utils';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
}

export const EyeIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export const EyeOffIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

export const SpinnerIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn('animate-spin', className)}
        {...props}
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

export const SearchIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

export const ChevronDownIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

export const ChevronUpIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <polyline points="18 15 12 9 6 15" />
    </svg>
);

export const ChevronLeftIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

export const ChevronRightIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

export const CloseIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export const CheckIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export const CheckCircleIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export const AlertCircleIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

export const PlusIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

export const RatesIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 16 19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M15.5 11.5769V9.15385C15.5 8.32759 15.1444 7.53518 14.5115 6.95094C13.8786 6.36669 13.0201 6.03846 12.125 6.03846H10.625C10.3266 6.03846 10.0405 5.92905 9.8295 5.7343C9.61853 5.53955 9.5 5.27542 9.5 5V3.61538C9.5 2.78913 9.14442 1.99672 8.51149 1.41248C7.87855 0.828227 7.02011 0.5 6.125 0.5H4.25M8 8.80769V15.7308M10.25 9.76215C9.12033 9.4936 7.94494 9.42997 6.789 9.57477C6.253 9.64123 5.815 10.016 5.768 10.5135C5.75609 10.6369 5.75008 10.7607 5.75 10.8846C5.75 11.3129 6.086 11.6637 6.525 11.8022L9.475 12.7363C9.915 12.8748 10.25 13.2255 10.25 13.6538C10.25 13.7794 10.244 13.9031 10.232 14.0249C10.185 14.5225 9.747 14.8972 9.211 14.9637C8.05501 15.1071 6.87991 15.0435 5.75 14.7763M6.5 0.5H1.625C1.004 0.5 0.5 0.965231 0.5 1.53846V17.4615C0.5 18.0348 1.004 18.5 1.625 18.5H14.375C14.996 18.5 15.5 18.0348 15.5 17.4615V8.80769C15.5 6.60436 14.5518 4.49126 12.864 2.93327C11.1761 1.37527 8.88695 0.5 6.5 0.5Z" />
    </svg>
);

export const CopyIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 12 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M8.40039 10.4V12.65C8.40039 13.064 8.06439 13.4 7.65039 13.4H1.15039C0.951478 13.4 0.760713 13.321 0.620061 13.1803C0.479408 13.0397 0.400391 12.8489 0.400391 12.65V4.14999C0.400391 3.73599 0.736391 3.39999 1.15039 3.39999H2.40039C2.73544 3.39977 3.06993 3.42742 3.40039 3.48266M8.40039 10.4H10.6504C11.0644 10.4 11.4004 10.064 11.4004 9.64999V6.39999C11.4004 3.42666 9.23839 0.959329 6.40039 0.482662C6.06993 0.427418 5.73544 0.399767 5.40039 0.399995H4.15039C3.73639 0.399995 3.40039 0.735995 3.40039 1.15V3.48266M8.40039 10.4H4.15039C3.95148 10.4 3.76071 10.321 3.62006 10.1803C3.47941 10.0397 3.40039 9.84891 3.40039 9.64999V3.48266M11.4004 7.89999V6.64999C11.4004 6.05326 11.1633 5.48096 10.7414 5.059C10.3194 4.63705 9.74713 4.39999 9.15039 4.39999H8.15039C7.95148 4.39999 7.76071 4.32098 7.62006 4.18032C7.47941 4.03967 7.40039 3.84891 7.40039 3.64999V2.65C7.40039 2.35452 7.34219 2.06194 7.22912 1.78896C7.11605 1.51598 6.95031 1.26794 6.74138 1.05901C6.53245 0.850073 6.28441 0.684339 6.01143 0.571266C5.73845 0.458193 5.44586 0.399995 5.15039 0.399995H4.40039" />
    </svg>
);

export const CustomerIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 19 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M11.8659 15.086C12.6095 15.3061 13.3799 15.4175 14.1542 15.4167C15.3995 15.4185 16.6285 15.129 17.7468 14.5704C17.7798 13.7737 17.5573 12.9877 17.1128 12.3316C16.6684 11.6755 16.0262 11.185 15.2838 10.9344C14.5413 10.6839 13.739 10.687 12.9984 10.9432C12.2578 11.1995 11.6194 11.6949 11.1798 12.3544M11.8659 15.086V15.0833C11.8659 14.094 11.6165 13.1633 11.1798 12.3544M11.8659 15.086V15.1802C10.1881 16.2105 8.26601 16.7534 6.3075 16.75C4.27541 16.75 2.3741 16.1767 0.750873 15.1802L0.750001 15.0833C0.749332 13.8251 1.15939 12.6024 1.91553 11.608C2.67168 10.6136 3.73089 9.90415 4.92618 9.59141C6.12147 9.27867 7.38484 9.38046 8.51712 9.88074C9.64941 10.381 10.5862 11.2513 11.1798 12.3544M9.25057 3.75C9.25057 4.54565 8.94059 5.30871 8.38882 5.87132C7.83705 6.43392 7.08869 6.74999 6.30837 6.74999C5.52805 6.74999 4.77969 6.43392 4.22792 5.87132C3.67615 5.30871 3.36616 4.54565 3.36616 3.75C3.36616 2.95435 3.67615 2.19129 4.22792 1.62868C4.77969 1.06607 5.52805 0.75 6.30837 0.75C7.08869 0.75 7.83705 1.06607 8.38882 1.62868C8.94059 2.19129 9.25057 2.95435 9.25057 3.75ZM16.4426 5.75C16.4426 6.36883 16.2015 6.96233 15.7724 7.39991C15.3432 7.83749 14.7612 8.08333 14.1542 8.08333C13.5473 8.08333 12.9653 7.83749 12.5361 7.39991C12.107 6.96233 11.8659 6.36883 11.8659 5.75C11.8659 5.13116 12.107 4.53767 12.5361 4.10008C12.9653 3.6625 13.5473 3.41666 14.1542 3.41666C14.7612 3.41666 15.3432 3.6625 15.7724 4.10008C16.2015 4.53767 16.4426 5.13116 16.4426 5.75Z" />
    </svg>
);

export const PencilIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        className={cn(className)}
        {...props}
    >
        <path d="M13.7592 3.32863L11.8324 5.24717L8.7446 2.15939L10.6714 0.240847C10.9925 -0.0802823 11.5277 -0.0802823 11.8324 0.240847L13.7592 2.16762C14.0803 2.47228 14.0803 3.0075 13.7592 3.32863ZM0 10.9122L8.28349 2.6205L11.3713 5.70828L3.08778 14H0V10.9122ZM11.2148 0.858403L9.94677 2.12645L11.8735 4.05323L13.1416 2.78518L11.2148 0.858403ZM10.1773 5.76592L8.23408 3.82267L0.823408 11.2498V13.1766H2.75018L10.1773 5.76592Z" fill="currentColor" />
    </svg>
);

export const TrashIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 13 15"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M8.49273 5.3464L8.24109 11.8078M4.75891 11.8078L4.50727 5.3464M11.7567 3.04184C12.0055 3.07918 12.2527 3.11866 12.5 3.16102M11.7567 3.04184L10.98 13.0089C10.9483 13.4147 10.7626 13.7937 10.46 14.0701C10.1574 14.3466 9.76029 14.5001 9.348 14.5H3.652C3.23971 14.5001 2.84256 14.3466 2.53999 14.0701C2.23741 13.7937 2.0517 13.4147 2.02 13.0089L1.24327 3.04184M11.7567 3.04184C10.9174 2.91658 10.0736 2.82151 9.22727 2.75683M1.24327 3.04184C0.994545 3.07846 0.747273 3.11795 0.5 3.1603M1.24327 3.04184C2.08264 2.91658 2.92635 2.82151 3.77273 2.75683M9.22727 2.75683V2.0992C9.22727 1.25205 8.56545 0.545604 7.70727 0.51904C6.90263 0.493653 6.09737 0.493653 5.29273 0.51904C4.43455 0.545604 3.77273 1.25276 3.77273 2.0992V2.75683M9.22727 2.75683C7.4118 2.61832 5.5882 2.61832 3.77273 2.75683" />
    </svg>
);

export const UnlockedIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 14 13"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M7.92857 5.57692V3.26923C7.92857 2.53479 8.22207 1.83042 8.74449 1.31109C9.26691 0.791757 9.97547 0.5 10.7143 0.5C11.4531 0.5 12.1617 0.791757 12.6841 1.31109C13.2065 1.83042 13.5 2.53479 13.5 3.26923V5.57692M1.89286 12.5H8.39286C8.76227 12.5 9.11654 12.3541 9.37776 12.0945C9.63897 11.8348 9.78571 11.4826 9.78571 11.1154V6.96154C9.78571 6.59432 9.63897 6.24213 9.37776 5.98247C9.11654 5.7228 8.76227 5.57692 8.39286 5.57692H1.89286C1.52345 5.57692 1.16917 5.7228 0.907958 5.98247C0.646747 6.24213 0.5 6.59432 0.5 6.96154V11.1154C0.5 11.4826 0.646747 11.8348 0.907958 12.0945C1.16917 12.3541 1.52345 12.5 1.89286 12.5Z" />
    </svg>
);

export const UserSettingIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 18 19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M6.39352 1.43778C6.47852 0.925892 6.92241 0.550003 7.44186 0.550003H9.8908C10.4102 0.550003 10.8541 0.925892 10.9391 1.43778L11.1403 2.64761C11.1998 3.00084 11.4359 3.2955 11.7495 3.46928C11.8194 3.50706 11.8883 3.54767 11.9572 3.58923C12.2642 3.77434 12.6372 3.83195 12.9725 3.70634L14.1219 3.27567C14.3575 3.18709 14.6168 3.18498 14.8537 3.26973C15.0907 3.35448 15.2899 3.52058 15.4158 3.73845L16.6398 5.86061C16.7655 6.0785 16.8098 6.3339 16.7648 6.58138C16.7198 6.82886 16.5885 7.05236 16.3942 7.21211L15.447 7.99317C15.1702 8.22078 15.0333 8.57211 15.0409 8.93006C15.0422 9.01033 15.0422 9.09062 15.0409 9.17089C15.0333 9.52789 15.1702 9.87923 15.447 10.1068L16.3952 10.8879C16.7956 11.2184 16.8995 11.7898 16.6407 12.2384L15.4149 14.3606C15.2891 14.5784 15.0901 14.7446 14.8534 14.8295C14.6166 14.9144 14.3574 14.9126 14.1219 14.8243L12.9725 14.3937C12.6372 14.2681 12.2642 14.3257 11.9563 14.5108C11.8878 14.5524 11.8186 14.5927 11.7485 14.6317C11.4359 14.8045 11.1998 15.0992 11.1403 15.4524L10.9391 16.6622C10.8541 17.1751 10.4102 17.55 9.8908 17.55H7.44091C6.92147 17.55 6.47852 17.1741 6.39258 16.6622L6.19141 15.4524C6.13286 15.0992 5.89675 14.8045 5.58319 14.6307C5.51316 14.5921 5.44389 14.5521 5.37541 14.5108C5.06847 14.3257 4.69541 14.2681 4.35919 14.3937L3.2098 14.8243C2.97438 14.9127 2.71526 14.9146 2.47852 14.8299C2.24178 14.7452 2.04276 14.5792 1.91686 14.3616L0.691913 12.2394C0.566248 12.0215 0.521957 11.7661 0.566922 11.5186C0.611886 11.2711 0.743189 11.0476 0.937468 10.8879L1.88569 10.1068C2.16147 9.88017 2.29841 9.52789 2.2918 9.17089C2.29032 9.09062 2.29032 9.01033 2.2918 8.93006C2.29841 8.57117 2.16147 8.22078 1.88569 7.99317L0.937468 7.21211C0.743422 7.0524 0.612272 6.82908 0.567314 6.58181C0.522357 6.33455 0.566504 6.07935 0.691913 5.86156L1.91686 3.73939C2.04264 3.52135 2.24176 3.35506 2.47872 3.27013C2.71568 3.18521 2.9751 3.18717 3.21075 3.27567L4.35919 3.70634C4.69541 3.83195 5.06847 3.77434 5.37541 3.58923C5.44341 3.54767 5.5133 3.508 5.58319 3.46834C5.89675 3.2955 6.13286 3.00084 6.19141 2.64761L6.39352 1.43778Z" />
        <path d="M11.4987 9.05001C11.4987 9.80145 11.2002 10.5221 10.6688 11.0535C10.1375 11.5848 9.41681 11.8833 8.66536 11.8833C7.91392 11.8833 7.19325 11.5848 6.66189 11.0535C6.13054 10.5221 5.83203 9.80145 5.83203 9.05001C5.83203 8.29856 6.13054 7.57789 6.66189 7.04654C7.19325 6.51519 7.91392 6.21667 8.66536 6.21667C9.41681 6.21667 10.1375 6.51519 10.6688 7.04654C11.2002 7.57789 11.4987 8.29856 11.4987 9.05001Z" />
    </svg>
);

export const RefreshCwIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M21 2v6h-6" />
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M3 22v-6h6" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
);

export const ShieldIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

export const ShieldCheckIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export const FilterIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

export const LogOutIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

export const MenuIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

export const XIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export const SnowflakeIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <line x1="2" x2="22" y1="12" y2="12" />
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="m20 16-4-4 4-4" />
        <path d="m4 8 4 4-4 4" />
        <path d="m16 4-4 4-4-4" />
        <path d="m8 20 4-4 4 4" />
    </svg>
);

export const PhoneIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

export const HomeIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

export const UserIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

export const ZapIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

export const LockIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

export const PlugIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M12 22v-5" />
        <path d="M9 8V2" />
        <path d="M15 8V2" />
        <path d="M18 8H6a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Z" />
    </svg>
);

export const PiggyBankIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z" />
        <path d="M2 9v1c0 1.1.9 2 2 2h1" />
        <path d="M16 11h.01" />
    </svg>
);

export const Settings2Icon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M20 7h-9" />
        <path d="M14 17H5" />
        <circle cx="17" cy="17" r="3" />
        <circle cx="7" cy="7" r="3" />
    </svg>
);

export const CalendarIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

export const MailIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

export const CreditCardIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
);

export const HashIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
);

export const ClockIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

export const MapPinIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

export const PercentIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <line x1="19" x2="5" y1="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
);

export const SunIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
    </svg>
);

export const MoonIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

export const MonitorIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
);



export const IdCardIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M16 10h2" />
        <path d="M16 14h2" />
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <path d="M7 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M11 17v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
    </svg>
);
export const GiftIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect width="20" height="5" x="2" y="7" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
);

export const EmptyStateIcon = ({ size = 48, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
);
export const FileTextIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

export const CameraIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

export const SaveIcon = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

export const TypeIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
);


export const SendIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

// ============================================================
// HTML Editor Icons
// ============================================================

export const BoldIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
);

export const ItalicIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <line x1="19" y1="4" x2="10" y2="4" />
        <line x1="14" y1="20" x2="5" y2="20" />
        <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
);

export const UnderlineIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
        <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
);

export const EditorLinkIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);

export const ListIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

export const OrderedListIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <line x1="10" y1="6" x2="21" y2="6" />
        <line x1="10" y1="12" x2="21" y2="12" />
        <line x1="10" y1="18" x2="21" y2="18" />
        <path d="M4 6h1v4" />
        <path d="M4 10h2" />
        <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
);

export const VariableIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 15V9l2 3 2-3v6" />
        <path d="M17 9h-4v6h4" />
        <path d="M13 12h3" />
    </svg>
);

export const TableIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
);

export const CTAButtonIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <rect x="4" y="7" width="16" height="10" rx="3" />
        <path d="M9 12h6" />
        <path d="M12 9v6" />
    </svg>
);

export const PreviewIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export const CodeBracketIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </svg>
);

export const MaximizeIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
        <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
        <path d="M3 16v3a2 2 0 0 0 2 2h3" />
        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
);

export const MinimizeIcon = ({ size = 16, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M4 14h6v6" />
        <path d="M20 10h-6V4" />
        <path d="M14 10l7-7" />
        <path d="M3 21l7-7" />
    </svg>
);

export const ActivityIcon = ({ size = 18, className, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className)}
        {...props}
    >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);
