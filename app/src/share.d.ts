import type { ShareOptions } from "@capacitor/share";
export declare const share: (data: ShareOptions) => Promise<{
    activityType: string | null;
}>;
export declare const canShare: () => Promise<boolean>;
