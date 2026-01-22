import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import {
    GET_CUSTOMER_BY_ID,
    GET_ACTIVE_RATES_HISTORY,
    GET_RATES_HISTORY_BY_VERSION,
    CHECK_ADDRESS_EXISTS,
    CHECK_NMI_EXISTS,
    CREATE_CUSTOMER,
    UPDATE_CUSTOMER,
} from '@/graphql';
import { DNSP_MAP, SALE_TYPE_OPTIONS, BILLING_PREF_OPTIONS, ID_TYPE_OPTIONS, STATE_OPTIONS } from '@/lib/constants';
import { formatDateTime } from '@/lib/date';
import {
    ChevronRightIcon,
    HomeIcon,
    UserIcon,
    CheckIcon,
    ZapIcon,
    PlugIcon,
    // PiggyBankIcon,
    Settings2Icon,
    ShieldIcon,
    LockIcon,
    CalendarIcon,
    MailIcon,
    CreditCardIcon,
    HashIcon,
    ClockIcon,
    MapPinIcon,
    PercentIcon,
    IdCardIcon,
    PhoneIcon,
    ActivityIcon,
} from '@/components/icons';
import { sendVerification, checkVerification } from '@/lib/twilio';
import { calculateDiscountedRate } from '@/lib/rate-utils';
import LocationAutocomplete from '../LocationAutocomplete';
import { Modal } from '@/components/common/Modal';

// ============================================================================
// UI COMPONENTS
// ============================================================================

const Field = ({ label, required, hint, children, error }: { label: string, required?: boolean, hint?: string, children: React.ReactNode, error?: string }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium leading-none flex items-center gap-1 text-foreground">
            {label}
            {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
);

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
            e.stopPropagation();
            onChange(!checked);
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 ${checked ? 'bg-neutral-900' : 'bg-muted'}`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

// ============================================================================
// TYPES
// ============================================================================

import type { CustomerFormData, RatePlan } from '@/types';

// ============================================================================
// CONSTANTS
// ============================================================================

const initialFormData: CustomerFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    propertyType: 0,
    businessName: '',
    abn: '',
    showAsBusinessName: false,
    showName: true,
    unitNumber: '',
    streetNumber: '',
    streetName: '',
    streetType: '',
    suburb: '',
    state: '',
    postcode: '',
    country: 'Australia',
    nmi: '',
    hasSolar: false,
    solarCapacity: '',
    inverterCapacity: '',
    vpp: false,
    vppConnected: false,
    vppSignupBonus: '',
    batteryBrand: '',
    batteryCapacity: '',
    snNumber: '',
    exportLimit: '',
    saleType: 0,
    connectionDate: '',
    idType: 0,
    idNumber: '',
    idState: '',
    idExpiry: '',
    concession: false,
    lifeSupport: false,
    billingPreference: 0,
    directDebit: false,
    accountType: 0,
    debitFirstName: '',
    debitLastName: '',
    bankName: '',
    bankAddress: '',
    bsb: '',
    accountNumber: '',
    paymentFrequency: 0,
    firstDebitDate: '',
    tariffCode: '',
    discount: 0,
};



const batteryBrandOptions = [
    { value: 'Fox ESS', label: 'Fox ESS' },
    { value: 'NeoVolt', label: 'NeoVolt' },
    { value: 'Solis-Pylontech', label: 'Solis-Pylontech' },
    { value: 'Growatt', label: 'Growatt' },
    { value: 'Tesla', label: 'Tesla' },
    { value: 'LG Energy Solution', label: 'LG Energy Solution' },
    { value: 'BYD', label: 'BYD' },
    { value: 'Sonnen', label: 'Sonnen' },
    { value: 'AlphaESS', label: 'AlphaESS' },
    { value: 'Sungrow', label: 'Sungrow' },
    { value: 'Huawei', label: 'Huawei' },
    { value: 'Enphase', label: 'Enphase' },
    { value: 'Senec', label: 'Senec' },
    { value: 'Fronius', label: 'Fronius' },
    { value: 'GoodWe', label: 'GoodWe' },
    { value: 'Delta', label: 'Delta' },
    { value: 'Redflow', label: 'Redflow' },
    { value: 'SolaX', label: 'SolaX' },
    { value: 'Victorn Energy', label: 'Victron Energy' },
    { value: 'Other', label: 'Other' },
];



const streetTypeOptions = [
    { value: 'St', label: 'Street' },
    { value: 'Rd', label: 'Road' },
    { value: 'Ave', label: 'Avenue' },
    { value: 'Dr', label: 'Drive' },
    { value: 'Ct', label: 'Court' },
    { value: 'Pl', label: 'Place' },
    { value: 'Cres', label: 'Crescent' },
    { value: 'Way', label: 'Way' },
    { value: 'Ln', label: 'Lane' },
    { value: 'Blvd', label: 'Boulevard' },
];

// ============================================================================
// STEP BADGE COMPONENT
// ============================================================================

interface StepBadgeProps {
    index: number;
    label: string;
    active: boolean;
    done: boolean;
    status?: string;
    statusTone?: 'success' | 'warning' | 'error';
}

const StepBadge: React.FC<StepBadgeProps> = ({ index, label, active, done, status, statusTone }) => {
    const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all cursor-pointer";
    const activeClasses = active
        ? "bg-neutral-900 text-white border-neutral-900 shadow-md"
        : done
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-muted text-muted-foreground border-border hover:bg-muted/80";

    return (
        <div className={`${baseClasses} ${activeClasses}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${active ? 'bg-white text-neutral-900' : done ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {done ? <CheckIcon size={14} /> : index}
            </span>
            <span className="font-medium">{label}</span>
            {status && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusTone === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : statusTone === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-muted text-muted-foreground'}`}>
                    {status}
                </span>
            )}
        </div>
    );
};

const SummaryItem = ({ icon: Icon, label, value, className }: { icon: any, label: string, value: string | React.ReactNode, className?: string }) => (
    <div className={cn("flex items-start gap-2.5 py-1.5 border-b border-border/50 last:border-0", className)}>
        <div className="mt-0.5 p-1.5 bg-blue-50 rounded-lg text-blue-600 shrink-0">
            <Icon size={12} />
        </div>
        <div className="space-y-0 min-w-0 flex-1">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-0.5">{label}</p>
            <p className="text-[11px] font-bold text-foreground truncate">{value || '—'}</p>
        </div>
    </div>
);

// ============================================================================
// RATE DETAILS COMPONENT
// ============================================================================

const RateDetailsView = ({ offer, discount }: { offer: any, discount: number }) => {
    const hasCL = (offer.cl1Usage || 0) > 0 || (offer.cl2Usage || 0) > 0;
    const hasFiT = (offer.fit || 0) > 0 || (offer.fitPeak || 0) > 0 || (offer.fitCritical || 0) > 0 || (offer.fitVpp || 0) > 0;

    return (
        <div className="md:col-span-2 p-5 bg-card border border-border rounded-xl">
            <h4 className="text-sm font-bold text-foreground mb-5">{offer.offerName || 'DEFAULT MARKET OFFER'}</h4>
            <div className="flex flex-wrap gap-5">
                {/* Column 1: Energy Rates */}
                <div className="space-y-2 min-w-[180px] flex-1">
                    <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-2">
                        <Settings2Icon size={14} />
                        <span className="text-xs font-bold uppercase tracking-wide">Energy Rates</span>
                    </div>
                    {offer.peak > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                            <div className="text-blue-600 dark:text-blue-400 font-bold text-sm">${calculateDiscountedRate(offer.peak, discount).toFixed(4)}/kWh</div>
                            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider opacity-80">Peak</div>
                        </div>
                    )}
                    {offer.offPeak > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                            <div className="text-blue-600 dark:text-blue-400 font-bold text-sm">${calculateDiscountedRate(offer.offPeak, discount).toFixed(4)}/kWh</div>
                            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider opacity-80">Off-Peak</div>
                        </div>
                    )}
                    {offer.shoulder > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                            <div className="text-blue-600 dark:text-blue-400 font-bold text-sm">${calculateDiscountedRate(offer.shoulder, discount).toFixed(4)}/kWh</div>
                            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider opacity-80">Shoulder</div>
                        </div>
                    )}
                    {offer.anytime > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-center">
                            <div className="text-orange-600 dark:text-orange-400 font-bold text-sm">${calculateDiscountedRate(offer.anytime, discount).toFixed(4)}/kWh</div>
                            <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider opacity-80">Anytime</div>
                        </div>
                    )}
                </div>

                {/* Column 2: Supply Charges */}
                <div className="space-y-2 min-w-[180px] flex-1">
                    <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400 mb-2">
                        <PlugIcon size={14} />
                        <span className="text-xs font-bold uppercase tracking-wide">Supply Charges</span>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center">
                        <div className="text-purple-600 dark:text-purple-400 font-bold text-sm">${offer.supplyCharge.toFixed(4)}/day</div>
                        <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider opacity-80">Supply</div>
                    </div>
                    {(offer.vppOrcharge || 0) > 0 && (
                        <>
                            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 mb-2 mt-4">
                                <ActivityIcon size={14} />
                                <span className="text-xs font-bold uppercase tracking-wide">VPP Orchestration Charges</span>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
                                <div className="text-amber-600 dark:text-amber-400 font-bold text-sm">${offer.vppOrcharge.toFixed(4)}/day</div>
                                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider opacity-80">Orchestration</div>
                            </div>
                        </>
                    )}
                </div>

                {/* Column 3: Solar FiT */}
                {hasFiT && (
                    <div className="space-y-2 min-w-[180px] flex-1">
                        <div className="flex items-center gap-2 text-teal-500 dark:text-teal-400 mb-2">
                            <ZapIcon size={14} />
                            <span className="text-xs font-bold uppercase tracking-wide">Solar FiT</span>
                        </div>
                        {(offer.fit || 0) > 0 && (
                            <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center">
                                <div className="text-teal-800 dark:text-teal-300 font-bold text-sm">${offer.fit.toFixed(4)}/kWh</div>
                                <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">Feed-in</div>
                            </div>
                        )}
                        {(offer.fitPeak || 0) > 0 && (
                            <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center">
                                <div className="text-teal-800 dark:text-teal-300 font-bold text-sm">${offer.fitPeak.toFixed(4)}/kWh</div>
                                <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">FiT Peak</div>
                            </div>
                        )}
                        {(offer.fitCritical || 0) > 0 && (
                            <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center">
                                <div className="text-teal-800 dark:text-teal-300 font-bold text-sm">${offer.fitCritical.toFixed(4)}/kWh</div>
                                <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">FiT Critical</div>
                            </div>
                        )}
                        {(offer.fitVpp || 0) > 0 && (
                            <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center">
                                <div className="text-teal-800 dark:text-teal-300 font-bold text-sm">${offer.fitVpp.toFixed(4)}/kWh</div>
                                <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">FiT VPP</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Column 4: Controlled Load */}
                {hasCL && (
                    <div className="space-y-2 min-w-[180px] flex-1">
                        <div className="flex items-center gap-2 text-green-500 dark:text-green-400 mb-2">
                            <PlugIcon size={14} />
                            <span className="text-xs font-bold uppercase tracking-wide">Controlled Load</span>
                        </div>
                        {offer.cl1Usage > 0 && (
                            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                                <div className="text-green-600 dark:text-green-400 font-bold text-sm">${calculateDiscountedRate(offer.cl1Usage, discount).toFixed(4)}/kWh</div>
                                <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider opacity-80">CL1 Usage</div>
                            </div>
                        )}
                        {offer.cl2Usage > 0 && (
                            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                                <div className="text-green-600 dark:text-green-400 font-bold text-sm">${calculateDiscountedRate(offer.cl2Usage, discount).toFixed(4)}/kWh</div>
                                <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider opacity-80">CL2 Usage</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CustomerFormPage = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const isEditMode = uid && uid !== 'new';

    // Form state
    const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});


    // Step state
    const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(0);
    const apolloClient = useApolloClient();

    // Phone verification state
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [phoneVerifiedAt, setPhoneVerifiedAt] = useState<string | null>(null);
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState<string>('');
    const [restrictedFeatureError, setRestrictedFeatureError] = useState(false);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [submittingStatus, setSubmittingStatus] = useState<number | null>(null);

    // Duplicate check state
    const [duplicateErrors, setDuplicateErrors] = useState<{ address?: string; nmi?: string }>({});
    const [addressSearch, setAddressSearch] = useState('');

    // Rate plans
    const [selectedRatePlan, setSelectedRatePlan] = useState<RatePlan | null>(null);

    // Queries & Mutations
    const { data: customerData, loading: isLoadingCustomer } = useQuery(GET_CUSTOMER_BY_ID, {
        variables: { uid },
        skip: !isEditMode,
        fetchPolicy: 'network-only',
    });

    const { data: activeRatesData } = useQuery(GET_ACTIVE_RATES_HISTORY, {
        fetchPolicy: 'cache-first',
    });

    const [checkAddressExists] = useLazyQuery(CHECK_ADDRESS_EXISTS);
    const [checkNmiExists] = useLazyQuery(CHECK_NMI_EXISTS);
    const [createCustomer] = useMutation(CREATE_CUSTOMER);
    const [updateCustomer] = useMutation(UPDATE_CUSTOMER);

    // Get customer's rate version for historic rates lookup
    const customerRateVersion = customerData?.customer?.rateVersion;

    // Fetch historic rates by version (for edit mode when customer has rateVersion)
    const { data: historicRatesData } = useQuery(GET_RATES_HISTORY_BY_VERSION, {
        variables: { version: customerRateVersion },
        skip: !isEditMode || !customerRateVersion,
        fetchPolicy: 'cache-first',
    });

    // Derived Data - Parse rate plans from active or historic rates
    const ratePlans: RatePlan[] = useMemo(() => {
        // In edit mode with historic rates available, use historic rates
        if (isEditMode && customerRateVersion && historicRatesData?.ratesHistoryByVersion?.newRecord) {
            try {
                const parsed = typeof historicRatesData.ratesHistoryByVersion.newRecord === 'string'
                    ? JSON.parse(historicRatesData.ratesHistoryByVersion.newRecord)
                    : historicRatesData.ratesHistoryByVersion.newRecord;
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('Failed to parse historic newRecord:', e);
            }
        }

        // Otherwise use active rates (for new customers or fallback)
        const record = activeRatesData?.globalActiveRatesHistory;
        if (!record?.newRecord) return [];
        try {
            const parsed = typeof record.newRecord === 'string' ? JSON.parse(record.newRecord) : record.newRecord;
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Failed to parse newRecord:', e);
            return [];
        }
    }, [isEditMode, customerRateVersion, historicRatesData, activeRatesData]);

    // Get active rate version for saving to customer
    const activeRateVersion = useMemo(() => {
        return activeRatesData?.globalActiveRatesHistory?.version || null;
    }, [activeRatesData]);

    const tariffOptions = useMemo(() => {
        if (!formData.state) return [];
        return ratePlans
            .filter(rp => {
                const stateMatch = rp.state?.toLowerCase() === formData.state?.toLowerCase();
                const activeMatch = !rp.isDeleted;
                // Only show VPP plans (vpp=1) if customer is a VPP participant
                // If not a VPP participant, exclude VPP plans entirely
                const vppMatch = formData.vpp ? rp.vpp === 1 : rp.vpp !== 1;
                return stateMatch && activeMatch && vppMatch;
            })
            .map(rp => ({
                value: rp.codes,
                label: `${rp.codes} - ${rp.tariff} (${rp.state})`,
            }));
    }, [ratePlans, formData.state, formData.vpp]);

    const discountOptions = useMemo(() => {
        // discountApplies is 0 or 1 (integer), so check explicitly
        if (selectedRatePlan?.discountApplies !== 1) return [{ value: '0', label: '0%' }];
        return [
            { value: '0', label: '0%' },
            { value: '5', label: '5%' },
            { value: '7', label: '7%' },
            { value: '10', label: '10%' },
            { value: '13', label: '13%' },
            { value: '15', label: '15%' },
        ];
    }, [selectedRatePlan]);

    // Load Data
    useEffect(() => {
        if (customerData?.customer) {
            const c = customerData.customer;
            setFormData({
                firstName: c.firstName || '',
                lastName: c.lastName || '',
                email: c.email || '',
                phone: c.number || '',
                dob: c.dob ? c.dob.split('T')[0] : '',
                propertyType: c.propertyType || 0,
                businessName: c.businessName || '',
                abn: c.abn || '',
                showAsBusinessName: c.showAsBusinessName || false,
                showName: c.showName ?? true,
                unitNumber: c.address?.unitNumber || '',
                streetNumber: c.address?.streetNumber || '',
                streetName: c.address?.streetName || '',
                streetType: c.address?.streetType || '',
                suburb: c.address?.suburb || '',
                state: c.address?.state || '',
                postcode: c.address?.postcode || '',
                country: c.address?.country || 'Australia',
                nmi: c.address?.nmi || '',
                hasSolar: c.solarDetails?.hassolar === 1,
                solarCapacity: c.solarDetails?.solarcapacity?.toString() || '',
                inverterCapacity: c.solarDetails?.invertercapacity?.toString() || '',
                vpp: c.vppDetails?.vpp === 1,
                vppConnected: c.vppDetails?.vppConnected === 1,
                vppSignupBonus: c.vppDetails?.vppSignupBonus?.toString() || '',
                batteryBrand: c.batteryDetails?.batterybrand || '',
                batteryCapacity: c.batteryDetails?.batterycapacity?.toString() || '',
                snNumber: c.batteryDetails?.snnumber || '',
                exportLimit: c.batteryDetails?.exportlimit?.toString() || '',
                saleType: c.enrollmentDetails?.saletype || 0,
                connectionDate: c.enrollmentDetails?.connectiondate ? c.enrollmentDetails.connectiondate.split('T')[0] : '',
                idType: c.enrollmentDetails?.idtype || 0,
                idNumber: c.enrollmentDetails?.idnumber || '',
                idState: c.enrollmentDetails?.idstate || '',
                idExpiry: c.enrollmentDetails?.idexpiry ? c.enrollmentDetails.idexpiry.split('T')[0] : '',
                concession: c.enrollmentDetails?.concession === 1,
                lifeSupport: c.enrollmentDetails?.lifesupport === 1,
                billingPreference: c.enrollmentDetails?.billingpreference || 0,
                directDebit: c.debitDetails?.optIn === 1,
                accountType: c.debitDetails?.accountType || 0,
                debitFirstName: c.debitDetails?.firstName || '',
                debitLastName: c.debitDetails?.lastName || '',
                bankName: c.debitDetails?.bankName || '',
                bankAddress: c.debitDetails?.bankAddress || '',
                bsb: c.debitDetails?.bsb || '',
                accountNumber: c.debitDetails?.accountNumber || '',
                paymentFrequency: c.debitDetails?.paymentFrequency || 0,
                firstDebitDate: c.debitDetails?.firstDebitDate ? c.debitDetails.firstDebitDate.split('T')[0] : '',
                tariffCode: c.tariffCode || '',
                discount: c.discount || 0,
            });

            if (c.phoneVerifiedAt) {
                setPhoneVerified(true);
                setPhoneVerifiedAt(c.phoneVerifiedAt);
                setOtpSent(true);
            }

            // Prefill address search field
            if (c.address) {
                const fullAddress = [
                    c.address.unitNumber ? `${c.address.unitNumber}/` : '',
                    c.address.streetNumber,
                    c.address.streetName,
                    c.address.streetType,
                    c.address.suburb,
                    c.address.state,
                    c.address.postcode
                ].filter(Boolean).join(' ').trim();
                setAddressSearch(fullAddress);
            }

            if (c.tariffCode && ratePlans.length > 0) {
                const rp = ratePlans.find(r => r.codes === c.tariffCode);
                if (rp) setSelectedRatePlan(rp);
            }

            console.log('[Edit Mode] Customer data loaded:', c);
        }
    }, [customerData, ratePlans]);

    // Duplicate Check - Address
    useEffect(() => {
        if (isEditMode) return;
        const { streetNumber, streetName, suburb, postcode } = formData;
        if (!streetNumber || !streetName || !suburb || !postcode) return;

        const timer = setTimeout(async () => {
            try {
                const { data } = await checkAddressExists({
                    variables: {
                        address: {
                            unitNumber: formData.unitNumber || undefined,
                            streetNumber: formData.streetNumber,
                            streetName: formData.streetName,
                            streetType: formData.streetType || undefined,
                            suburb: formData.suburb,
                            postcode: formData.postcode,
                            state: formData.state || undefined,
                            country: formData.country || undefined,
                        }
                    }
                });
                if (data?.checkAddressExists) {
                    const existing = data.checkAddressExists;
                    setDuplicateErrors(prev => ({
                        ...prev,
                        address: `Address already exists: ${existing.firstName} ${existing.lastName} (${existing.customerId})`
                    }));
                } else {
                    setDuplicateErrors(prev => ({ ...prev, address: undefined }));
                }
            } catch (err) { console.error('Address check failed:', err); }
        }, 800);
        return () => clearTimeout(timer);
    }, [formData.unitNumber, formData.streetNumber, formData.streetName, formData.streetType, formData.suburb, formData.postcode, formData.state, isEditMode, checkAddressExists]);

    // Duplicate Check - NMI
    useEffect(() => {
        if (isEditMode) return;
        const nmi = formData.nmi;
        if (!nmi || nmi.length < 10) return;

        const timer = setTimeout(async () => {
            try {
                const { data } = await checkNmiExists({ variables: { nmi } });
                if (data?.checkNmiExists) {
                    const existing = data.checkNmiExists;
                    setDuplicateErrors(prev => ({
                        ...prev,
                        nmi: `NMI already exists: ${existing.firstName} ${existing.lastName} (${existing.customerId})`
                    }));
                } else {
                    setDuplicateErrors(prev => ({ ...prev, nmi: undefined }));
                }
            } catch (err) { console.error('NMI check failed:', err); }
        }, 800);
        return () => clearTimeout(timer);
    }, [formData.nmi, isEditMode, checkNmiExists]);

    // Immediate duplicate check functions
    const checkAddressDuplicate = async (addressData: {
        unitNumber?: string;
        streetNumber: string;
        streetName: string;
        streetType?: string;
        suburb: string;
        postcode: string;
        state?: string;
        country?: string;
    }) => {
        if (isEditMode) return;
        if (!addressData.streetNumber || !addressData.streetName || !addressData.suburb || !addressData.postcode) return;

        try {
            const { data } = await checkAddressExists({
                variables: {
                    address: {
                        unitNumber: addressData.unitNumber || undefined,
                        streetNumber: addressData.streetNumber,
                        streetName: addressData.streetName,
                        streetType: addressData.streetType || undefined,
                        suburb: addressData.suburb,
                        postcode: addressData.postcode,
                        state: addressData.state || undefined,
                        country: addressData.country || undefined,
                    }
                }
            });
            if (data?.checkAddressExists) {
                const existing = data.checkAddressExists;
                setDuplicateErrors(prev => ({
                    ...prev,
                    address: `Address already exists: ${existing.firstName} ${existing.lastName} (${existing.customerId})`
                }));
            } else {
                setDuplicateErrors(prev => ({ ...prev, address: undefined }));
            }
        } catch (err) {
            console.error('Address check failed:', err);
        }
    };

    const checkNmiDuplicate = async (nmi: string) => {
        if (isEditMode) return;
        if (!nmi || nmi.length < 10) return;

        try {
            const { data } = await checkNmiExists({ variables: { nmi } });
            if (data?.checkNmiExists) {
                const existing = data.checkNmiExists;
                setDuplicateErrors(prev => ({
                    ...prev,
                    nmi: `NMI already exists: ${existing.firstName} ${existing.lastName} (${existing.customerId})`
                }));
            } else {
                setDuplicateErrors(prev => ({ ...prev, nmi: undefined }));
            }
        } catch (err) {
            console.error('NMI check failed:', err);
        }
    };

    // Handlers
    const handleSendOTP = async () => {
        if (!formData.phone?.trim()) return toast.error('Enter a mobile number first');
        if (phoneVerified) return toast.info('Phone is already verified');
        setOtpSending(true);
        try {
            await sendVerification(formData.phone);
            setOtpSent(true);
            toast.success('Verification code sent');
        } catch (err: any) { toast.error(err.message || 'Failed to send verification code'); }
        finally { setOtpSending(false); }
    };

    const handleVerifyOTP = async () => {
        if (!otpCode.trim()) return setVerificationError('Enter code');
        setOtpVerifying(true);
        setVerificationError('');
        try {
            const ok = await checkVerification(formData.phone, otpCode);
            if (ok) {
                setPhoneVerified(true);
                setPhoneVerifiedAt(new Date().toISOString());
                toast.success('Phone verified successfully');
                setVerificationError('');
            } else { setVerificationError('Invalid code'); }
        } catch (err: any) { setVerificationError('Verification failed'); }
        finally { setOtpVerifying(false); }
    };

    const handleTariffChange = (code: string) => {
        setFormData(prev => ({ ...prev, tariffCode: code }));
        const rp = ratePlans.find(r => r.codes === code);
        setSelectedRatePlan(rp || null);
        if (rp) {
            setFormData(prev => ({ ...prev, discount: rp.discountPercentage || 0 }));
        }
    };

    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Field-level validation
    const validateField = (name: string, value: any): string => {
        if (!value && name !== 'unitNumber') return ''; // Empty check handled below if we want strict required msg, OR relying on structure. 
        // NOTE: The user requested validation ON touched. 
        // If I return '' for empty, then purely required fields won't show error on blur if empty?
        // Let's make explicit required checks for fields that are required.

        const isRequired = ['firstName', 'lastName', 'email', 'phone', 'streetNumber', 'streetName', 'suburb', 'postcode', 'nmi'].includes(name);
        if (isRequired && (!value || (typeof value === 'string' && !value.trim()))) {
            return 'This field is required';
        }

        switch (name) {
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
                break;
            case 'phone':
                if (!/^\d+$/.test(value.replace(/\s/g, ''))) return 'Mobile number must contain digits only';
                if (value.replace(/\s/g, '').length < 10) return 'Mobile number must be at least 10 digits';
                break;
            case 'nmi':
                if (!/^\d+$/.test(value)) return 'NMI must contain digits only';
                // if (value.length !== 10 && value.length !== 11) return 'NMI must be 10 or 11 digits';
                break;
            case 'postcode':
                if (!/^\d{4}$/.test(value)) return 'Postcode must be 4 digits';
                break;
        }
        return '';
    };

    const handleBlur = (field: keyof CustomerFormData) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, formData[field]);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const updateField = (field: keyof CustomerFormData, value: any) => {
        // Enforce input masking for specific fields
        let finalValue = value;

        if (field === 'phone' || field === 'nmi') {
            // Remove non-numeric characters for these fields if user is typing
            // Allow spaces for phone for readability if desired, but request said "only number should be able to write"
            // Let's implement strict number enforcement for simplicity as per request
            if (typeof value === 'string') {
                finalValue = value.replace(/\D/g, '');
            }
        }


        setFormData(prev => ({ ...prev, [field]: finalValue }));
        setIsFormDirty(true);

        // If already touched, validate immediately
        if (touched[field]) {
            const error = validateField(field, finalValue);
            setErrors(prev => ({ ...prev, [field]: error }));
        } else if (errors[field]) {
            // Clear error if it exists but field is "untouched" (unlikely but good safety) or just clear it
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Validation
    const step0Valid = useMemo(() => {
        const required = !!(
            formData.phone?.trim() &&
            formData.streetNumber?.trim() &&
            formData.streetName?.trim() &&
            formData.suburb?.trim() &&
            formData.postcode?.trim() &&
            formData.nmi?.trim() &&
            !duplicateErrors.address &&
            !duplicateErrors.nmi
        );
        if (formData.propertyType === 1) {
            return required && !!(formData.businessName?.trim() && formData.abn?.trim());
        }
        return required;
    }, [formData, duplicateErrors]);

    const step1Valid = useMemo(() => !!formData.tariffCode, [formData.tariffCode]);

    const step2Valid = useMemo(() => {
        return !!(
            formData.firstName?.trim() &&
            formData.lastName?.trim() &&
            formData.email?.trim() &&
            formData.connectionDate
        );
    }, [formData]);

    const canProceed = () => {
        switch (currentStep) {
            case 0: return step0Valid;
            case 1: return step1Valid;
            case 2: return step2Valid;
            default: return true;
        }
    };

    // Submit
    const handleSubmit = async (targetStatus: number = 1) => {
        setSubmittingStatus(targetStatus);
        // Temporarily disable dirty check to allow navigation
        setIsFormDirty(false);
        try {
            const input = {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                businessName: formData.businessName,
                abn: formData.abn,
                showAsBusinessName: formData.showAsBusinessName,
                showName: formData.showName,
                number: formData.phone,
                dob: formData.dob || null,
                phoneVerifiedAt: phoneVerifiedAt,
                propertyType: formData.propertyType,
                tariffCode: formData.tariffCode,
                discount: formData.discount,
                status: targetStatus,
                enrollmentDetails: {
                    saletype: formData.saleType,
                    connectiondate: formData.connectionDate || null,
                    idtype: formData.idType,
                    idnumber: formData.idNumber || undefined,
                    idstate: formData.idState || undefined,
                    idexpiry: formData.idExpiry || null,
                    concession: formData.concession ? 1 : 0,
                    lifesupport: formData.lifeSupport ? 1 : 0,
                    billingpreference: formData.billingPreference,
                },
                address: {
                    unitNumber: formData.unitNumber || undefined,
                    streetNumber: formData.streetNumber,
                    streetName: formData.streetName,
                    streetType: formData.streetType || undefined,
                    suburb: formData.suburb,
                    state: formData.state,
                    postcode: formData.postcode,
                    country: formData.country || 'Australia',
                    nmi: formData.nmi || undefined,
                },
                solarDetails: formData.hasSolar ? {
                    hassolar: 1,
                    solarcapacity: formData.solarCapacity ? parseFloat(formData.solarCapacity) : undefined,
                    invertercapacity: formData.inverterCapacity ? parseFloat(formData.inverterCapacity) : undefined,
                } : { hassolar: 0 },
                batteryDetails: formData.batteryBrand ? {
                    batterybrand: formData.batteryBrand,
                    snnumber: formData.snNumber || undefined,
                    batterycapacity: formData.batteryCapacity ? parseFloat(formData.batteryCapacity) : undefined,
                    exportlimit: formData.exportLimit ? parseFloat(formData.exportLimit) : undefined,
                } : undefined,
                vppDetails: {
                    vpp: formData.vpp ? 1 : 0,
                    vppConnected: formData.vppConnected ? 1 : 0,
                    vppSignupBonus: formData.vppSignupBonus ? parseFloat(formData.vppSignupBonus) : undefined,
                },
                debitDetails: undefined,
                rateVersion: activeRateVersion,
            };

            if (isEditMode) {
                const { data } = await updateCustomer({ variables: { uid, input } });
                toast.success(data?.updateCustomer?.message || 'Customer updated successfully');
            } else {
                const { data } = await createCustomer({ variables: { input } });
                toast.success(data?.createCustomer?.message || 'Customer created successfully');
            }
            // Clear customer cache to ensure fresh data on customers page
            apolloClient.cache.evict({ fieldName: 'customers' });
            apolloClient.cache.evict({ fieldName: 'customersCursor' });
            apolloClient.cache.gc();
            navigate('/customers');
        } catch (err: any) {
            console.error('Failed to save customer:', err);
            toast.error(err.message || 'Failed to save customer');
            // Re-enable dirty check if failed
            setIsFormDirty(true);
        } finally { setSubmittingStatus(null); }
    };

    // Navigation Blocking
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isFormDirty && currentLocation.pathname !== nextLocation.pathname
    );

    // Browser Refresh/Close Warning
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isFormDirty) {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isFormDirty]);

    if (isEditMode && isLoadingCustomer) {
        return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div></div>;
    }

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="cursor-pointer hover:text-foreground" onClick={() => navigate('/customers')}>Customers</span>
                <ChevronRightIcon size={14} />
                <span className="text-foreground font-medium">{isEditMode ? 'Edit Customer' : 'New Customer'}</span>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 items-start">
                {/* Main Content Area */}
                <div className="flex-1 space-y-6 min-w-0 w-full">
                    {/* Stepper */}
                    <div className="flex flex-wrap gap-3">
                        <div onClick={() => setCurrentStep(0)}><StepBadge index={1} label="Contact" active={currentStep === 0} done={currentStep > 0} status={phoneVerified ? 'Verified' : undefined} statusTone={phoneVerified ? 'success' : undefined} /></div>
                        <div onClick={() => step0Valid && setCurrentStep(1)}><StepBadge index={2} label="Pricing" active={currentStep === 1} done={currentStep > 1} /></div>
                        <div onClick={() => step1Valid && setCurrentStep(2)}><StepBadge index={3} label="Sign-up" active={currentStep === 2} done={currentStep > 2} /></div>
                        <div onClick={() => step2Valid && setCurrentStep(3)}><StepBadge index={4} label="Confirm" active={currentStep === 3} done={false} /></div>
                    </div>

                    {/* Content Card */}
                    <div className="bg-background rounded-xl border border-border shadow-sm p-6 lg:p-6 flex flex-col h-[calc(100vh-180px)]">
                        {/* Form Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto pr-2">

                            {/* Step 0: Contact & Property */}
                            {currentStep === 0 && (
                                <div className="space-y-8">
                                    {/* Identity & Contact */}
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                                            <UserIcon size={20} /> Identity
                                        </h2>


                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Field label="Mobile" required error={errors.phone}>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <Input containerClassName="w-full sm:w-64" placeholder="+61 400 000 000" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} onBlur={() => handleBlur('phone')} />
                                                    <button
                                                        onClick={handleSendOTP}
                                                        type="button"
                                                        className={`px-3 py-2 rounded-xl text-sm border flex items-center gap-2 ${otpSending || !formData.phone || phoneVerified
                                                            ? 'border-neutral-300 dark:border-neutral-600 text-neutral-400 dark:text-neutral-500 opacity-60 cursor-not-allowed'
                                                            : 'border-primary bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30'
                                                            }`}
                                                        disabled={otpSending || !formData.phone || phoneVerified}
                                                    >
                                                        {otpSending && (
                                                            <span
                                                                className="h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin"
                                                                aria-hidden="true"
                                                            ></span>
                                                        )}
                                                        <span>
                                                            {otpSending ? 'Sending…' : otpSent ? 'Resend' : 'Send code'}
                                                        </span>
                                                    </button>
                                                    <div className="relative">
                                                        <input
                                                            className={`w-28 px-3 py-2 rounded-xl border bg-background text-foreground ${phoneVerified
                                                                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                                                                : verificationError
                                                                    ? 'border-red-500 focus:ring-red-200'
                                                                    : 'border-border'
                                                                }`}
                                                            placeholder="Code"
                                                            value={otpCode}
                                                            onChange={(e) => {
                                                                setOtpCode(e.target.value);
                                                                if (verificationError) setVerificationError('');
                                                            }}
                                                            disabled={phoneVerified}
                                                            maxLength={6}
                                                        />
                                                        {verificationError && (
                                                            <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-medium whitespace-nowrap">
                                                                {verificationError}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={handleVerifyOTP}
                                                        type="button"
                                                        className={`px-3 py-2 rounded-xl text-sm flex items-center gap-2 ${phoneVerified
                                                            ? 'bg-green-600 text-white'
                                                            : 'border border-primary bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30'
                                                            } ${otpVerifying || phoneVerified || !otpSent || !otpCode
                                                                ? 'opacity-70 cursor-not-allowed'
                                                                : ''
                                                            }`}
                                                        disabled={otpVerifying || phoneVerified || !otpSent || !otpCode}
                                                    >
                                                        {otpVerifying && (
                                                            <span
                                                                className="h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin"
                                                                aria-hidden="true"
                                                            ></span>
                                                        )}
                                                        <span>{phoneVerified ? 'Verified ✓' : otpVerifying ? 'Verifying…' : 'Verify'}</span>
                                                    </button>
                                                    {phoneVerified && phoneVerifiedAt && (
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            at {formatDateTime(phoneVerifiedAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </Field>

                                            <Field label="Property Type">
                                                <div className="flex gap-2">
                                                    {(['residential', 'commercial'] as const).map((type, idx) => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => updateField('propertyType', idx)}
                                                            className={`px-4 py-2 rounded-full border text-sm capitalize transition-colors ${formData.propertyType === idx ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-accent'}`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </Field>
                                        </div>

                                        {formData.propertyType === 1 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-xl border border-dashed border-border">
                                                <div className="col-span-1 md:col-span-2 flex flex-col gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="showAsBusinessName"
                                                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                                            checked={formData.showAsBusinessName}
                                                            onChange={(e) => {
                                                                const newValue = e.target.checked;
                                                                if (!newValue && !formData.showName) {
                                                                    // Prevent unchecking if it's the last one, or force specific behavior?
                                                                    // User requirement: "both cannot be unchecked"
                                                                    // If I uncheck this, showName MUST be true.
                                                                    // If showName is false, keep this checked OR check showName.
                                                                    // Decision: Prevent uncheck if the other is invalid? Or auto-check the other.
                                                                    // Auto-check the other is smoother.
                                                                    updateField('showName', true);
                                                                }
                                                                updateField('showAsBusinessName', newValue);
                                                            }}
                                                        />
                                                        <label htmlFor="showAsBusinessName" className="text-sm cursor-pointer select-none">Show as Business Name</label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="showName"
                                                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                                            checked={formData.showName ?? true}
                                                            onChange={(e) => {
                                                                const newValue = e.target.checked;
                                                                if (!newValue && !formData.showAsBusinessName) {
                                                                    updateField('showAsBusinessName', true);
                                                                }
                                                                updateField('showName', newValue);
                                                            }}
                                                        />
                                                        <label htmlFor="showName" className="text-sm cursor-pointer select-none">Show Name in Offer</label>
                                                    </div>
                                                </div>
                                                <Input label="Business Name" required error={errors.businessName} placeholder="Registered business name" value={formData.businessName} onChange={(e) => updateField('businessName', e.target.value)} />
                                                <Input label="ABN" required error={errors.abn} placeholder="e.g. 12 345 678 901" value={formData.abn} onChange={(e) => updateField('abn', e.target.value)} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Solar & VPP - Collapsible */}
                                    <details open={formData.hasSolar} className="rounded-xl border border-border group">
                                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-accent rounded-xl">
                                            <div className="flex items-center gap-2 font-medium">
                                                <ZapIcon size={20} className="text-yellow-500" />
                                                <span>Solar at this property?</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <ToggleSwitch checked={formData.hasSolar} onChange={(checked) => updateField('hasSolar', checked)} />
                                                <span className="text-sm text-neutral-600 w-20 text-right">{formData.hasSolar ? 'Has Solar' : 'No Solar'}</span>
                                                <div className="transform transition-transform group-open:rotate-180"><ChevronRightIcon size={16} className="rotate-90" /></div>
                                            </div>
                                        </summary>

                                        {formData.hasSolar && (
                                            <div className="p-4 border-t border-border space-y-6 bg-muted/30">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input label="Solar Capacity (kW)" type="number" step="any" placeholder="6.6" value={formData.solarCapacity} onChange={(e) => updateField('solarCapacity', e.target.value)} />
                                                    <Input label="Inverter Capacity (kW)" type="number" step="any" placeholder="5.0" value={formData.inverterCapacity} onChange={(e) => updateField('inverterCapacity', e.target.value)} />
                                                </div>
                                            </div>
                                        )}
                                    </details>

                                    {/* VPP Section - Standalone */}
                                    <details open={formData.vpp} className="rounded-xl border border-border group bg-background">
                                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-accent rounded-xl">
                                            <div className="flex items-center gap-2 font-medium">
                                                {/* Reuse ZapIcon or add a BatteryIcon if available, sticking to existing style for now */}
                                                <ZapIcon size={20} className="text-green-600" />
                                                <span>VPP participant</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <ToggleSwitch checked={formData.vpp} onChange={(checked) => updateField('vpp', checked)} />
                                                <span className="text-sm text-neutral-600 w-20 text-right">{formData.vpp ? 'Active' : 'Inactive'}</span>
                                                <div className="transform transition-transform group-open:rotate-180"><ChevronRightIcon size={16} className="rotate-90" /></div>
                                            </div>
                                        </summary>
                                        {formData.vpp && (
                                            <div className="p-4 space-y-4 border-t border-border">
                                                <div className="p-3 rounded-xl border border-dashed border-border bg-muted/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div>
                                                        <div className="text-sm font-semibold text-foreground uppercase tracking-tight">VPP signup bonus</div>
                                                        <div className="text-[10px] text-muted-foreground">Eligible customers receive a $50 monthly bill credit for 12 months ($600 total).</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateField('vppSignupBonus', formData.vppSignupBonus === '600' ? '' : '600')}
                                                        className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-colors ${formData.vppSignupBonus === '600' ? 'bg-green-600 text-white border-green-600' : 'border-neutral-300 dark:border-zinc-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-zinc-700'}`}
                                                    >
                                                        {formData.vppSignupBonus === '600' ? 'Bonus Applied' : 'Add $600 signup bonus'}
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <Select label="Battery brand" options={batteryBrandOptions} value={formData.batteryBrand} onChange={(val) => updateField('batteryBrand', val as string)} placeholder="Select.." />
                                                    <Input label="SN number" placeholder="SN123456" value={formData.snNumber} onChange={(e) => updateField('snNumber', e.target.value)} />
                                                    <Input label="Battery capacity(kW)" type="number" step="any" placeholder="13.5" value={formData.batteryCapacity} onChange={(e) => updateField('batteryCapacity', e.target.value)} />
                                                    <Input label="Export limit(kW)" type="number" step="any" placeholder="5.0" value={formData.exportLimit} onChange={(e) => updateField('exportLimit', e.target.value)} />
                                                    <Input label="Signup bonus" disabled value={formData.vppSignupBonus === '600' ? '$50 monthly bill credit for 12 months (total $600)' : formData.vppSignupBonus} onChange={(e) => updateField('vppSignupBonus', e.target.value)} placeholder="—" />
                                                </div>
                                            </div>
                                        )}
                                    </details>

                                    {/* Address */}
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                                            <HomeIcon size={20} /> Address
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Field label="Address" hint="Start typing to verify address" required error={duplicateErrors.address}>
                                                <LocationAutocomplete
                                                    value={addressSearch}
                                                    onChange={setAddressSearch}
                                                    onSelect={(place) => {
                                                        setAddressSearch(place.address);
                                                        const newAddressData = {
                                                            unitNumber: place.unitNumber || '',
                                                            streetNumber: place.streetNumber || '',
                                                            streetName: place.streetName || '',
                                                            streetType: place.streetType || '',
                                                            suburb: place.suburb || '',
                                                            state: place.state || '',
                                                            postcode: place.postcode || '',
                                                            country: place.country || 'Australia',
                                                        };
                                                        setFormData(prev => ({ ...prev, ...newAddressData }));
                                                        // Immediately check for duplicate address
                                                        checkAddressDuplicate(newAddressData);
                                                    }}
                                                    placeholder="Start typing address..."
                                                />
                                            </Field>
                                            <Input
                                                label="NMI"
                                                required
                                                helperText="10-11 digits"
                                                error={errors.nmi || duplicateErrors.nmi}
                                                value={formData.nmi}
                                                onChange={(e) => updateField('nmi', e.target.value)}
                                                onBlur={() => {
                                                    handleBlur('nmi');
                                                    // Immediately check for duplicate NMI
                                                    checkNmiDuplicate(formData.nmi);
                                                }}
                                                maxLength={11}
                                                placeholder="1234567890"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                                            <div className="col-span-2 lg:col-span-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Detailed Breakdown</div>
                                            <Input label="Unit No." disabled className="bg-background" value={formData.unitNumber} onChange={(e) => updateField('unitNumber', e.target.value)} onBlur={() => handleBlur('unitNumber')} placeholder="1A" />
                                            <Input label="Street No." disabled required error={errors.streetNumber} className="bg-background" value={formData.streetNumber} onChange={(e) => updateField('streetNumber', e.target.value)} onBlur={() => handleBlur('streetNumber')} placeholder="123" />
                                            <Input label="Street Name" disabled required error={errors.streetName} className="bg-background" value={formData.streetName} onChange={(e) => updateField('streetName', e.target.value)} onBlur={() => handleBlur('streetName')} placeholder="Main" />
                                            <Select label="Type" disabled options={streetTypeOptions} value={formData.streetType} onChange={(val) => updateField('streetType', val)} placeholder="St" />
                                            <Input label="Suburb" disabled required error={errors.suburb} className="bg-background" value={formData.suburb} onChange={(e) => updateField('suburb', e.target.value)} onBlur={() => handleBlur('suburb')} placeholder="Sydney" />
                                            <Select label="State" disabled options={STATE_OPTIONS} value={formData.state} onChange={(val) => updateField('state', val as string)} placeholder="NSW" />
                                            <Input label="Postcode" disabled required error={errors.postcode} className="bg-background" value={formData.postcode} onChange={(e) => updateField('postcode', e.target.value)} onBlur={() => handleBlur('postcode')} maxLength={4} placeholder="2000" />
                                            <Input label="Country" disabled className="bg-background" value={formData.country} onChange={(e) => updateField('country', e.target.value)} />
                                        </div>


                                    </div>
                                </div>
                            )}

                            {/* Step 1: Pricing */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-border pb-2">
                                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                            <ShieldIcon size={20} className="text-neutral-700" /> Select tariff & discount
                                            <div className="ml-2 px-2.5 py-1 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs font-mono tracking-tight flex items-center gap-1">
                                                <span className="opacity-60">v.</span>
                                                {(isEditMode && customerRateVersion) ? customerRateVersion : activeRateVersion}
                                            </div>
                                        </h2>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Role limited</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                                        <Select label="Tariff Code" required options={tariffOptions} value={formData.tariffCode} onChange={(val) => handleTariffChange(val as string)} placeholder="Select tariff" />
                                        <div className="space-y-1.5">
                                            <Select label="Discount" options={discountOptions} value={formData.discount.toString()} onChange={(val) => updateField('discount', parseFloat(val as string))} placeholder="Select discount" />
                                            {!selectedRatePlan?.discountApplies && (
                                                <p className="text-[10px] text-muted-foreground italic px-0.5">Discount not available for this plan.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {selectedRatePlan?.offers?.map((offer) => {
                                            const discount = formData.discount || 0;
                                            const hasCL = (offer.cl1Usage || 0) > 0 || (offer.cl2Usage || 0) > 0;
                                            const hasFiT = (offer.fit || 0) > 0 || (offer.fitPeak || 0) > 0 || (offer.fitCritical || 0) > 0 || (offer.fitVpp || 0) > 0;

                                            // Calculate yearly savings estimation
                                            // Typical annual usage: 4000 kWh residential, 10000 kWh commercial
                                            // const typicalKwh = formData.propertyType === 1 ? 10000 : 4000;

                                            // // Get primary energy rate (anytime if flat rate, or weighted average for TOU)
                                            // const getBaseEnergyRate = () => {
                                            //     if (offer.anytime > 0) return offer.anytime;
                                            //     // For TOU tariffs, use weighted average (40% peak, 30% shoulder, 30% off-peak typical distribution)
                                            //     const touRates = [];
                                            //     if (offer.peak > 0) touRates.push({ rate: offer.peak, weight: 0.4 });
                                            //     if (offer.shoulder > 0) touRates.push({ rate: offer.shoulder, weight: 0.3 });
                                            //     if (offer.offPeak > 0) touRates.push({ rate: offer.offPeak, weight: 0.3 });
                                            //     if (touRates.length === 0) return 0;
                                            //     // Normalize weights
                                            //     const totalWeight = touRates.reduce((sum, r) => sum + r.weight, 0);
                                            //     return touRates.reduce((sum, r) => sum + (r.rate * r.weight / totalWeight), 0);
                                            // };

                                            // const baseRate = getBaseEnergyRate();
                                            // const usageCost = baseRate * typicalKwh;
                                            // const yearlySaving = (usageCost * discount) / 100;

                                            // Helper to render rate with discount logic
                                            const renderRate = (label: string, value: number, colorClass: string = 'blue') => {
                                                const finalRate = calculateDiscountedRate(value, discount);
                                                const colors = {
                                                    blue: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
                                                    orange: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400',
                                                };
                                                const theme = colors[colorClass as keyof typeof colors] || colors.blue;
                                                const [bg, darkBg, border, darkBorder, text, darkText] = theme.split(' ');

                                                return (
                                                    <div className={`${bg} ${darkBg} border ${border} ${darkBorder} rounded-lg p-3 text-center space-y-0.5`}>
                                                        <div className={`${text} ${darkText} font-bold text-base tracking-tight`}>${finalRate.toFixed(4)}/kWh</div>
                                                        <div className={`text-[10px] font-bold ${text} ${darkText} uppercase tracking-wider opacity-80`}>{label}</div>
                                                    </div>
                                                );
                                            };

                                            // Helper for Controlled Load (Green)
                                            const renderCL = (label: string, value: number) => {
                                                const finalRate = calculateDiscountedRate(value, discount);
                                                return (
                                                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center space-y-0.5">
                                                        <div className="text-green-600 dark:text-green-400 font-bold text-base tracking-tight">${finalRate.toFixed(4)}/kWh</div>
                                                        <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider opacity-80">{label}</div>
                                                    </div>
                                                );
                                            };

                                            return (
                                                <div key={offer.id} className="p-6 bg-card border border-border rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div>
                                                            <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">{offer.offerName}</h3>
                                                        </div>
                                                    </div>

                                                    <div className={`grid grid-cols-1 ${hasFiT && hasCL ? 'md:grid-cols-4' : (hasFiT || hasCL ? 'md:grid-cols-3' : 'md:grid-cols-2')} gap-8`}>
                                                        {/* Column 1: Energy Rates */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 text-[#2563EB]">
                                                                <Settings2Icon size={16} />
                                                                <h4 className="text-sm font-bold uppercase tracking-wide">Energy Rates</h4>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {offer.peak > 0 && renderRate('Peak', offer.peak, 'blue')}
                                                                {offer.offPeak > 0 && renderRate('Off-Peak', offer.offPeak, 'blue')}
                                                                {offer.shoulder > 0 && renderRate('Shoulder', offer.shoulder, 'blue')}
                                                                {offer.anytime > 0 && renderRate('Anytime', offer.anytime, 'orange')}
                                                            </div>
                                                        </div>

                                                        {/* Column 2: Supply Charges */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 text-purple-600">
                                                                <PlugIcon size={16} />
                                                                <h4 className="text-sm font-bold uppercase tracking-wide">Supply Charges</h4>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center space-y-0.5">
                                                                    <div className="text-purple-600 dark:text-purple-400 font-bold text-base tracking-tight">${offer.supplyCharge.toFixed(4)}/day</div>
                                                                </div>

                                                                {(offer.vppOrcharge || 0) > 0 && (
                                                                    <div className="space-y-2 pt-2">
                                                                        <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
                                                                            <ActivityIcon size={16} />
                                                                            <h4 className="text-sm font-bold uppercase tracking-wide">VPP Orchestration Charges</h4>
                                                                        </div>
                                                                        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center space-y-0.5">
                                                                            <div className="text-amber-600 dark:text-amber-400 font-bold text-base tracking-tight">${offer.vppOrcharge.toFixed(4)}/day</div>
                                                                            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider opacity-80">Orchestration</div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Column 3: Solar FiT */}
                                                        {hasFiT && (
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2 text-teal-500 dark:text-teal-400">
                                                                    <ZapIcon size={16} />
                                                                    <h4 className="text-sm font-bold uppercase tracking-wide">Solar FiT</h4>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    {(offer.fit || 0) > 0 && (
                                                                        <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center space-y-0.5">
                                                                            <div className="text-teal-800 dark:text-teal-300 font-bold text-base tracking-tight">${offer.fit.toFixed(4)}/kWh</div>
                                                                            <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">Feed-in</div>
                                                                        </div>
                                                                    )}
                                                                    {(offer.fitPeak || 0) > 0 && (
                                                                        <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center space-y-0.5">
                                                                            <div className="text-teal-800 dark:text-teal-300 font-bold text-base tracking-tight">${offer.fitPeak.toFixed(4)}/kWh</div>
                                                                            <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">FiT Peak</div>
                                                                        </div>
                                                                    )}
                                                                    {(offer.fitCritical || 0) > 0 && (
                                                                        <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center space-y-0.5">
                                                                            <div className="text-teal-800 dark:text-teal-300 font-bold text-base tracking-tight">${offer.fitCritical.toFixed(4)}/kWh</div>
                                                                            <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">FiT Critical</div>
                                                                        </div>
                                                                    )}
                                                                    {(offer.fitVpp || 0) > 0 && (
                                                                        <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center space-y-0.5">
                                                                            <div className="text-teal-800 dark:text-teal-300 font-bold text-base tracking-tight">${offer.fitVpp.toFixed(4)}/kWh</div>
                                                                            <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">FiT VPP</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Column 4: Controlled Load */}
                                                        {hasCL && (
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2 text-green-600">
                                                                    <PlugIcon size={16} />
                                                                    <h4 className="text-sm font-bold uppercase tracking-wide">Controlled Load</h4>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    {offer.cl1Usage > 0 && renderCL('CL1 Usage', offer.cl1Usage)}
                                                                    {offer.cl2Usage > 0 && renderCL('CL2 Usage', offer.cl2Usage)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Sign-up */}
                            {currentStep === 2 && (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Personal & Enrollment Details</h2>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <Input label="First Name" required error={errors.firstName} placeholder="e.g. Alex" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} onBlur={() => handleBlur('firstName')} />
                                                <Input label="Last Name" required error={errors.lastName} placeholder="e.g. Taylor" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} onBlur={() => handleBlur('lastName')} />
                                                <Input label="Email" required helperText="We'll send confirmations here" error={errors.email} type="email" placeholder="name@example.com" value={formData.email} onChange={(e) => updateField('email', e.target.value)} onBlur={() => handleBlur('email')} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <DatePicker
                                                label="Date of Birth"
                                                value={formData.dob}
                                                onChange={(date) => updateField('dob', date ? date.toISOString().split('T')[0] : '')}
                                                maxDate={new Date()}
                                            />
                                            <Select label="Sale Type" options={SALE_TYPE_OPTIONS} value={formData.saleType.toString()} onChange={(val) => updateField('saleType', parseInt(val as string))} />
                                            <DatePicker label="Connection Date" required value={formData.connectionDate} onChange={(date) => updateField('connectionDate', date ? date.toISOString().split('T')[0] : '')} minDate={new Date()} />
                                            <Select label="Billing Preference" options={BILLING_PREF_OPTIONS} value={formData.billingPreference.toString()} onChange={(val) => updateField('billingPreference', parseInt(val as string))} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <Select label="ID Type" options={ID_TYPE_OPTIONS} value={formData.idType.toString()} onChange={(val) => updateField('idType', parseInt(val as string))} />
                                            <Input label="ID Number" placeholder="D123456" value={formData.idNumber} onChange={(e) => updateField('idNumber', e.target.value)} />
                                            <Select label="ID State" options={STATE_OPTIONS} value={formData.idState} onChange={(val) => updateField('idState', val as string)} />
                                            <DatePicker label="ID Expiry" value={formData.idExpiry} onChange={(date) => updateField('idExpiry', date ? date.toISOString().split('T')[0] : '')} minDate={new Date()} />
                                        </div>
                                        <div className="flex flex-wrap gap-6 pt-2">

                                            <ToggleSwitch
                                                checked={formData.concession}
                                                onChange={(c) => {
                                                    if (c) {
                                                        setRestrictedFeatureError(true);
                                                    } else {
                                                        updateField('concession', false);
                                                    }
                                                }}
                                            /><span className="text-sm">Concession Card Holder</span>
                                            <ToggleSwitch
                                                checked={formData.lifeSupport}
                                                onChange={(c) => {
                                                    if (c) {
                                                        setRestrictedFeatureError(true);
                                                    } else {
                                                        updateField('lifeSupport', false);
                                                    }
                                                }}
                                            /><span className="text-sm">Life Support Equipment</span>
                                        </div>
                                    </div>



                                </div>
                            )}

                            {/* Step 3: Confirmation */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Review & Confirm</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                            <div>
                                                <h3 className="font-medium mb-3 flex items-center gap-2"><UserIcon size={16} className="text-blue-600" /> Customer Information</h3>
                                                <div className="space-y-1 text-sm bg-card p-3 rounded border border-border">
                                                    <p className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></p>
                                                    <p className="flex justify-between"><span className="text-muted-foreground">Email:</span> <span className="font-medium">{formData.email}</span></p>
                                                    <p className="flex justify-between"><span className="text-muted-foreground">Mobile:</span> <span className="font-medium">{formData.phone} {phoneVerified && '✓'}</span></p>
                                                    <p className="flex justify-between"><span className="text-muted-foreground">DOB:</span> <span className="font-medium">{formData.dob || '—'}</span></p>
                                                    <p className="flex justify-between"><span className="text-muted-foreground">Type:</span> <span className="capitalize font-medium">{formData.propertyType === 1 ? 'Commercial' : 'Residential'}</span></p>
                                                    {formData.propertyType === 1 && (
                                                        <>
                                                            <p className="flex justify-between"><span className="text-muted-foreground">Business:</span> <span className="font-medium">{formData.businessName}</span></p>
                                                            <p className="flex justify-between"><span className="text-muted-foreground">ABN:</span> <span className="font-medium">{formData.abn}</span></p>
                                                            <p className="flex justify-between"><span className="text-muted-foreground">Show as Business:</span> <span className="font-medium text-xs bg-muted px-1.5 py-0.5 rounded">{formData.showAsBusinessName ? 'Yes' : 'No'}</span></p>
                                                            <p className="flex justify-between"><span className="text-muted-foreground">Show Name in Offer:</span> <span className="font-medium text-xs bg-muted px-1.5 py-0.5 rounded">{(formData.showName ?? true) ? 'Yes' : 'No'}</span></p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="font-medium mb-3 flex items-center gap-2"><MapPinIcon size={16} className="text-blue-600" /> Service Address</h3>
                                                <div className="space-y-1 text-sm bg-card p-3 rounded border border-border">
                                                    <div className="font-medium">
                                                        {formData.unitNumber && `Unit ${formData.unitNumber}, `}{formData.streetNumber} {formData.streetName} {formData.streetType}
                                                        <br />
                                                        {formData.suburb}, {formData.state} {formData.postcode}
                                                        <br />
                                                        {formData.country}
                                                    </div>
                                                    <div className="pt-2 border-t border-border mt-2">
                                                        <p className="flex justify-between"><span className="text-muted-foreground">NMI:</span> <span className="font-mono bg-muted px-1 rounded">{formData.nmi}</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                            <div>
                                                <h3 className="font-medium mb-3 flex items-center gap-2"><ShieldIcon size={16} className="text-blue-600" /> Plan & Pricing</h3>
                                                <div className="space-y-1 text-sm bg-card p-3 rounded border border-border">
                                                    <p className="flex justify-between"><span className="text-muted-foreground">Tariff Code:</span> <span className="font-medium">{formData.tariffCode}</span></p>
                                                    <p className="flex justify-between"><span className="text-muted-foreground">Discount:</span> <span className="font-medium badge bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">{formData.discount}%</span></p>
                                                    <p className="flex justify-between"><span className="text-muted-foreground">Distributor:</span> <span className="font-medium">{selectedRatePlan?.dnsp !== undefined ? (DNSP_MAP[selectedRatePlan.dnsp.toString()] || selectedRatePlan.dnsp) : '—'}</span></p>
                                                    <p className="flex justify-between"><span className="text-muted-foreground">Tariff Type:</span> <span className="font-medium">{selectedRatePlan?.tariff || '—'}</span></p>
                                                    <p className="flex justify-between"><span className="text-muted-foreground">Pricing Version:</span> <span className="font-medium font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{(isEditMode && customerRateVersion) ? customerRateVersion : activeRateVersion}</span></p>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="font-medium mb-3 flex items-center gap-2"><IdCardIcon size={16} className="text-blue-600" /> Enrollment Details</h3>
                                                <div className="space-y-1 text-sm bg-card p-3 rounded border border-border">
                                                    <p className="flex justify-between"><span className="text-muted-foreground">Sale Type:</span> <span className="font-medium">{SALE_TYPE_OPTIONS.find(o => o.value === formData.saleType.toString())?.label}</span></p>
                                                    <p className="flex justify-between"><span className="text-muted-foreground">Connection Date:</span> <span className="font-medium">{formData.connectionDate}</span></p>
                                                    <p className="flex justify-between"><span className="text-muted-foreground">Billing:</span> <span className="font-medium">{BILLING_PREF_OPTIONS.find(o => o.value === formData.billingPreference.toString())?.label}</span></p>
                                                    <div className="pt-2 border-t border-border mt-2">
                                                        <p className="flex justify-between"><span className="text-muted-foreground">ID Type:</span> <span className="font-medium">{ID_TYPE_OPTIONS.find(o => o.value === formData.idType.toString())?.label}</span></p>
                                                        <p className="flex justify-between"><span className="text-muted-foreground">ID Number:</span> <span className="font-medium">{formData.idNumber}</span></p>
                                                        <p className="flex justify-between"><span className="text-muted-foreground">Expiry:</span> <span className="font-medium">{formData.idExpiry || '—'}</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rate Details - Full Width Section */}
                                        {selectedRatePlan?.offers?.[0] && (
                                            <RateDetailsView offer={selectedRatePlan.offers[0]} discount={formData.discount || 0} />
                                        )}

                                        {(formData.hasSolar || formData.batteryBrand || formData.vpp) && (
                                            <div className="md:col-span-2 p-4 bg-muted/50 rounded-lg">
                                                <h3 className="font-medium mb-3 flex items-center gap-2"><ZapIcon size={16} className="text-blue-600" /> Technical Details</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {formData.hasSolar && (
                                                        <div className="space-y-1 text-sm bg-card p-3 rounded border border-border">
                                                            <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Solar System</p>
                                                            <p className="flex justify-between"><span className="text-muted-foreground">Capacity:</span> <span className="font-medium">{formData.solarCapacity} kW</span></p>
                                                            <p className="flex justify-between"><span className="text-muted-foreground">Inverter:</span> <span className="font-medium">{formData.inverterCapacity} kW</span></p>
                                                        </div>
                                                    )}
                                                    {formData.batteryBrand && (
                                                        <div className="space-y-1 text-sm bg-card p-3 rounded border border-border">
                                                            <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Battery Storage</p>
                                                            <p className="flex justify-between"><span className="text-muted-foreground">Brand:</span> <span className="font-medium">{formData.batteryBrand}</span></p>
                                                            <p className="flex justify-between"><span className="text-muted-foreground">Capacity:</span> <span className="font-medium">{formData.batteryCapacity} kWh</span></p>
                                                        </div>
                                                    )}
                                                    {formData.vpp && (
                                                        <div className="space-y-1 text-sm bg-card p-3 rounded border border-border">
                                                            <p className="font-medium text-xs uppercase text-muted-foreground mb-1">VPP & Bonuses</p>
                                                            <p className="flex justify-between"><span className="text-muted-foreground mr-2">VPP Participant:</span> <span className="font-medium text-green-600">Yes</span></p>
                                                            <div className="flex justify-between items-start gap-2">
                                                                <span className="text-muted-foreground shrink-0">Signup Bonus:</span>
                                                                <span className="font-medium text-right text-green-600">$50 monthly bill credit for 12 months (total $600)</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {(formData.concession || formData.lifeSupport) && (
                                            <div className="md:col-span-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                                                <h3 className="font-medium mb-2 flex items-center gap-2 text-amber-800"><ShieldIcon size={16} /> Important Declarations</h3>
                                                <div className="flex gap-4">
                                                    {formData.concession && <span className="px-2 py-1 bg-card rounded border border-amber-200 dark:border-amber-700 text-xs font-medium text-amber-900 dark:text-amber-300">Concession Card Holder</span>}
                                                    {formData.lifeSupport && <span className="px-2 py-1 bg-card rounded border border-amber-200 dark:border-amber-700 text-xs font-medium text-amber-900 dark:text-amber-300">Life Support Equipment</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Navigation - Fixed at bottom */}
                        <div className="flex items-center justify-between pt-6 border-t border-border mt-auto shrink-0">
                            <Button type="button" variant="ghost" onClick={() => currentStep > 0 ? setCurrentStep((currentStep - 1) as any) : navigate('/customers')}>
                                {currentStep === 0 ? 'Cancel' : 'Back'}
                            </Button>
                            <div className="flex gap-3">
                                {currentStep < 3 && <Button type="button" onClick={() => setCurrentStep((currentStep + 1) as any)} disabled={!canProceed()}>Next</Button>}
                                {currentStep === 3 && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => handleSubmit(0)}
                                            isLoading={submittingStatus === 0}
                                            disabled={submittingStatus !== null}
                                            className="mr-2"
                                        >
                                            Save as Draft
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => handleSubmit(1)}
                                            isLoading={submittingStatus === 1}
                                            disabled={submittingStatus !== null}
                                            loadingText="Saving..."
                                        >
                                            {isEditMode ? 'Update Customer' : 'Create Customer'}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Modal
                    isOpen={blocker.state === 'blocked'}
                    onClose={() => blocker.reset && blocker.reset()}
                    title={<span className="text-red-600">Unsaved Changes</span>}
                    footer={
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => blocker.reset && blocker.reset()}>
                                Stay
                            </Button>
                            <Button variant="destructive" onClick={() => blocker.proceed && blocker.proceed()}>
                                Leave & Discard
                            </Button>
                        </div>
                    }
                >
                    <p className="text-sm text-muted-foreground">
                        You have unsaved changes. Are you sure you want to leave? All your progress will be lost.
                    </p>
                </Modal>

                <Modal
                    isOpen={restrictedFeatureError}
                    onClose={() => setRestrictedFeatureError(false)}
                    title={<span className="text-red-600">Internal server error</span>}
                    footer={
                        <Button variant="default" onClick={() => setRestrictedFeatureError(false)} className="bg-neutral-900 text-white hover:bg-neutral-800">
                            Understood
                        </Button>
                    }
                >
                    <p className="text-sm text-muted-foreground">
                        There is an internal server error while processing the concession card option. My manager will be in touch with you as soon as possible as I am facing an error.
                    </p>
                </Modal>

                {/* Sidebar: Live Summary */}
                <aside className="w-full xl:w-[380px] shrink-0 xl:sticky xl:top-6 order-last xl:order-none">
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-4 bg-muted/50 border-b border-border flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <ShieldIcon size={16} className="text-blue-600" />
                                Live summary
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight leading-none">Live</span>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                                <SummaryItem icon={PhoneIcon} label="Mobile" value={formData.phone} />
                                <SummaryItem icon={MapPinIcon} label="Address" value={`${formData.unitNumber ? `${formData.unitNumber}/` : ''}${formData.streetNumber || ''} ${formData.streetName || ''} ${formData.streetType || ''}${formData.suburb ? `, ${formData.suburb}` : ''} ${formData.state || ''} ${formData.postcode || ''}`} />
                                <SummaryItem icon={UserIcon} label="Customer type" value={formData.propertyType === 1 ? 'Commercial' : 'Residential'} />
                                <SummaryItem icon={ZapIcon} label="Solar" value={formData.hasSolar ? 'Yes' : 'No'} />
                                <SummaryItem icon={HashIcon} label="NMI" value={formData.nmi} />
                                <SummaryItem icon={LockIcon} label="Tariff" value={formData.tariffCode} />
                                <SummaryItem icon={CreditCardIcon} label="DNSP" value={selectedRatePlan?.dnsp !== undefined ? (DNSP_MAP[selectedRatePlan.dnsp.toString()] || selectedRatePlan.dnsp) : '—'} />
                                <SummaryItem icon={ClockIcon} label="Tariff Type" value={selectedRatePlan?.tariff || '—'} />
                                <SummaryItem icon={PercentIcon} label="% Discount" value={`${formData.discount}%`} />
                                <SummaryItem icon={ZapIcon} label="Sale type" value={SALE_TYPE_OPTIONS.find(o => o.value === formData.saleType.toString())?.label} />
                                <SummaryItem icon={CalendarIcon} label="Connection date" value={formData.connectionDate} />
                                <SummaryItem icon={UserIcon} label="Name" value={`${formData.firstName} ${formData.lastName}`} />
                                <SummaryItem icon={MailIcon} label="Email" value={formData.email} />
                                <SummaryItem icon={CalendarIcon} label="DOB" value={formData.dob} />
                                <SummaryItem icon={IdCardIcon} label="ID" value={formData.idNumber ? `${ID_TYPE_OPTIONS.find(o => o.value === formData.idType.toString())?.label} ${formData.idNumber}` : '—'} />
                                <SummaryItem icon={CreditCardIcon} label="Billing" value={BILLING_PREF_OPTIONS.find(o => o.value === formData.billingPreference.toString())?.label} />
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div >
    );
};
