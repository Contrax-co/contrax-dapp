import "./ProposalProgressBar.css";

interface Props {
    title: string;
    value: string;
}

export const ProposalProgressBar = ({ title, value }: Props) => {
    return (
        <div className="progressbar-container">
            <div className="progress" style={{ width: `${value}%` }}></div>
            <div className="content">
                <p className="title">{title}</p>
                <p className="value">{value}%</p>
            </div>
        </div>
    );
};

