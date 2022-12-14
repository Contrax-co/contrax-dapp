import { Chart } from "react-google-charts";
import * as colors from "../../theme/colors";

const chartOptions = {
    title: "",
    legend: { position: "none" },
    hAxis: { textPosition: "none" },
    chartArea: {
        left: 0,
        top: 0,
        width: "100%",
        height: "80%",
    },
    fontName: "Roboto",
    colors: [colors.accentDark],
};

export default function BarChart(props: any) {
    const { chartData } = props;
    return (
        <div className="App">
            <Chart chartType="Bar" width="100%" height="400px" data={chartData} options={chartOptions} />
        </div>
    );
}
