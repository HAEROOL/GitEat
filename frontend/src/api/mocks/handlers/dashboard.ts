import { http, HttpResponse } from "msw";
import {
  CommitData,
  ParticipantsData,
  PRStatisticsData,
  CommentStatisticsData,
  ContributorsData,
} from "../dummies/dashboard";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const dashBoardHandler = [
  http.get(`${API_BASE}/statistics/repo/:repoId/commit`, async () => {
    // 3초(3000ms) 지연
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return HttpResponse.json(CommitData);
  }),
  http.get(`${API_BASE}/statistics/repo/:repoId/participants`, async () => {
    // 3초(3000ms) 지연
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return HttpResponse.json(ParticipantsData);
  }),
  http.get(`${API_BASE}/statistics/repo/:repoId/pr`, async () => {
    // 3초(3000ms) 지연
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return HttpResponse.json(PRStatisticsData);
  }),
  http.get(`${API_BASE}/statistics/repo/:repoId/comment`, async () => {
    // 3초(3000ms) 지연
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return HttpResponse.json(CommentStatisticsData);
  }),
  http.get(`${API_BASE}/statistics/repo/:repoId/contributors`, async () => {
    // 3초(3000ms) 지연
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return HttpResponse.json(ContributorsData);
  }),
];

export default dashBoardHandler;
