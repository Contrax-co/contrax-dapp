import {
    useSnapshotJoinSpace,
    useSnapshotSpace,
    useSnapshotSpaceProposals,
    useSnapshotVote,
} from "src/hooks/useSnapshot";
import "./Snapshot.css";
import { ProposalCard } from "src/components/ProposalCard/ProposalCard";

export const Snapshot = () => {
    const { joinSpace, loadingJoinSpace } = useSnapshotJoinSpace();
    const { loadingSpace, space, isMember } = useSnapshotSpace();
    const { loadingSpaceProposals, proposals } = useSnapshotSpaceProposals();
    console.log("proposals =>", proposals);
    return (
        <div style={{ margin: 20 }}>
            <h4>
                {space?.name} (${space?.symbol})
            </h4>
            <p>Space details: {space?.about}</p>
            <p>Space members: </p>
            {space?.members.map((e) => (
                <li key={e}>{e}</li>
            ))}
            {!isMember && (
                <button disabled={loadingJoinSpace} onClick={joinSpace}>
                    Join Space
                </button>
            )}

            <h5 style={{ marginTop: 50 }}>Proposals</h5>
            {proposals?.map((e, index) => {
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
            })}
            <div className="proposal-list">
                <ProposalCard />
                <ProposalCard />
                <ProposalCard />
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
