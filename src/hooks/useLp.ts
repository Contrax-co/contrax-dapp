import { useCallback, useEffect, useMemo, useState } from "react";
import { LP_Prices, fetchSpecificLpPrice } from "src/api/stats";

export const useLp = (id: number) => {
    const [lp, setLp] = useState<LP_Prices[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSpecificLp = useCallback(async () => {
        setLoading(true);
        try {
            const specificApy = await fetchSpecificLpPrice(id);
            setLp(specificApy);
        } catch (error: any) {
            throw new Error(error);
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchSpecificLp();
    }, []);

    const averageLp = useMemo(() => {
        if (lp.length === 0) return 0;
        const sumlp = lp.reduce((a, b) => a + b.lp, 0);
        return sumlp / lp.length;
    }, [lp]);

    return {
        lp,
        isLpPriceLoading: loading,
        averageLp,
    };
};
