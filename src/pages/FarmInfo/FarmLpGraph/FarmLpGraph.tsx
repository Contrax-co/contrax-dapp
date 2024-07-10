import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import { Farm } from "src/types";
import styles from "./FarmLpGraph.module.css";
import { LP_Prices } from "src/api/stats";
import useApp from "src/hooks/useApp";
import { useLp } from "src/hooks/useLp";

const FarmLpGraph = ({ farm }: { farm: Farm }) => {
    const downsampleData = (data: LP_Prices[]) => {
        if (!data || data.length === 0) return;

        const monthlyData = [];
        const tempMap: { [key: string]: { date: string; lp: number; count: number } } = {};

        data.forEach((entry) => {
            const date = new Date(entry.timestamp * 1000);

            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            //   const [year, month] = entry.timestamp.split('-');
            const key = `${day}-${month}-${year}`;

            if (!tempMap[key]) {
                tempMap[key] = { date: `${day}-${month}-${year}`, lp: entry.lp, count: 0 };
            }

            tempMap[key].lp += entry.lp;
            tempMap[key].count++;
        });

        for (const key in tempMap) {
            const averageApy = tempMap[key].lp / tempMap[key].count;
            monthlyData.push({ date: key, lp: averageApy.toFixed(3) });
        }

        return monthlyData;
    };
    const { lightMode } = useApp();
    const { lp, averageLp, isLpPriceLoading } = useLp(farm.id);
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const newData = useMemo(() => downsampleData(lp || []), [lp]);

    return (
        <div className={styles.apyContainer}>
            <h1
                className={`${styles.apy_light} ${lightMode && styles.apy_dark}`}
                style={{ fontSize: "40px", fontWeight: "bold" }}
            >
                LP Price
            </h1>
            <div className={styles.specificApy}>
                <p className={`${styles.apy_light} ${lightMode && styles.apy_dark}`}>
                    <b>Average Price:</b>
                </p>
                {isLpPriceLoading ? (
                    <Skeleton h={20} w={20} />
                ) : (
                    <p className={`${styles.apy_light} ${lightMode && styles.apy_dark}`}>{averageLp.toFixed(2)}</p>
                )}
            </div>
            <div style={{ marginTop: "10px", width: "100%", height: "250px" }}>
                {isLpPriceLoading ? (
                    <Skeleton h={200} w={"100%"} />
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                width={1200}
                                height={250}
                                data={newData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#63cce0" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#63cce0" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => {
                                        const [day, month, year] = value.split("-");
                                        return `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
                                    }}
                                    label={{ fill: lightMode ? "black" : "white" }}
                                />
                                <YAxis label={{ fill: lightMode ? "black" : "white" }} />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="lp"
                                    stroke="#63cce0"
                                    fillOpacity={1}
                                    fill="url(#colorUv)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </>
                )}
            </div>
        </div>
    );
};
export default FarmLpGraph;
