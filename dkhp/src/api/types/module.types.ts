export interface Module {
  id: string;
  code: string;
  name: string;
  credits: number;
  prerequisiteModules?: string[];
  description?: string;
  department: string;
}

export interface CreateModuleRequest {
  code: string;
  name: string;
  credits: number;
  prerequisiteModules?: string[];
  description?: string;
  department: string;
}

export interface UpdateModuleRequest {
  id: string;
  code?: string;
  name?: string;
  credits?: number;
  prerequisiteModules?: string[];
  description?: string;
  department?: string;
}

export interface ModuleResponse {
  success: boolean;
  data: Module;
  message?: string;
}