import { Chart } from "react-google-charts";
import { accentDark, primary, secondaryDark } from "../../theme/colors";

const pieOptions = {
    title: "",
    slices: [
        {
            color: primary,
        },
        {
            color: accentDark,
        },
    ],
    legend: {
        position: "right",
        alignment: "center",
        textStyle: {
            color: secondaryDark,
            fontSize: 14,
        },
    },
    tooltip: {
        showColorCode: true,
    },
    chartArea: {
        right: 0,
        top: 0,
        width: "100%",
        height: "100%",
    },
    fontName: "Roboto",
};

export default function PieChart(props: any) {
    const { chartData, chartId, height, width } = props;
    return (
        <div className="App">
            <Chart
                chartType="PieChart"
                data={chartData}
                options={pieOptions}
                graph_id={`PieChart${chartId}`}
                width={width ? width : "100%"}
                height={height ? height : "100%"}
                legend_toggle
            />
        </div>
    );
}
