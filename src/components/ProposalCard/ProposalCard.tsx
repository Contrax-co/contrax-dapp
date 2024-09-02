import React, { useMemo } from "react";
import { ProposalProgressBar } from "../ProposalProgressBar/ProposalProgressBar";
import "./ProposalCard.css";
import { SnapshotSpaceVote } from "src/types/snapshot";
import { useSnapshotVote } from "src/hooks/useSnapshot";
import { Skeleton } from "../Skeleton/Skeleton";
import moment from "moment";
import { getIpfsImageUrls } from "src/api/snapshot";
import { SNAPSHOT_SPACE_ID } from "src/config/constants";

interface Props {
    id: string;
    description: string;
    choices: string[];
    scores: number[];
    totalScore: number;
    status: "closed" | "active";
    title: string;
    votedChoice?: SnapshotSpaceVote;
    fetchVotes: Function;
    loadingVotes: boolean;
    end: number;
    snapshotAppName: string;
    snapshotId: string;
}

export const ProposalCard: React.FC<Props> = ({
    id,
    description,
    choices,
    scores,
    totalScore,
    status,
    title,
    votedChoice,
    fetchVotes,
    loadingVotes,
    end,
    snapshotAppName,
    snapshotId,
}) => {
    const { loadingVote, vote } = useSnapshotVote();
    const isVoteable = useMemo(() => status === "active", [status, votedChoice]);

    const handleVote = async (choice: number) => {
        if (isVoteable) {
            await vote(id, choice, choices[choice - 1], snapshotAppName, snapshotId);
            fetchVotes();
        }
    };

    const images = useMemo(() => getIpfsImageUrls(description), [description]);

    return (
        <div className="proposal-card">
            <div className="header">
                <p className="name">{title}</p>
                <p className={`status ${status === "active" ? "in-progress" : ""}`}>
                    {status === "active" ? "In Progress" : "Closed"}
                </p>
            </div>
            <p className="description">{description}</p>
            {images.map((item) => (
                <img src={item} alt="" />
            ))}
            {choices.map((item, i) =>
                loadingVote || loadingVotes ? (
                    <Skeleton w={"100%"} h={48} inverted />
                ) : (
                    <ProposalProgressBar
                        title={item}
                        value={((scores[i] / (totalScore || 1)) * 100).toFixed(1)}
                        isVoted={votedChoice?.choice === i + 1}
                        isVoteable={isVoteable}
                        handleVote={() => handleVote(i + 1)}
                    />
                )
            )}
            {status === "closed" && <p>Ended {moment(end * 1000).fromNow()}</p>}
            {
                <a
                    href={`https://snapshot.org/#/${SNAPSHOT_SPACE_ID}/proposal/${id}`}
                    target="_blank"
                    className="viewLink"
                >
                    View on Snapshot
                </a>
            }
        </div>
    );
};
