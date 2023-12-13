import { snapshotApi } from ".";
import { SnapshotSpace, SnapshotSpaceProposal } from "src/types/snapshot";

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
    state: "closed" | "active",
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
                    state: "${state}"
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
