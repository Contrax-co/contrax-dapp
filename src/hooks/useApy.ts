import { useCallback, useEffect, useMemo, useState } from "react";
import { VaultsApy, fetchSpecificFarmApy } from "src/api/stats";

export const useApy = (id: number) => {
    const [apy, setApy] = useState<VaultsApy[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSpecrticApy = useCallback(async () => {
        setLoading(true);
        try {
            const specificApy = await fetchSpecificFarmApy(id);
            setApy(specificApy);
        } catch (error: any) {
            throw new Error(error);
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchSpecrticApy();
    }, []);

    const averageApy = useMemo(() => {
        if (apy.length === 0) return 0;
        const sumApy = apy.reduce((a, b) => a + b.apy, 0);
        return sumApy / apy.length;
    }, [apy]);

    return {
        apy,
        loading,
        averageApy,
    };
};
