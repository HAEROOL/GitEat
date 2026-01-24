import { http, HttpResponse } from "msw";
import {
  Pullrequests,
  RepositoryList,
  RepositoryDetail,
  PullRequestDetail,
  PullRequestFiles,
  PullRequestFileRawMap,
  Commits,
} from "../dummies/repository";
import { AiReviewData } from "../dummies/aiReview";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const repositoryHandler = [
  http.get(`${API_BASE}/repo`, () => {
    return HttpResponse.json(RepositoryList);
  }),
  http.get(`${API_BASE}/pr/:repoId`, () => {
    return HttpResponse.json(Pullrequests);
  }),
  http.post(`${API_BASE}/repo`, async () => {
    // 3초(3000ms) 지연
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return HttpResponse.json(RepositoryDetail);
  }),

  http.delete(`${API_BASE}/repo/1`, async () => {
    // 3초(3000ms) 지연
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return HttpResponse.json(RepositoryDetail);
  }),

  http.get(`${API_BASE}/pr/:repoId/:prId`, () => {
    return HttpResponse.json(PullRequestDetail);
  }),

  http.get(`${API_BASE}/pr/:repoId/:prId/file`, () => {
    return HttpResponse.json(PullRequestFiles);
  }),

  http.post(`${API_BASE}/pr/:repoId/:prId/file/raw`, async ({ request }) => {
    const body = (await request.json()) as any;
    const fileId = body.fileId; // ChangedFile 객체가 직접 전달되므로 body.fileId로 접근

    // Return specific file content if mapped, otherwise default
    const rawFile =
      PullRequestFileRawMap[fileId] || PullRequestFileRawMap["default"];

    console.log(
      `Fetching raw file for fileId: ${fileId}`,
      rawFile ? "Found" : "Using default"
    );

    return HttpResponse.json(rawFile);
  }),

  http.get(`${API_BASE}/ai/review/:repoId/:prId`, () => {
    return HttpResponse.json(AiReviewData);
  }),

  http.get(`${API_BASE}/pr/:repoId/:prId/commit`, () => {
    return HttpResponse.json(Commits);
  }),
];

export default repositoryHandler;
