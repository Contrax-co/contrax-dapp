import {
    useSnapshotJoinSpace,
    useSnapshotSpace,
    useSnapshotSpaceProposals,
    useSnapshotVote,
} from "src/hooks/useSnapshot";
import "./Snapshot.css";
import { ProposalCard } from "src/components/ProposalCard/ProposalCard";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import useBalances from "src/hooks/useBalances";
import tokens from "src/config/constants/tokens";
import { useMemo, useState } from "react";
import { Tabs } from "src/components/Tabs/Tabs";
import PoolButton from "src/components/PoolButton/PoolButton";
import { SNAPSHOT_APP_NAME, SNAPSHOT_SPACE_ID } from "src/config/constants";
import { CHAIN_ID } from "src/types/enums";

export const Snapshot = () => {
    const { joinSpace, loadingJoinSpace } = useSnapshotJoinSpace();
    const { loadingSpace, space, isMember } = useSnapshotSpace();
    const [tab, setTab] = useState<"Contrax" | "Artbitrum">("Contrax");
    const { formattedBalances } = useBalances();
    const snapshotSpaceId = useMemo(() => (tab === "Contrax" ? SNAPSHOT_SPACE_ID : "arbitrumfoundation.eth"), [tab]);
    const snapshotSpaceName = useMemo(() => (tab === "Contrax" ? SNAPSHOT_APP_NAME : "Arbitrum DAO"), [tab]);
    const { loadingSpaceProposals, loadingSpaceVotes, proposals, votes, fetchSpaceProposal, fetchSpaceVotes } =
        useSnapshotSpaceProposals(snapshotSpaceId);

    const traxBalance = useMemo(
        () => formattedBalances[CHAIN_ID.ARBITRUM][tokens.find((item) => item.name === "xTrax")!.address],
        [formattedBalances]
    );

    return (
        <div className="snapshot-container">
            <Tabs>
                <PoolButton
                    variant={2}
                    onClick={() => {
                        setTab("Contrax");
                    }}
                    description={"Contrax"}
                    active={tab === "Contrax"}
                />
                <PoolButton
                    variant={2}
                    onClick={() => {
                        setTab("Artbitrum");
                    }}
                    description={"Artbitrum"}
                    active={tab === "Artbitrum"}
                />
            </Tabs>
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
            {tab === "Contrax" && (
                <div>
                    <h5 style={{ marginTop: 20, marginBottom: 0 }}>Proposals</h5>
                    <p className={"xTrax"} style={{ marginTop: 0, marginBottom: 30 }}>
                        {traxBalance && `xTrax balance: ${traxBalance}`}
                    </p>
                </div>
            )}
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
                        <Skeleton w={"100%"} h={300} inverted />
                        <Skeleton w={"100%"} h={300} inverted />
                        <Skeleton w={"100%"} h={300} inverted />
                        <Skeleton w={"100%"} h={300} inverted />
                        <Skeleton w={"100%"} h={300} inverted />
                        <Skeleton w={"100%"} h={300} inverted />
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
                            snapshotAppName={snapshotSpaceName}
                            snapshotId={snapshotSpaceId}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
