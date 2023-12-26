import "./ProposalProgressBar.css";

interface Props {
    title: string;
    value: string;
    isVoted?: boolean;
    isVoteable?: boolean;
    handleVote: Function;
}

export const ProposalProgressBar = ({ title, value, isVoted, isVoteable, handleVote }: Props) => {
    return (
        <div className={`progressbar-container ${isVoteable ? "voteable" : ""}`} onClick={() => handleVote()}>
            <div className={`progress`} style={{ width: `${value}%`, background: isVoted ? "blue" : undefined }}></div>
            <div className="content">
                <p className="title">{title}</p>
                <p className="value">{value}%</p>
            </div>
        </div>
    );
};




