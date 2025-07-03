"use client";

import { ChatbotUIContext } from "@/context/context";
import { getProfileByUserId } from "@/db/profile";
import { getWorkspaceImageFromStorage } from "@/db/storage/workspace-images";
import { getWorkspacesByUserId } from "@/db/workspaces";
import { convertBlobToBase64 } from "@/lib/blob-to-b64";
import {
  fetchHostedModels,
  fetchOllamaModels,
  fetchOpenRouterModels
} from "@/lib/models/fetch-models";
import { Tables } from "@/supabase/types";
import {
  ChatFile,
  ChatMessage,
  ChatSettings,
  LLM,
  MessageImage,
  OpenRouterLLM,
  WorkspaceImage
} from "@/types";
import { AssistantImage } from "@/types/images/assistant-image";
import { VALID_ENV_KEYS } from "@/types/valid-keys";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

interface GlobalStateProps {
  children: React.ReactNode;
  initialSession: Session | null;
}

export const GlobalState: FC<GlobalStateProps> = ({ children, initialSession }) => {
  const router = useRouter();

  // PROFILE STORE
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);

  // 他の state は省略せず残す
  // ぱんたす様の既存の state 群はそのまま

  // MODELS STORE
  const [envKeyMap, setEnvKeyMap] = useState<Record<string, VALID_ENV_KEYS>>({});
  const [availableHostedModels, setAvailableHostedModels] = useState<LLM[]>([]);
  const [availableLocalModels, setAvailableLocalModels] = useState<LLM[]>([]);
  const [availableOpenRouterModels, setAvailableOpenRouterModels] = useState<OpenRouterLLM[]>([]);

  // WORKSPACE STORE
  const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([]);
  const [workspaceImages, setWorkspaceImages] = useState<WorkspaceImage[]>([]);

  useEffect(() => {
    const useExistingSession = async () => {
      console.log("🐇 PANTAS: GlobalState received initialSession:", initialSession);

      if (!initialSession) {
        console.log("❌ PANTAS: No session! Redirecting to login.");
        router.push("/login");
        return;
      }

      const user = initialSession.user;

      const profile = await getProfileByUserId(user.id);
      setProfile(profile);

      if (!profile.has_onboarded) {
        console.log("⚠️ PANTAS: User not onboarded, redirecting to setup.");
        router.push("/setup");
        return;
      }

      const hostedModelRes = await fetchHostedModels(profile);
      if (hostedModelRes) {
        setEnvKeyMap(hostedModelRes.envKeyMap);
        setAvailableHostedModels(hostedModelRes.hostedModels);

        if (profile["openrouter_api_key"] || hostedModelRes.envKeyMap["openrouter"]) {
          const openRouterModels = await fetchOpenRouterModels();
          if (openRouterModels) {
            setAvailableOpenRouterModels(openRouterModels);
          }
        }
      }

      if (process.env.NEXT_PUBLIC_OLLAMA_URL) {
        const localModels = await fetchOllamaModels();
        if (localModels) {
          setAvailableLocalModels(localModels);
        }
      }

      const workspaces = await getWorkspacesByUserId(user.id);
      setWorkspaces(workspaces);

      for (const workspace of workspaces) {
        let workspaceImageUrl = "";

        if (workspace.image_path) {
          workspaceImageUrl = (await getWorkspaceImageFromStorage(workspace.image_path)) || "";
        }

        if (workspaceImageUrl) {
          const response = await fetch(workspaceImageUrl);
          const blob = await response.blob();
          const base64 = await convertBlobToBase64(blob);

          setWorkspaceImages(prev => [
            ...prev,
            {
              workspaceId: workspace.id,
              path: workspace.image_path,
              base64: base64,
              url: workspaceImageUrl
            }
          ]);
        }
      }
    };

    useExistingSession();
  }, [initialSession]);

  return (
    <ChatbotUIContext.Provider
      value={{
        profile,
        setProfile,
        envKeyMap,
        setEnvKeyMap,
        availableHostedModels,
        setAvailableHostedModels,
        availableLocalModels,
        setAvailableLocalModels,
        availableOpenRouterModels,
        setAvailableOpenRouterModels,
        workspaces,
        setWorkspaces,
        workspaceImages,
        setWorkspaceImages,

        // ぱんたす様の他の store はここに残してくださいませ！
      }}
    >
      {children}
    </ChatbotUIContext.Provider>
  );
};
