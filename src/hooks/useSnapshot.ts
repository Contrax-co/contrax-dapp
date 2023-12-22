import snapshot from "@snapshot-labs/snapshot.js";
import { SNAPSHOT_HUB_URL, SNAPSHOT_SPACE_ID } from "src/config/constants";
import { useEthersWeb3Provider } from "src/config/walletConfig";
import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { useStats } from "./useStats";
import { SnapshotSpace, SnapshotSpaceProposal, SnapshotSpaceVote } from "src/types/snapshot";
import { getSnapshotSpace, getSnapshotSpaceProposals, getSnapshotSpaceProposalsVotesByAddress } from "src/api/snapshot";
import useNotify from "./useNotify";
import useWallet from "./useWallet";

const client = new snapshot.Client712(SNAPSHOT_HUB_URL);

export const useSnapshotJoinSpace = () => {
    const [loadingJoinSpace, setLoadingJoinSpace] = useState(false);

    const provider = useEthersWeb3Provider();
    const { address } = useAccount();

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

    const isMember = useMemo(() => space?.members.includes(currentWallet), [space, currentWallet]);

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

export const useSnapshotSpaceProposals = () => {
    const [proposals, setProposals] = useState<SnapshotSpaceProposal[]>();
    const [votes, setVotes] = useState<SnapshotSpaceVote[]>();
    const [loadingSpaceProposals, setLoadingSpaceProposals] = useState(false);
    const [loadingSpaceVotes, setLoadingSpaceVotes] = useState(false);
    const { currentWallet } = useWallet();

    useEffect(() => {
        const fetchSpaceProposal = async () => {
            setLoadingSpaceProposals(true);
            try {
                const response = await getSnapshotSpaceProposals(SNAPSHOT_SPACE_ID);

                setProposals(response);
            } catch (e) {
                console.log("error", e);
            }
            setLoadingSpaceProposals(false);
        };

        fetchSpaceProposal();
    }, []);

    useEffect(() => {
        const fetchSpaceVotes = async () => {
            if (!currentWallet) return;
            setLoadingSpaceVotes(true);
            try {
                const response = await getSnapshotSpaceProposalsVotesByAddress(SNAPSHOT_SPACE_ID, currentWallet);

                setVotes(response);
            } catch (e) {
                console.log("error", e);
            }
            setLoadingSpaceVotes(false);
        };

        fetchSpaceVotes();
    }, []);

    return {
        proposals,
        votes,
        loadingSpaceProposals,
    };
};

export const useSnapshotVote = () => {
    const provider = useEthersWeb3Provider();
    const [loadingVote, setloadingVote] = useState(false);
    const { address } = useAccount();
    const { notifyError, notifyLoading, notifySuccess, dismissNotify } = useNotify();

    const vote = async (proposalId: string, choiceNumber: number, choice: string) => {
        if (!provider || !address) return;
        setloadingVote(true);
        const loadingId = notifyLoading("Vote", "Proposing vote!");

        try {
            const response = await client.vote(provider, address, {
                space: SNAPSHOT_SPACE_ID,
                proposal: proposalId,
                type: "single-choice",
                choice: choiceNumber,
                reason: "This choice make lot of sense",
                app: "Contrax Finance",
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


