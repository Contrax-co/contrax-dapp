import { snapshotApi } from ".";
import { SnapshotSpace, SnapshotSpaceProposal, SnapshotSpaceVote } from "src/types/snapshot";

export const getSnapshotSpace = async (spaceId: string): Promise<SnapshotSpace> => {
    const query = `
        query {
          space(id: "${spaceId}") {
            id
            name
            about
            network
            symbol
            members
          }
        }`;

    const response = await snapshotApi.post("", {
        query,
    });

    return response.data?.data?.space;
};

export const getSnapshotSpaceProposals = async (
    spaceId: string,
    first: number = 20,
    skip: number = 0
): Promise<SnapshotSpaceProposal[]> => {
    const query = `
              query {
                proposals (
                  first: ${first},
                  skip: ${skip},
                  where: {
                    space_in: ["${spaceId}"],
                  },
                  orderBy: "created",
                  orderDirection: desc
                ) {
                  id
                  title
                  body
                  choices
                  start
                  end
                  snapshot
                  state
                  scores
                  scores_by_strategy
                  scores_total
                  scores_updated
                  author
                  space {
                    id
                    name
                  }
                }
              }`;

    const response = await snapshotApi.post("", {
        query,
    });

    return response.data?.data?.proposals;
};

export const getSnapshotSpaceProposalsVotesByAddress = async (
    spaceId: string,
    address: string
): Promise<SnapshotSpaceVote[]> => {
    const query = `
              query {
                votes (
                  first: 1000
                  where: {
                    voter: "${address}",
                    space: "${spaceId}"
                  }
                ) {
                  id
                  voter
                  created
                  choice
                  proposal {
                    id
                  }
                  reason
                  space {
                    id
                  }
                }
              }`;

    const response = await snapshotApi.post("", {
        query,
    });

    return response.data?.data?.votes;
};

export const getIpfsImageUrls = (body: string) => {
    const pattern = /ipfs:\/\/.*\)/g;
    const iterator = body.matchAll(pattern);
    const images = [];
    while (true) {
        const exp = iterator.next();
        if (!exp.value) break;
        let result = exp.value[0].replaceAll("ipfs://", "");
        result = result.replace(")", "");
        result = `https://snapshot.4everland.link/ipfs/${result}`;
        images.push(result);
    }
    return images;
};


