import { Navigate, Outlet } from "react-router-dom";
import { Header } from "../../components/common/header";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "../../components/common/errorBoundery";
import { useLoginStore } from "../../store/loginStore";
import { useGetMe } from "../../api/queries/useGetMe";
import { Skeleton } from "@mui/material";

export function AuthLayout() {
  const { isLogin } = useLoginStore();
  const { setUser } = useLoginStore();

  const { data, isLoading, refetch } = useGetMe();

  // 개발 모드에서는 자동으로 목업 사용자 데이터 설정
  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      // 목업 데이터 사용
      refetch();
    }
  }, []);

  useEffect(() => {
    if (!isLoading && data) {
      setUser(data);
    }
  }, [data, isLoading]);

  // 개발 모드에서는 항상 인증된 것으로 처리
  const shouldAllowAccess = import.meta.env.MODE === "development" || isLogin;

  return shouldAllowAccess ? (
    <div>
      <Header />
      <div className="flex justify-end">
        <main className="w-[calc(100vw-250px)]">
          <ErrorBoundary fallbackComponent={<>error!!</>}>
            <Suspense fallback={<Skeleton width="100%" height="100vh" />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  ) : (
    <Navigate to="/" replace />
  );
}
