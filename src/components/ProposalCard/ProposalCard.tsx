import { ProposalProgressBar } from "../ProposalProgressBar/ProposalProgressBar";
import "./ProposalCard.css";

export const ProposalCard = () => {
    return (
        <div className="proposal-card">
            <div className="header">
                <p className="name">Proposal name</p>
                <p className={`status ${"In Progress" === "In Progress" ? "in-progress" : "in-progress"}`}>
                    In Progress
                </p>
            </div>
            <p className="description">
                Pacific ocean is the largest ocean in the world. Pacific ocean is the largest ocean in the world.
            </p>
            <ProposalProgressBar title="Yes" value="88.6" />
            <ProposalProgressBar title="Yes" value="88.6" />
            <ProposalProgressBar title="Yes" value="88.6" />
        </div>
    );
};
