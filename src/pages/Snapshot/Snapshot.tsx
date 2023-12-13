import { useSnapshotSpace, useSnapshotSpaceProposals, useSnapshotVote } from "src/hooks/useSnapshot";

export const Snapshot = () => {
    const { loadingSpace, space } = useSnapshotSpace();
    const { loadingSpaceProposals, proposals } = useSnapshotSpaceProposals();
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
