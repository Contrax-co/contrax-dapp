import React from "react";
import { ProposalProgressBar } from "../ProposalProgressBar/ProposalProgressBar";
import "./ProposalCard.css";

interface Props {
    description: string;
    choices: string[];
    scores: number[];
    totalScore: number;
    status: "closed" | "active";
    title: string;
}

export const ProposalCard: React.FC<Props> = ({ description, choices, scores, totalScore, status, title }) => {
    return (
        <div className="proposal-card">
            <div className="header">
                <p className="name">{title}</p>
                <p className={`status ${status === "active" ? "in-progress" : ""}`}>
                    {status === "active" ? "In Progress" : "Closed"}
                </p>
            </div>
            <p className="description">{description}</p>
            {choices.map((item, i) => (
                <ProposalProgressBar title={item} value={((scores[i] / totalScore) * 100).toFixed(1)} />
            ))}
        </div>
    );
};


