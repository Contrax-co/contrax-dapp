export interface SnapshotSpace {
    id: string;
    name: string;
    about: string;
    network: string;
    symbol: string;
    members: string[];
}

export interface SnapshotSpaceProposal {
    id: string;
    title: string;
    body: string;
    choices: string[];
    start: number;
    end: number;
    snapshot: string;
    state: "closed" | "active";
    author: string;
    space: {
        id: string;
        name: string;
    };
}

export interface SnapshotSpaceVote {
    id: string;
    voter: string;
    created: number;
    choice: number;
    reason: string;
    space: {
        id: string;
    };
}


