import axios from "axios";

export interface PoolFeesResponse {
    result: {
        rows: PoolFees[];
    };
}

export interface PoolFees {
    fees_usd: number;
    pool_address: string;
}

export const fetchAllFeesPool = async () => {
    const res = await axios.get<PoolFeesResponse>(`https://api.dune.com/api/v1/query/3702651/results?limit=1000`, {
        headers: {
            "X-Dune-API-Key": process.env.REACT_APP_DUNE_API_KEY,
        },
    });
    return res.data.result.rows;
};
