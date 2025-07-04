export declare const checkVehiclePermit: (licensePlate: string, state: string) => Promise<{
    valid: boolean;
    permitType: string;
    expirationDate: string;
} | undefined>;
