import {
    useSnapshotJoinSpace,
    useSnapshotSpace,
    useSnapshotSpaceProposals,
    useSnapshotVote,
} from "src/hooks/useSnapshot";
import "./Snapshot.css";
import { ProposalCard } from "src/components/ProposalCard/ProposalCard";
import { Skeleton } from "src/components/Skeleton/Skeleton";

export const Snapshot = () => {
    const { joinSpace, loadingJoinSpace } = useSnapshotJoinSpace();
    const { loadingSpace, space, isMember } = useSnapshotSpace();
    const { loadingSpaceProposals, loadingSpaceVotes, proposals, votes, fetchSpaceProposal, fetchSpaceVotes } =
        useSnapshotSpaceProposals();
console.log(proposals);
    return (
        <div className="snapshot-container">
            {/* <h4> */}
            {/* {space?.name} (${space?.symbol}) */}
            {/* </h4> */}
            {/* <p>Space details: {space?.about}</p> */}
            {/* <p>Space members: </p> */}
            {/* {space?.members.map((e) => (
                <li key={e}>{e}</li>
            ))} */}
            {/* {!isMember && (
                <button disabled={loadingJoinSpace} onClick={joinSpace}>
                    Join Space
                </button>
            )} */}

            <h5 style={{ marginTop: 20, marginBottom: 30 }}>Proposals</h5>
            {/* {proposals?.map((e, index) => {
                return (
                    <div key={e.id}>
                        <div>
                            {index + 1}. {e.title}
                        </div>
                        <div>{e.body}</div>
                        {e.choices.map((c, i) => (
                            <ProposalChoiceButton key={c} proposalId={e.id} choice={c} choiceNumber={i + 1} />
                        ))}
                    </div>
                );
            })} */}
            <div className="proposal-list">
                {loadingSpaceProposals ? (
                    <>
                        <Skeleton w={340} h={300} inverted />
                        <Skeleton w={340} h={300} inverted />
                        <Skeleton w={340} h={300} inverted />
                        <Skeleton w={340} h={300} inverted />
                    </>
                ) : (
                    proposals?.map((item, i) => (
                        <ProposalCard
                            id={item.id}
                            description={item.body}
                            choices={item.choices}
                            scores={item.scores}
                            totalScore={item.scores_total}
                            status={item.state}
                            title={item.title}
                            votedChoice={votes?.find((vote) => vote.proposal.id === item.id)}
                            fetchVotes={fetchSpaceVotes}
                            loadingVotes={loadingSpaceVotes}
                            end={item.end}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

interface IProposalChoiceButtonProps {
    key: string;
    proposalId: string;
    choice: string;
    choiceNumber: number;
}

const ProposalChoiceButton: React.FC<IProposalChoiceButtonProps> = ({ key, proposalId, choice, choiceNumber }) => {
    const { loadingVote, vote } = useSnapshotVote();

    const handleVote = async () => {
        await vote(proposalId, choiceNumber, choice);
    };

    return (
        <button style={{ margin: 10 }} key={key} disabled={loadingVote} onClick={handleVote}>
            {choice}
        </button>
    );
};


