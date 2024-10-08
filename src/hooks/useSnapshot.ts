import snapshot from "@snapshot-labs/snapshot.js";
import { SNAPSHOT_APP_NAME, SNAPSHOT_HUB_URL, SNAPSHOT_SPACE_ID } from "src/config/constants";
import { useEthersWeb3Provider } from "src/config/walletConfig";
import { useEffect, useMemo, useState } from "react";
import { SnapshotSpace, SnapshotSpaceProposal, SnapshotSpaceVote } from "src/types/snapshot";
import { getSnapshotSpace, getSnapshotSpaceProposals, getSnapshotSpaceProposalsVotesByAddress } from "src/api/snapshot";
import useNotify from "./useNotify";
import useWallet from "./useWallet";

const client = new snapshot.Client712(SNAPSHOT_HUB_URL);

export const useSnapshotJoinSpace = () => {
    const [loadingJoinSpace, setLoadingJoinSpace] = useState(false);
    const { currentWallet: address } = useWallet();
    const provider = useEthersWeb3Provider();

    const joinSpace = async () => {
        if (!provider || !address) return;
        setLoadingJoinSpace(true);
        try {
            const receipt = await client.follow(provider, address, {
                space: SNAPSHOT_SPACE_ID,
            });
            setLoadingJoinSpace(false);
            return receipt;
        } catch (e) {
            console.log("error", e);
            setLoadingJoinSpace(false);
        }
    };

    return { joinSpace, loadingJoinSpace };
};

export const useSnapshotSpace = () => {
    const [space, setSpace] = useState<SnapshotSpace>();
    const [loadingSpace, setLoadingSpace] = useState(false);
    const { currentWallet } = useWallet();

    const isMember = useMemo(
        () => (currentWallet ? space?.members.includes(currentWallet) : undefined),
        [space, currentWallet]
    );

    useEffect(() => {
        const fetchSpace = async () => {
            setLoadingSpace(true);
            try {
                const response = await getSnapshotSpace(SNAPSHOT_SPACE_ID);
                setSpace(response);
            } catch (e) {
                console.log("error", e);
            }
            setLoadingSpace(false);
        };

        fetchSpace();
    }, []);

    return {
        space,
        isMember,
        loadingSpace,
    };
};

export const useSnapshotSpaceProposals = (snapshotSpaceId = SNAPSHOT_SPACE_ID) => {
    const [proposals, setProposals] = useState<SnapshotSpaceProposal[]>();
    const [votes, setVotes] = useState<SnapshotSpaceVote[]>();
    const [loadingSpaceProposals, setLoadingSpaceProposals] = useState(false);
    const [loadingSpaceVotes, setLoadingSpaceVotes] = useState(false);
    const { currentWallet } = useWallet();

    const fetchSpaceProposal = async () => {
        setLoadingSpaceProposals(true);
        try {
            const response = await getSnapshotSpaceProposals(snapshotSpaceId);

            setProposals(response);
        } catch (e) {
            console.log("error", e);
        }
        setLoadingSpaceProposals(false);
    };

    const fetchSpaceVotes = async () => {
        if (!currentWallet) return;
        setLoadingSpaceVotes(true);
        try {
            const response = await getSnapshotSpaceProposalsVotesByAddress(snapshotSpaceId, currentWallet);

            setVotes(response);
        } catch (e) {
            console.log("error", e);
        }
        setLoadingSpaceVotes(false);
    };

    useEffect(() => {
        fetchSpaceProposal();
    }, [currentWallet, snapshotSpaceId]);

    useEffect(() => {
        fetchSpaceVotes();
    }, [currentWallet, snapshotSpaceId]);

    return {
        proposals,
        votes,
        loadingSpaceProposals,
        loadingSpaceVotes,
        fetchSpaceProposal,
        fetchSpaceVotes,
    };
};

export const useSnapshotVote = () => {
    const provider = useEthersWeb3Provider();
    const [loadingVote, setloadingVote] = useState(false);
    const { currentWallet: address } = useWallet();
    const { notifyError, notifyLoading, notifySuccess, dismissNotify } = useNotify();

    const vote = async (
        proposalId: string,
        choiceNumber: number,
        choice: string,
        snapshotAppName: string,
        snapshotId: string
    ) => {
        if (!provider || !address) return;
        setloadingVote(true);
        const loadingId = notifyLoading("Vote", "Proposing vote!");

        try {
            const response = await client.vote(provider, address, {
                space: snapshotId,
                proposal: proposalId,
                type: "single-choice",
                choice: choiceNumber,
                reason: "I voted from the Contrax dApp directly!",
                app: snapshotAppName,
            });
            notifySuccess("Vote", `Successfully voted ${choice}`);
        } catch (e: any) {
            console.log("error", e);
            notifyError("Error voting", e.message || e.error_description);
        }

        dismissNotify(loadingId);
        setloadingVote(false);
    };

    return { vote, loadingVote };
};
