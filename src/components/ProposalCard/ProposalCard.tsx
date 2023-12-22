import React from "react";
import { ProposalProgressBar } from "../ProposalProgressBar/ProposalProgressBar";
import "./ProposalCard.css";

interface Props {
    description: string;
    choices: string[];
    scores: number[];
    totalScore: number;
    status: "closed" | "active";
}

export const ProposalCard: React.FC<Props> = ({ description, choices, scores, totalScore, status }) => {
    return (
        <div className="proposal-card">
            <div className="header">
                <p className="name">Proposal name</p>
                <p className={`status ${status === "active" ? "in-progress" : "in-progress"}`}>In Progress</p>
            </div>
            <p className="description">{description}</p>
            {choices.map((item, i) => (
                <ProposalProgressBar title={item} value={((scores[i] / totalScore) * 100).toFixed(1)} />
            ))}
        </div>
    );
};

