"use client";

import { Dispatch, SetStateAction, createContext, FC, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

interface ChatbotUIContext {
  // PROFILE STORE
  profile: Tables<"profiles"> | null
  setProfile: Dispatch<SetStateAction<Tables<"profiles"> | null>>

  // ITEMS STORE
  assistants: Tables<"assistants">[]
  setAssistants: Dispatch<SetStateAction<Tables<"assistants">[]>>
  collections: Tables<"collections">[]
  setCollections: Dispatch<SetStateAction<Tables<"collections">[]>>
  chats: Tables<"chats">[]
  setChats: Dispatch<SetStateAction<Tables<"chats">[]>>
  files: Tables<"files">[]
  setFiles: Dispatch<SetStateAction<Tables<"files">[]>>
  folders: Tables<"folders">[]
  setFolders: Dispatch<SetStateAction<Tables<"folders">[]>>
  models: Tables<"models">[]
  setModels: Dispatch<SetStateAction<Tables<"models">[]>>
  presets: Tables<"presets">[]
  setPresets: Dispatch<SetStateAction<Tables<"presets">[]>>
  prompts: Tables<"prompts">[]
  setPrompts: Dispatch<SetStateAction<Tables<"prompts">[]>>
  tools: Tables<"tools">[]
  setTools: Dispatch<SetStateAction<Tables<"tools">[]>>
  workspaces: Tables<"workspaces">[]
  setWorkspaces: Dispatch<SetStateAction<Tables<"workspaces">[]>>

  // MODELS STORE
  envKeyMap: Record<string, VALID_ENV_KEYS>
  setEnvKeyMap: Dispatch<SetStateAction<Record<string, VALID_ENV_KEYS>>>
  availableHostedModels: LLM[]
  setAvailableHostedModels: Dispatch<SetStateAction<LLM[]>>
  availableLocalModels: LLM[]
  setAvailableLocalModels: Dispatch<SetStateAction<LLM[]>>
  availableOpenRouterModels: OpenRouterLLM[]
  setAvailableOpenRouterModels: Dispatch<SetStateAction<OpenRouterLLM[]>>

  // WORKSPACE STORE
  selectedWorkspace: Tables<"workspaces"> | null
  setSelectedWorkspace: Dispatch<SetStateAction<Tables<"workspaces"> | null>>
  workspaceImages: WorkspaceImage[]
  setWorkspaceImages: Dispatch<SetStateAction<WorkspaceImage[]>>

  // PRESET STORE
  selectedPreset: Tables<"presets"> | null
  setSelectedPreset: Dispatch<SetStateAction<Tables<"presets"> | null>>

  // ASSISTANT STORE
  selectedAssistant: Tables<"assistants"> | null
  setSelectedAssistant: Dispatch<SetStateAction<Tables<"assistants"> | null>>
  assistantImages: AssistantImage[]
  setAssistantImages: Dispatch<SetStateAction<AssistantImage[]>>
  openaiAssistants: any[]
  setOpenaiAssistants: Dispatch<SetStateAction<any[]>>

  // PASSIVE CHAT STORE
  userInput: string
  setUserInput: Dispatch<SetStateAction<string>>
  chatMessages: ChatMessage[]
  setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>
  chatSettings: ChatSettings | null
  setChatSettings: Dispatch<SetStateAction<ChatSettings | null>>
  selectedChat: Tables<"chats"> | null
  setSelectedChat: Dispatch<SetStateAction<Tables<"chats"> | null>>
  chatFileItems: Tables<"file_items">[]
  setChatFileItems: Dispatch<SetStateAction<Tables<"file_items">[]>>

  // ACTIVE CHAT STORE
  abortController: AbortController | null
  setAbortController: Dispatch<SetStateAction<AbortController | null>>
  firstTokenReceived: boolean
  setFirstTokenReceived: Dispatch<SetStateAction<boolean>>
  isGenerating: boolean
  setIsGenerating: Dispatch<SetStateAction<boolean>>

  // CHAT INPUT COMMAND STORE
  isPromptPickerOpen: boolean
  setIsPromptPickerOpen: Dispatch<SetStateAction<boolean>>
  slashCommand: string
  setSlashCommand: Dispatch<SetStateAction<string>>
  isFilePickerOpen: boolean
  setIsFilePickerOpen: Dispatch<SetStateAction<boolean>>
  hashtagCommand: string
  setHashtagCommand: Dispatch<SetStateAction<string>>
  isToolPickerOpen: boolean
  setIsToolPickerOpen: Dispatch<SetStateAction<boolean>>
  toolCommand: string
  setToolCommand: Dispatch<SetStateAction<string>>
  focusPrompt: boolean
  setFocusPrompt: Dispatch<SetStateAction<boolean>>
  focusFile: boolean
  setFocusFile: Dispatch<SetStateAction<boolean>>
  focusTool: boolean
  setFocusTool: Dispatch<SetStateAction<boolean>>
  focusAssistant: boolean
  setFocusAssistant: Dispatch<SetStateAction<boolean>>
  atCommand: string
  setAtCommand: Dispatch<SetStateAction<string>>
  isAssistantPickerOpen: boolean
  setIsAssistantPickerOpen: Dispatch<SetStateAction<boolean>>

  // ATTACHMENTS STORE
  chatFiles: ChatFile[]
  setChatFiles: Dispatch<SetStateAction<ChatFile[]>>
  chatImages: MessageImage[]
  setChatImages: Dispatch<SetStateAction<MessageImage[]>>
  newMessageFiles: ChatFile[]
  setNewMessageFiles: Dispatch<SetStateAction<ChatFile[]>>
  newMessageImages: MessageImage[]
  setNewMessageImages: Dispatch<SetStateAction<MessageImage[]>>
  showFilesDisplay: boolean
  setShowFilesDisplay: Dispatch<SetStateAction<boolean>>

  // RETRIEVAL STORE
  useRetrieval: boolean
  setUseRetrieval: Dispatch<SetStateAction<boolean>>
  sourceCount: number
  setSourceCount: Dispatch<SetStateAction<number>>

  // TOOL STORE
  selectedTools: Tables<"tools">[]
  setSelectedTools: Dispatch<SetStateAction<Tables<"tools">[]>>
  toolInUse: string
  setToolInUse: Dispatch<SetStateAction<string>>
}

export const ChatbotUIContext = createContext<ChatbotUIContext>({
  // PROFILE STORE
  profile: null,
  setProfile: () => {},

  // ITEMS STORE
  assistants: [],
  setAssistants: () => {},
  collections: [],
  setCollections: () => {},
  chats: [],
  setChats: () => {},
  files: [],
  setFiles: () => {},
  folders: [],
  setFolders: () => {},
  models: [],
  setModels: () => {},
  presets: [],
  setPresets: () => {},
  prompts: [],
  setPrompts: () => {},
  tools: [],
  setTools: () => {},
  workspaces: [],
  setWorkspaces: () => {},

  // MODELS STORE
  envKeyMap: {},
  setEnvKeyMap: () => {},
  availableHostedModels: [],
  setAvailableHostedModels: () => {},
  availableLocalModels: [],
  setAvailableLocalModels: () => {},
  availableOpenRouterModels: [],
  setAvailableOpenRouterModels: () => {},

  // WORKSPACE STORE
  selectedWorkspace: null,
  setSelectedWorkspace: () => {},
  workspaceImages: [],
  setWorkspaceImages: () => {},

  // PRESET STORE
  selectedPreset: null,
  setSelectedPreset: () => {},

  // ASSISTANT STORE
  selectedAssistant: null,
  setSelectedAssistant: () => {},
  assistantImages: [],
  setAssistantImages: () => {},
  openaiAssistants: [],
  setOpenaiAssistants: () => {},

  // PASSIVE CHAT STORE
  userInput: "",
  setUserInput: () => {},
  chatMessages: [],
  setChatMessages: () => {},
  chatSettings: null,
  setChatSettings: () => {},
  selectedChat: null,
  setSelectedChat: () => {},
  chatFileItems: [],
  setChatFileItems: () => {},

  // ACTIVE CHAT STORE
  abortController: null,
  setAbortController: () => {},
  firstTokenReceived: false,
  setFirstTokenReceived: () => {},
  isGenerating: false,
  setIsGenerating: () => {},

  // CHAT INPUT COMMAND STORE
  isPromptPickerOpen: false,
  setIsPromptPickerOpen: () => {},
  slashCommand: "",
  setSlashCommand: () => {},
  isFilePickerOpen: false,
  setIsFilePickerOpen: () => {},
  hashtagCommand: "",
  setHashtagCommand: () => {},
  isToolPickerOpen: false,
  setIsToolPickerOpen: () => {},
  toolCommand: "",
  setToolCommand: () => {},
  focusPrompt: false,
  setFocusPrompt: () => {},
  focusFile: false,
  setFocusFile: () => {},
  focusTool: false,
  setFocusTool: () => {},
  focusAssistant: false,
  setFocusAssistant: () => {},
  atCommand: "",
  setAtCommand: () => {},
  isAssistantPickerOpen: false,
  setIsAssistantPickerOpen: () => {},

  // ATTACHMENTS STORE
  chatFiles: [],
  setChatFiles: () => {},
  chatImages: [],
  setChatImages: () => {},
  newMessageFiles: [],
  setNewMessageFiles: () => {},
  newMessageImages: [],
  setNewMessageImages: () => {},
  showFilesDisplay: false,
  setShowFilesDisplay: () => {},

  // RETRIEVAL STORE
  useRetrieval: false,
  setUseRetrieval: () => {},
  sourceCount: 4,
  setSourceCount: () => {},

  // TOOL STORE
  selectedTools: [],
  setSelectedTools: () => {},
  toolInUse: "none",
  setToolInUse: () => {}
})

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

