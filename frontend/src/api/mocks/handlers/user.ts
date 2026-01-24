import { http, HttpResponse } from "msw";
import { UserData } from "../dummies/user";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export const userHandler = [
  http.get(`${API_BASE}/oauth/gitlab/userinfo`, async () => {
    return HttpResponse.json(UserData);
  }),
];
