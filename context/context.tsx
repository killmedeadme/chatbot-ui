"use client";

import { createContext, FC, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatbotUIContext } from "@/context/context";
import { Tables } from "@/supabase/types";
import { VALID_ENV_KEYS } from "@/types/valid-keys";
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
import { Session } from "@supabase/supabase-js";
import {
  fetchHostedModels,
  fetchOllamaModels,
  fetchOpenRouterModels
} from "@/lib/models/fetch-models";
import { getProfileByUserId } from "@/db/profile";
import { getWorkspacesByUserId } from "@/db/workspaces";
import { getWorkspaceImageFromStorage } from "@/db/storage/workspace-images";
import { convertBlobToBase64 } from "@/lib/blob-to-b64";

interface GlobalStateProps {
  children: ReactNode;
  initialSession: Session | null;
}

export const GlobalState: FC<GlobalStateProps> = ({ children, initialSession }) => {
  const router = useRouter();

  // PROFILE STORE
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);

  // ITEMS STORE
  const [assistants, setAssistants] = useState<Tables<"assistants">[]>([]);
  const [collections, setCollections] = useState<Tables<"collections">[]>([]);
  const [chats, setChats] = useState<Tables<"chats">[]>([]);
  const [files, setFiles] = useState<Tables<"files">[]>([]);
  const [folders, setFolders] = useState<Tables<"folders">[]>([]);
  const [models, setModels] = useState<Tables<"models">[]>([]);
  const [presets, setPresets] = useState<Tables<"presets">[]>([]);
  const [prompts, setPrompts] = useState<Tables<"prompts">[]>([]);
  const [tools, setTools] = useState<Tables<"tools">[]>([]);
  const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([]);

  // MODELS STORE
  const [envKeyMap, setEnvKeyMap] = useState<Record<string, VALID_ENV_KEYS>>({});
  const [availableHostedModels, setAvailableHostedModels] = useState<LLM[]>([]);
  const [availableLocalModels, setAvailableLocalModels] = useState<LLM[]>([]);
  const [availableOpenRouterModels, setAvailableOpenRouterModels] = useState<OpenRouterLLM[]>([]);

  // WORKSPACE STORE
  const [selectedWorkspace, setSelectedWorkspace] = useState<Tables<"workspaces"> | null>(null);
  const [workspaceImages, setWorkspaceImages] = useState<WorkspaceImage[]>([]);

  // PRESET STORE
  const [selectedPreset, setSelectedPreset] = useState<Tables<"presets"> | null>(null);

  // ASSISTANT STORE
  const [selectedAssistant, setSelectedAssistant] = useState<Tables<"assistants"> | null>(null);
  const [assistantImages, setAssistantImages] = useState<AssistantImage[]>([]);
  const [openaiAssistants, setOpenaiAssistants] = useState<any[]>([]);

  // PASSIVE CHAT STORE
  const [userInput, setUserInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null);
  const [selectedChat, setSelectedChat] = useState<Tables<"chats"> | null>(null);
  const [chatFileItems, setChatFileItems] = useState<Tables<"file_items">[]>([]);

  // ACTIVE CHAT STORE
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [firstTokenReceived, setFirstTokenReceived] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // CHAT INPUT COMMAND STORE
  const [isPromptPickerOpen, setIsPromptPickerOpen] = useState<boolean>(false);
  const [slashCommand, setSlashCommand] = useState<string>("");
  const [isFilePickerOpen, setIsFilePickerOpen] = useState<boolean>(false);
  const [hashtagCommand, setHashtagCommand] = useState<string>("");
  const [isToolPickerOpen, setIsToolPickerOpen] = useState<boolean>(false);
  const [toolCommand, setToolCommand] = useState<string>("");
  const [focusPrompt, setFocusPrompt] = useState<boolean>(false);
  const [focusFile, setFocusFile] = useState<boolean>(false);
  const [focusTool, setFocusTool] = useState<boolean>(false);
  const [focusAssistant, setFocusAssistant] = useState<boolean>(false);
  const [atCommand, setAtCommand] = useState<string>("");
  const [isAssistantPickerOpen, setIsAssistantPickerOpen] = useState<boolean>(false);

  // ATTACHMENTS STORE
  const [chatFiles, setChatFiles] = useState<ChatFile[]>([]);
  const [chatImages, setChatImages] = useState<MessageImage[]>([]);
  const [newMessageFiles, setNewMessageFiles] = useState<ChatFile[]>([]);
  const [newMessageImages, setNewMessageImages] = useState<MessageImage[]>([]);
  const [showFilesDisplay, setShowFilesDisplay] = useState<boolean>(false);

  // RETRIEVAL STORE
  const [useRetrieval, setUseRetrieval] = useState<boolean>(false);
  const [sourceCount, setSourceCount] = useState<number>(4);

  // TOOL STORE
  const [selectedTools, setSelectedTools] = useState<Tables<"tools">[]>([]);
  const [toolInUse, setToolInUse] = useState<string>("none");

  useEffect(() => {
    const fetchExistingSession = async () => {
      if (!initialSession) {
        router.push("/login");
        return;
      }

      const user = initialSession.user;
      const profile = await getProfileByUserId(user.id);
      setProfile(profile);

      if (!profile?.has_onboarded) {
        router.push("/setup");
        return;
      }

      const hostedModelRes = await fetchHostedModels(profile);
      if (hostedModelRes) {
        setEnvKeyMap(hostedModelRes.envKeyMap);
        setAvailableHostedModels(hostedModelRes.hostedModels);

        if (profile.openrouter_api_key || hostedModelRes.envKeyMap["openrouter"]) {
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
        if (workspace.image_path) {
          const imageUrl = await getWorkspaceImageFromStorage(workspace.image_path);
          if (imageUrl) {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const base64 = await convertBlobToBase64(blob);
            setWorkspaceImages(prev => [
              ...prev,
              { workspaceId: workspace.id, path: workspace.image_path, base64, url: imageUrl }
            ]);
          }
        }
      }
    };

    fetchExistingSession();
  }, [initialSession, router]);

  return (
    <ChatbotUIContext.Provider
      value={{
        profile, setProfile,
        assistants, setAssistants,
        collections, setCollections,
        chats, setChats,
        files, setFiles,
        folders, setFolders,
        models, setModels,
        presets, setPresets,
        prompts, setPrompts,
        tools, setTools,
        workspaces, setWorkspaces,
        envKeyMap, setEnvKeyMap,
        availableHostedModels, setAvailableHostedModels,
        availableLocalModels, setAvailableLocalModels,
        availableOpenRouterModels, setAvailableOpenRouterModels,
        selectedWorkspace, setSelectedWorkspace,
        workspaceImages, setWorkspaceImages,
        selectedPreset, setSelectedPreset,
        selectedAssistant, setSelectedAssistant,
        assistantImages, setAssistantImages,
        openaiAssistants, setOpenaiAssistants,
        userInput, setUserInput,
        selectedChat, setSelectedChat,
        chatMessages, setChatMessages,
        chatSettings, setChatSettings,
        chatFileItems, setChatFileItems,
        abortController, setAbortController,
        firstTokenReceived, setFirstTokenReceived,
        isGenerating, setIsGenerating,
        isPromptPickerOpen, setIsPromptPickerOpen,
        slashCommand, setSlashCommand,
        isFilePickerOpen, setIsFilePickerOpen,
        hashtagCommand, setHashtagCommand,
        isToolPickerOpen, setIsToolPickerOpen,
        toolCommand, setToolCommand,
        focusPrompt, setFocusPrompt,
        focusFile, setFocusFile,
        focusTool, setFocusTool,
        focusAssistant, setFocusAssistant,
        atCommand, setAtCommand,
        isAssistantPickerOpen, setIsAssistantPickerOpen,
        chatFiles, setChatFiles,
        chatImages, setChatImages,
        newMessageFiles, setNewMessageFiles,
        newMessageImages, setNewMessageImages,
        showFilesDisplay, setShowFilesDisplay,
        useRetrieval, setUseRetrieval,
        sourceCount, setSourceCount,
        selectedTools, setSelectedTools,
        toolInUse, setToolInUse
      }}
    >
      {children}
    </ChatbotUIContext.Provider>
  );
};