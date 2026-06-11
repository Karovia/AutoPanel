import {
  RagflowClient,
  type RagflowSearchInput,
  type RagflowSearchResult,
} from "../../../api/src/modules/connections/provider-adapters/ragflow.client";

export async function ragflowSearch(
  client: RagflowClient,
  input: RagflowSearchInput,
): Promise<RagflowSearchResult> {
  return client.search(input);
}
