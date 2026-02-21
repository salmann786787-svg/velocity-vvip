export interface RateBreakdown {
    flatRate: number;
    hourlyRate: number;
    hourlyHours: number;
    hourlyTotal: number;
    extraStopRate: number;
    extraStopCount: number;
    extraStopsTotal: number;
    sanitizingFee: number;
    otWaitTime: number;
    stdGratPercent: number;
    primaryGratTotal: number;
    stcSurchPercent: number;
    stcSurchTotal: number;
    stdTaxPercent: number;
    primaryTaxTotal: number;
    fuelSurcharge: number;
    swg: number;
    perPassRate: number;
    perPassCount: number;
    perPassTotal: number;
    perMileRate: number;
    perMileCount: number;
    perMileTotal: number;
    childSeatRate: number;
    childSeatCount: number;
    childSeatTotal: number;
    extraGrat: number;
    farmOutBaseRate: number;
    farmOutGratuityPercent: number;
    farmOutGratuityTotal: number;
    farmOutTotal: number;

    // Labels
    flatRateLabel: string;
    hourlyRateLabel: string;
    extraStopLabel: string;
    sanitizingFeeLabel: string;
    otWaitTimeLabel: string;
    stdGratLabel: string;
    stcSurchLabel: string;
    taxLabel: string;

    // Totals
    primarySubtotal: number;
    grandTotal: number;
    totalDue: number;
    deposit: number;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    company?: string;
}

export interface Stop {
    id: string;
    location: string;
    isAirport: boolean;
    airline?: string;
    flightNumber?: string;
    terminal?: string;
}

export interface Reservation {
    id: number;
    confirmationNumber: string;
    customer: string;
    customerId?: number;
    email: string;
    phone: string;
    company?: string;
    pickupDate: string;
    pickupTime: string;
    stops: Stop[];
    vehicle: string;
    passengers: number;
    hours: number;
    total: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    specialInstructions?: string;
    bookedByName?: string;
    bookedByEmail?: string;
    bookedByPhone?: string;
    tripNotes?: string;
    internalNotes?: string;
    addToConfirmation?: boolean;
    rateBreakdown?: RateBreakdown;
    policyType?: 'customer' | 'driver' | 'affiliate' | 'none';
    createdAt: string;
    updatedAt: string;
}

export interface TemplateSettings {
    businessName: string;
    tagline: string;
    logoUrl: string;
    headerGradientStart: string;
    headerGradientEnd: string;
    primaryColor: string;
    footerMessage: string;
    contactPhone: string;
    contactEmail: string;
    contactWebsite: string;
    policyCustomer?: string;
    policyDriver?: string;
    policyAffiliate?: string;
}
